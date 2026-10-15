/** Petits outils communs aux mini-simulateurs (fichier ignoré par le registre : préfixe « _ »). */
import { formatMoney, formatPercent, formatNumber } from '../format';
import { VERKOT } from '../engine/verkot';
export type L = 'fi' | 'en';
export const T = <A>(l: L, fi: A, en: A) => (l === 'en' ? en : fi);
export const eur = (x: number, l: L, d = 2) => formatMoney(x, d, l);
export const pct = (x: number, l: L, d = 1) => formatPercent(x, d, l);
export const num = (x: number, l: L, d = 0) => formatNumber(x, d, l);
export const c = (x: number, l: L, d = 2) => `${formatNumber(x, d, l)} c/kWh`;
/** Options « verkkoyhtiö » pour un champ `options` : valeur = index dans VERKOT. */
export const verkkoOptions = () => VERKOT.map((v, i) => ({ value: String(i), label: v.lyhyt }));
