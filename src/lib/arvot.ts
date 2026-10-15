/**
 * Valeurs de build partagées par les textes : le jour de référence (date du build), sa série de prix
 * (publiée ou estimée), et quelques calculs du moteur réutilisés d'une page à l'autre. Tout chiffre
 * cité dans une page vient d'ici ou du moteur, jamais d'une saisie à la main.
 */
import * as M from './engine/index';
import { SPOT } from './spot-data';
import sop from '../data/sopimukset.json';
import tk from '../data/tilastokeskus.json';

export const MARG = sop.marginaaliMediaani ?? 0;
export const PERUS_MYYJA = sop.perusmaksuMediaani ?? 0;
export const SOP_N = sop.n;
const tkV = tk.kotitalousD.kuukaudet.at(-1)!;
export const KIINTEA_OLETUS = Math.round(tkV.energiaVeroton * (1 + M.ALV) * 100) / 100;
export const TK_KK = tkV.kk;
export const TK_KOKONAIS = tkV.kokonais;

export const PAIVA = SPOT.tanaan;
export const SARJA = M.sarja(SPOT, PAIVA);
export const porssi = { tyyppi: 'porssi' as const, marginaali: MARG, kiintea: 0 };

/** Statistiques du jour de référence pour un réseau / produit, contrat pörssi à la marge médiane. */
export function paivaVerkossa(verkko: string, tyyppi: M.Tyyppi = 'yleis') {
  const tu = M.tuote(M.verkko(verkko)!, tyyppi)!;
  const q = M.vartit(SARJA, tu, porssi);
  const tot = q.map((x) => x.yhteensa);
  const st = M.tilasto(tot);
  const spot = M.tilasto(q.map((x) => x.spot));
  const ik2 = M.halvinIkkuna(tot, 8);
  return { tu, q, st, spot, ik2, kello: (i: number) => (i >= 0 && q[i] ? M.kello(q[i].t) : '') };
}
/** Moyenne spot TVA comprise des 12 derniers mois publiés. */
export function vuosiKa() {
  const v = M.viimeiset12(SPOT.kuukaudet, `${PAIVA.slice(0, 7)}-01`);
  const ka = v.spot.reduce((a, b) => a + b, 0) / Math.max(1, v.spot.length);
  return { ...v, ka, kaC: M.spotC(ka) };
}
/** Écart moyen (c/kWh, €/MWh) de chaque heure à la moyenne du jour, jours ouvrés archivés. */
export function tuntiProfiili(w: 'arki' | 'vkl' = 'arki') {
  const p = SPOT.arvio.profiili[w];
  if (!p) return null;
  const tunnit = M.tunneittain(p.poikkeama);
  const jarj = tunnit.map((x, h) => ({ h, x })).sort((a, b) => a.x - b.x);
  return { paivia: p.paivia, tunnit, halvimmat: jarj.slice(0, 3).map((t) => t.h), kalleimmat: jarj.slice(-3).reverse().map((t) => t.h) };
}
/** Coût annuel du transport d'un réseau (meilleur produit) pour une consommation et un calibre. */
export function verkkoVuodessa(verkko: string, kwh: number, sulake: M.Sulake, profiili: M.Profiili = 'tasainen') {
  const kk = M.viimeiset12(SPOT.kuukaudet, `${PAIVA.slice(0, 7)}-01`).kk;
  const vk = M.verkko(verkko)!;
  const t = vk.tuotteet.map((tu) => ({ tu, e: M.verkkoVuosi(tu, sulake, kwh, profiili, kk) }));
  return { kaikki: t, paras: t.reduce((a, b) => (b.e < a.e ? b : a)) };
}
/** Classement des réseaux par coût annuel du transport (meilleur produit). */
export function jarjestys(kwh: number, sulake: M.Sulake, profiili: M.Profiili = 'tasainen') {
  return M.VERKOT.map((v) => ({ v, ...verkkoVuodessa(v.id, kwh, sulake, profiili) })).sort((a, b) => a.paras.e - b.paras.e);
}
export const tunti = (h: number) => `${String(h).padStart(2, '0')}–${String((h + 1) % 24).padStart(2, '0')}`;
/** Coût d'un usage (E kWh sur D heures) le jour de référence : départ le moins cher, le plus cher, à la moyenne. */
export function laiteHinta(E: number, D: number, verkko = 'helen', tyyppi: M.Tyyppi = 'yleis') {
  const tu = M.tuote(M.verkko(verkko)!, tyyppi)!;
  const q = M.vartit(SARJA, tu, porssi);
  const tot = q.map((x) => x.yhteensa);
  const n = Math.max(1, Math.ceil(D * 4 - 1e-9));
  const kerta = (i: number) => { let s = 0; for (let k = i; k < i + n; k++) s += tot[k]; return ((E / n) * s) / 100; };
  const ik = M.halvinIkkuna(tot, n);
  let maxI = 0; for (let i = 0; i + n <= tot.length; i++) if (kerta(i) > kerta(maxI)) maxI = i;
  const ka = M.tilasto(tot).ka;
  return { halvin: kerta(ik.i), halvinKlo: M.kello(q[ik.i].t), kallein: kerta(maxI), kalleinKlo: M.kello(q[maxI].t), keski: (E * ka) / 100, kaC: ka, siirtoVero: ((tu.energia.kaikki ?? 0) + M.VERO_C) * E / 100 };
}
