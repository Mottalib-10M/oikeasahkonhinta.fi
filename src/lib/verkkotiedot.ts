/**
 * Chiffres d'un réseau pour sa page : coût annuel de chaque produit pour trois profils types
 * (kerrostalo 2 000 kWh, omakotitalo 5 000 kWh, sähkölämmitys 18 000 kWh talvipainotteinen),
 * consommation d'équilibre entre produits, rang parmi les réseaux, prix réel du jour de build.
 * Le texte de chaque page reste écrit à la main ; ces valeurs ne font que l'alimenter.
 */
import * as M from './engine/index';
import { SPOT } from './spot-data';
import { porssi, SARJA, jarjestys, PAIVA } from './arvot';
import type { Helpers } from './guide-types';

export const PROFIILIT = [
  { id: 'K', kwh: 2000, sulake: 'kt' as M.Sulake, profiili: 'tasainen' as M.Profiili },
  { id: 'L1', kwh: 5000, sulake: '3x25' as M.Sulake, profiili: 'tasainen' as M.Profiili },
  { id: 'L2', kwh: 18000, sulake: '3x25' as M.Sulake, profiili: 'lammitys' as M.Profiili },
];
const kk12 = () => M.viimeiset12(SPOT.kuukaudet, `${PAIVA.slice(0, 7)}-01`).kk;

export function verkkoTiedot(id: string) {
  const v = M.verkko(id)!;
  const kk = kk12();
  const yleis = M.tuote(v, 'yleis')!;
  const aika = M.tuote(v, 'aika');
  const kausi = M.tuote(v, 'kausi');
  const vuosi = (tu: M.Tuote, kwh: number, s: M.Sulake, p: M.Profiili) => M.verkkoVuosi(tu, s, kwh, p, kk, 5);
  const taulu = PROFIILIT.map((p) => ({ p, arvot: v.tuotteet.map((tu) => ({ tu, e: vuosi(tu, p.kwh, p.sulake, p.profiili) })) }));
  /** Consommation annuelle (3 × 25 A, talvipainotteinen) à partir de laquelle `b` devient moins cher que yleis. */
  const tasapaino = (b?: M.Tuote) => {
    if (!b) return null;
    const a0 = vuosi(yleis, 0, '3x25', 'lammitys'), a1 = vuosi(yleis, 10000, '3x25', 'lammitys');
    const b0 = vuosi(b, 0, '3x25', 'lammitys'), b1 = vuosi(b, 10000, '3x25', 'lammitys');
    const ka = (a1 - a0) / 10000, kb = (b1 - b0) / 10000;
    if (kb >= ka) return null;
    return Math.round((b0 - a0) / (ka - kb) / 100) * 100;
  };
  const sija5 = jarjestys(5000, '3x25').findIndex((x) => x.v.id === id) + 1;
  const sija2 = jarjestys(2000, 'kt').findIndex((x) => x.v.id === id) + 1;
  const q = M.vartit(SARJA, yleis, porssi);
  const paiva = M.tilasto(q.map((x) => x.yhteensa));
  const qa = aika ? M.vartit(SARJA, aika, porssi) : null;
  const paivaAika = qa ? M.tilasto(qa.map((x) => x.yhteensa)) : null;
  return { v, yleis, aika, kausi, taulu, tasapainoAika: tasapaino(aika), tasapainoKausi: tasapaino(kausi), sija5, sija2, n: M.VERKOT.length, paiva, paivaAika, vuosi, arvio: SARJA.tila !== 'toteutunut' };
}
export type VerkkoTiedot = ReturnType<typeof verkkoTiedot>;

/** Tableau commun des pages réseau : coût annuel du transport par produit et profil (données, pas de prose). */
export function vuosiTaulukko(h: Helpers, t: VerkkoTiedot) {
  const fi = h.lang === 'fi';
  const nimi = { K: fi ? 'Kerrostalo, 2 000 kWh' : 'Flat, 2,000 kWh', L1: fi ? 'Omakotitalo 3 × 25 A, 5 000 kWh' : 'House 3 × 25 A, 5,000 kWh', L2: fi ? 'Sähkölämmitys 3 × 25 A, 18 000 kWh' : 'Electric heating 3 × 25 A, 18,000 kWh' } as Record<string, string>;
  const rows = t.taulu.map((r) => {
    const min = Math.min(...r.arvot.map((a) => a.e));
    return [nimi[r.p.id], ...r.arvot.map((a) => (a.e === min ? `<strong>${h.eur(a.e, 0)}</strong>` : h.eur(a.e, 0)))];
  });
  return h.table([fi ? 'Käyttäjä' : 'User', ...t.v.tuotteet.map((tu) => tu.nimi)], rows,
    fi ? `${t.v.lyhyt}: siirron vuosikustannus (siirtomaksu + perusmaksu${t.aika?.teho ? ' + tehomaksu 5 kW huipulla' : ''}), € sis. alv. Lihavoitu on edullisin tuote. Sähkövero ${h.c(h.M.VERO_C, 4)} tulee lisäksi.` : `${t.v.lyhyt}: annual transfer cost (transfer fee + basic fee${t.aika?.teho ? ' + power fee at a 5 kW peak' : ''}), € incl. VAT. Bold is the cheapest product. Electricity tax of ${h.c(h.M.VERO_C, 4)} comes on top.`,
    ['l', ...t.v.tuotteet.map(() => 'r' as const)]);
}
/** Tableau des prix unitaires du réseau (perusmaksu par calibre, siirtomaksu par période). */
export function hintaTaulukko(h: Helpers, t: VerkkoTiedot) {
  const fi = h.lang === 'fi';
  const e = (tu: M.Tuote) => {
    const x = tu.energia;
    if (tu.tyyppi === 'aika') return `${fi ? 'päivä' : 'day'} ${h.c(x.paiva!, 3)} · ${fi ? 'yö' : 'night'} ${h.c(x.yo!, 3)}`;
    if (tu.tyyppi === 'kausi') return `${fi ? 'talviarki' : 'winter weekday'} ${h.c(x.talvipaiva!, 3)} · ${fi ? 'muu' : 'other'} ${h.c(x.muu!, 3)}`;
    return h.c(x.kaikki!, 3);
  };
  const rows = t.v.tuotteet.map((tu) => [tu.nimi, e(tu), h.eur(h.M.perusKk(tu, 'kt')), h.eur(h.M.perusKk(tu, '3x25')), h.eur(h.M.perusKk(tu, '3x35')), tu.teho ? `${h.num(tu.teho.eurKwKk, 2)} €/kW` : '–']);
  return h.table([fi ? 'Tuote' : 'Product', fi ? 'Siirtomaksu' : 'Transfer fee', fi ? 'Perusmaksu, kerrostalo' : 'Basic fee, flat', fi ? 'Perus 3 × 25 A' : 'Basic 3 × 25 A', fi ? 'Perus 3 × 35 A' : 'Basic 3 × 35 A', fi ? 'Tehomaksu/kk' : 'Power fee/month'], rows,
    fi ? `Hinnasto ${t.v.voimassa ? `voimassa ${h.date(t.v.voimassa)} alkaen` : 'voimassa'}, ${h.src(t.v.id, 'yhtiön oma hinnasto')}, sis. alv 25,5 %, €/kk. Kun kerrostalohintaa ei ole, käytetään lähintä sulaketta.` : `Price list ${t.v.voimassa ? `in force from ${h.date(t.v.voimassa)}` : 'in force'}, ${h.src(t.v.id, 'the operator’s own price list')}, incl. 25.5% VAT, € per month. Where no flat rate exists the nearest fuse size is used.`,
    ['l', 'r', 'r', 'r', 'r', 'r']);
}
