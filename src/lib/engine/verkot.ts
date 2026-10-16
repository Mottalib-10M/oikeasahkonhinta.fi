/**
 * Tarifs de transport (siirto) des gestionnaires de réseau, TVA 25,5 % comprise, tels que publiés
 * par chaque verkkoyhtiö (src/data/verkot-2026.json, vérifié par scripts/data/tarkista-verkot.py).
 * Chaque produit aika / kausi porte sa propre définition des plages (`ajat`), recopiée du hinnasto :
 * heures, jours, mois et traitement des jours fériés (arkipyhät, calendrier officiel de pyhat.ts).
 */
import data from '../../data/verkot-2026.json';
import { paikallinen, hkiPvm } from './aika';
import { onPyha } from './pyhat';

export type Tyyppi = 'yleis' | 'aika' | 'kausi';
export type Sulake = 'kt' | '1x25' | '3x25' | '3x35';
/**
 * Plage chère d'un produit : heures [début, fin[, jours (« kaikki », « ma-la », « ma-pe »), mois (kausi)
 * et jours fériés : « muu » / « yo » = tarif bas, « talvipaiva » / « paiva » = tarif haut,
 * null = le hinnasto n'en dit rien (la règle des jours de semaine s'applique telle qu'écrite).
 */
export interface Ajat { tunnit?: number[]; paivat?: 'kaikki' | 'ma-la' | 'ma-pe'; kuukaudet?: number[]; pyhat?: 'muu' | 'yo' | 'talvipaiva' | 'paiva' | null; lainaus: string; lahde?: string;
  /** true : heures définies en heure normale (UTC+2) toute l'année, sans passage à l'heure d'été (ex. KSS Verkko : 08–23 en été). */
  normaaliaika?: boolean }
export interface Tuote {
  tyyppi: Tyyppi; nimi: string;
  perus?: Partial<Record<Sulake, number>>; perusVuosi?: Partial<Record<Sulake, number>>;
  energia: { kaikki?: number; paiva?: number; yo?: number; talvipaiva?: number; muu?: number };
  teho?: { eurKwKk: number; fi: string; en: string };
  ajat?: Ajat;
  /** « kt » : produit réservé aux logements collectifs (rivi-, pari- ou kerrostalo) selon le hinnasto. */
  kohde?: 'kt';
}
export interface Asiakkaat { maara: number; vuosi: number; lahde: string; lainaus: string }
export interface Verkko {
  id: string; nimi: string; lyhyt: string; alue: { fi: string; en: string }; voimassa: string | null; lahde: string; haettu?: string;
  ev: string[]; tuotteet: Tuote[]; asiakkaat?: Asiakkaat | null; huom?: { fi: string; en: string }; sivu?: string;
}
/** Réseaux triés par nombre de clients publié (les plus grands d'abord), puis par nom. */
export const VERKOT = [...(data.verkot as Verkko[])].sort((a, b) => (b.asiakkaat?.maara ?? 0) - (a.asiakkaat?.maara ?? 0) || a.lyhyt.localeCompare(b.lyhyt, 'fi'));
export const TARIFFI_HAETTU = data.retrieved_at;
/** Une page propre est réservée aux réseaux d'au moins 30 000 clients publiés (asiakkaat) ; les autres sont dans les calculateurs et le comparatif. */
export const SIVU_KYNNYS = 30_000;
export const SULAKKEET: Sulake[] = ['kt', '3x25', '3x35'];
export const verkko = (id: string) => VERKOT.find((v) => v.id === id);
/** Premier produit d'un type (pages réseau) ; les calculateurs choisissent par indice dans `tuotteet`. */
export const tuote = (v: Verkko, t: Tyyppi) => v.tuotteet.find((x) => x.tyyppi === t);
export const onTeho = (tu: Tuote) => !!tu.teho;
/** Le produit est-il proposé pour ce logement / calibre ? (« kt » = logement collectif seulement.) */
export const sopiiSulakkeelle = (tu: Tuote, s: Sulake) => !tu.kohde || (s === 'kt');
/** Produits proposés pour un calibre, dans l'ordre du hinnasto (tous si aucun ne convient). */
export function tuotteetSulakkeelle(v: Verkko, s: Sulake): Tuote[] {
  const t = v.tuotteet.filter((tu) => sopiiSulakkeelle(tu, s));
  return t.length ? t : v.tuotteet;
}
/** Réseaux qui ont au moins un produit grand public avec tehomaksu. */
export const tehoVerkot = () => VERKOT.filter((v) => v.tuotteet.some((t) => t.teho));

/** Perusmaksu €/kk pour un calibre ; repli sur le calibre le plus proche publié (kt → 1x25 → 3x25). */
export function perusKk(t: Tuote, s: Sulake): number {
  const order: Sulake[] = s === 'kt' ? ['kt', '1x25', '3x25'] : s === '1x25' ? ['1x25', 'kt', '3x25'] : s === '3x35' ? ['3x35', '3x25'] : ['3x25', '1x25', 'kt'];
  for (const k of order) {
    if (t.perus?.[k] !== undefined) return t.perus[k]!;
    if (t.perusVuosi?.[k] !== undefined) return t.perusVuosi[k]! / 12;
  }
  return 0;
}
const TALVI = [11, 12, 1, 2, 3];
/** Valeurs par défaut quand le produit ne précise rien : jour 07–22 tous les jours ; talviarkipäivä 1.11.–31.3. ma–la 07–22. */
export function ajatOf(tu: Tuote): Required<Omit<Ajat, 'lainaus' | 'lahde'>> {
  const a = tu.ajat;
  return {
    tunnit: a?.tunnit ?? [7, 22],
    paivat: a?.paivat ?? (tu.tyyppi === 'kausi' ? 'ma-la' : 'kaikki'),
    kuukaudet: tu.tyyppi === 'kausi' ? a?.kuukaudet ?? TALVI : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    pyhat: a?.pyhat ?? null,
    normaaliaika: a?.normaaliaika ?? false,
  };
}
/** Le créneau qui commence à `t` (UTC ms) est-il dans la plage chère (päivä / talvipäivä) du produit ? */
export function kalliiAika(tu: Tuote, t: number): boolean {
  const a = ajatOf(tu);
  const l = paikallinen(t);
  // Heure normale : en été (UTC+3) l'heure du compteur a une heure de retard sur l'heure légale.
  const tunti = a.normaaliaika && (l.tunti - new Date(t).getUTCHours() + 24) % 24 === 3 ? (l.tunti + 23) % 24 : l.tunti;
  if (tunti < a.tunnit[0] || tunti >= a.tunnit[1]) return false;
  if (!a.kuukaudet.includes(l.kuukausi)) return false;
  if (a.paivat === 'ma-la' && l.viikonpaiva === 0) return false;
  if (a.paivat === 'ma-pe' && (l.viikonpaiva === 0 || l.viikonpaiva === 6)) return false;
  if ((a.pyhat === 'muu' || a.pyhat === 'yo') && onPyha(hkiPvm(t))) return false;
  return true;
}
/** Siirtomaksu c/kWh (TVA comprise) du créneau qui commence à l'instant `t` (UTC ms). */
export function siirtoC(tu: Tuote, t: number): number {
  const e = tu.energia;
  if (tu.tyyppi === 'aika') return kalliiAika(tu, t) ? e.paiva! : e.yo!;
  if (tu.tyyppi === 'kausi') return kalliiAika(tu, t) ? e.talvipaiva! : e.muu!;
  return e.kaikki!;
}
/** Verkko « muu » : tarif saisi par l'utilisateur (c/kWh et €/kk, TVA comprise). */
export const omaTuote = (c: number, kk: number): Tuote => ({ tyyppi: 'yleis', nimi: 'oma', perus: { kt: kk, '1x25': kk, '3x25': kk, '3x35': kk }, energia: { kaikki: c } });
