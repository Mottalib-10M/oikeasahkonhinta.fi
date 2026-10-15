/**
 * Prix spot du jour : la série publiée (archive data/spot, Nord Pool ou ENTSO-E) quand elle existe,
 * sinon l'estimation moyenne construite par scripts/data/rakenna-spot.mjs, toujours signalée comme telle.
 */
import { keskiyo, lisaaPaivia, onViikonloppu, varttejaPaivassa, paikallinen } from './aika';
import { kwhHinta, type Sopimus } from './hinta';
import { siirtoC, type Tuote } from './verkot';

export interface Paiva { lahde: string; alku: string; hinnat: number[]; alustava?: boolean }
export interface Arvio {
  jakso: { alku: string; loppu: string; paivia: number } | null;
  tasoJakso: { alku: string; loppu: string } | null; tasoLahde: string;
  taso: Record<string, number>;
  profiili: Record<string, { paivia: number; poikkeama: number[] }>;
  suora: Record<string, Record<string, { paivia: number; hinnat: number[] }>>;
}
export interface SpotData { paivitetty: string; tanaan: string; paivat: Record<string, Paiva>; arvio: Arvio; kuukaudet: Record<string, { keskiarvo: number; lahde: string }>; paivakeskiarvot: Array<[string, number, number, number]> }

export interface Sarja { pvm: string; tila: 'toteutunut' | 'arvio' | 'puuttuu'; lahde: string; menetelma?: 'suora' | 'taso+profiili'; alku: number; hinnat: number[]; alustava?: boolean }

/** Estimation d'un jour sans prix publié : moyenne directe du même mois et type de jour, sinon niveau mensuel + profil. */
export function arvioPaiva(a: Arvio, pvm: string): Sarja | null {
  const kk = Number(pvm.slice(5, 7)), w = onViikonloppu(pvm) ? 'vkl' : 'arki';
  const alku = keskiyo(pvm), n = varttejaPaivassa(pvm);
  let q: number[] | null = null; let menetelma: Sarja['menetelma'];
  if (a.suora[kk]?.[w]) { q = a.suora[kk][w].hinnat; menetelma = 'suora'; }
  else if (a.taso[kk] !== undefined && a.profiili[w]) { q = a.profiili[w].poikkeama.map((d) => a.taso[kk] + d); menetelma = 'taso+profiili'; }
  if (!q) return null;
  // Jour de 92 ou 100 quarts : chaque créneau prend la valeur de son quart d'heure local.
  const hinnat = Array.from({ length: n }, (_, i) => { const l = paikallinen(alku + i * 900_000); return Math.round(q![l.tunti * 4 + Math.floor(l.minuutti / 15)] * 100) / 100; });
  return { pvm, tila: 'arvio', lahde: 'arvio', menetelma, alku, hinnat };
}
/** Série d'un jour : publiée si disponible, sinon estimation. */
export function sarja(d: SpotData, pvm: string): Sarja {
  const p = d.paivat[pvm];
  if (p && p.hinnat.length) return { pvm, tila: 'toteutunut', lahde: p.lahde, alku: Date.parse(p.alku), hinnat: p.hinnat, alustava: p.alustava };
  return arvioPaiva(d.arvio, pvm) ?? { pvm, tila: 'puuttuu', lahde: '', alku: keskiyo(pvm), hinnat: [] };
}
export const huominen = (pvm: string) => lisaaPaivia(pvm, 1);

export interface Vartti { t: number; spot: number; siirto: number; yhteensa: number; energia: number; vero: number }
/** Prix total TVA comprise de chaque quart d'heure, pour un réseau (produit) et un contrat donnés. */
export function vartit(s: Sarja, tu: Tuote, sop: Sopimus): Vartti[] {
  return s.hinnat.map((eurMwh, i) => {
    const t = s.alku + i * 900_000;
    const o = kwhHinta(eurMwh, siirtoC(tu, t), sop);
    return { t, spot: o.spot, siirto: o.siirto, energia: o.energia, vero: o.vero, yhteensa: o.yhteensa };
  });
}
export interface Tilasto { min: number; minI: number; max: number; maxI: number; ka: number }
export function tilasto(x: number[]): Tilasto {
  if (!x.length) return { min: 0, minI: -1, max: 0, maxI: -1, ka: 0 };
  let minI = 0, maxI = 0;
  x.forEach((v, i) => { if (v < x[minI]) minI = i; if (v > x[maxI]) maxI = i; });
  return { min: x[minI], minI, max: x[maxI], maxI, ka: x.reduce((a, b) => a + b, 0) / x.length };
}
/** Fenêtre contiguë la moins chère de `n` quarts d'heure à partir de l'indice `alkaen` : début et moyenne. */
export function halvinIkkuna(x: number[], n: number, alkaen = 0): { i: number; ka: number } {
  n = Math.max(1, Math.round(n));
  if (x.length - alkaen < n) return { i: -1, ka: 0 };
  let sum = 0; for (let k = alkaen; k < alkaen + n; k++) sum += x[k];
  let best = sum, i = alkaen;
  for (let k = alkaen + n; k < x.length; k++) { sum += x[k] - x[k - n]; if (sum < best) { best = sum; i = k - n + 1; } }
  return { i, ka: best / n };
}
/** Moyenne horaire (4 quarts) d'une série au quart d'heure. */
export const tunneittain = (x: number[]) => Array.from({ length: Math.ceil(x.length / 4) }, (_, h) => { const s = x.slice(h * 4, h * 4 + 4); return s.reduce((a, b) => a + b, 0) / s.length; });
