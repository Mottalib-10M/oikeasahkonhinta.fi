/**
 * Tarifs de transport (siirto) des gestionnaires de réseau, TVA 25,5 % comprise, tels que publiés
 * par chaque verkkoyhtiö (src/data/verkot-2026.json, vérifié par scripts/data/tarkista-verkot.py).
 */
import data from '../../data/verkot-2026.json';
import { onPaiva, onTalvipaiva } from './aika';

export type Tyyppi = 'yleis' | 'aika' | 'kausi';
export type Sulake = 'kt' | '1x25' | '3x25' | '3x35';
export interface Tuote {
  tyyppi: Tyyppi; nimi: string;
  perus?: Partial<Record<Sulake, number>>; perusVuosi?: Partial<Record<Sulake, number>>;
  energia: { kaikki?: number; paiva?: number; yo?: number; talvipaiva?: number; muu?: number };
  teho?: { eurKwKk: number; fi: string; en: string };
}
export interface Verkko { id: string; nimi: string; lyhyt: string; alue: { fi: string; en: string }; voimassa: string | null; lahde: string; ev: string[]; tuotteet: Tuote[] }
export const VERKOT = data.verkot as Verkko[];
export const TARIFFI_HAETTU = data.retrieved_at;
export const SULAKKEET: Sulake[] = ['kt', '3x25', '3x35'];
export const verkko = (id: string) => VERKOT.find((v) => v.id === id);
export const tuote = (v: Verkko, t: Tyyppi) => v.tuotteet.find((x) => x.tyyppi === t);

/** Perusmaksu €/kk pour un calibre ; repli sur le calibre le plus proche publié (kt → 1x25 → 3x25). */
export function perusKk(t: Tuote, s: Sulake): number {
  const order: Sulake[] = s === 'kt' ? ['kt', '1x25', '3x25'] : s === '1x25' ? ['1x25', 'kt', '3x25'] : s === '3x35' ? ['3x35', '3x25'] : ['3x25', '1x25', 'kt'];
  for (const k of order) {
    if (t.perus?.[k] !== undefined) return t.perus[k]!;
    if (t.perusVuosi?.[k] !== undefined) return t.perusVuosi[k]! / 12;
  }
  return 0;
}
/** Siirtomaksu c/kWh (TVA comprise) du créneau qui commence à l'instant `t` (UTC ms). */
export function siirtoC(tu: Tuote, t: number): number {
  const e = tu.energia;
  if (tu.tyyppi === 'aika') return onPaiva(t) ? e.paiva! : e.yo!;
  if (tu.tyyppi === 'kausi') return onTalvipaiva(t) ? e.talvipaiva! : e.muu!;
  return e.kaikki!;
}
/** Verkko « muu » : tarif saisi par l'utilisateur (c/kWh et €/kk, TVA comprise). */
export const omaTuote = (c: number, kk: number): Tuote => ({ tyyppi: 'yleis', nimi: 'oma', perus: { kt: kk, '1x25': kk, '3x25': kk, '3x35': kk }, energia: { kaikki: c } });
