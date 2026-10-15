/** Paramètres 2026 du site, lus une seule fois depuis `data/params-2026.json` (RECETTE §4). */
import raw from '../../data/params-2026.json';
export interface Source { url: string; label: { fi: string; en: string } }
export const P = raw as typeof raw & { sources: Record<string, Source> };
export type Params = typeof P;
export type SourceKey = string;
/** Sähkövero luokka I + huoltovarmuusmaksu, c/kWh sans TVA puis TVA comprise. */
export const VERO_VEROTON = Math.round((P.vero.sahkovero_I_c + P.vero.huoltovarmuus_c) * 1e6) / 1e6;
export const VERO_C = Math.round(VERO_VEROTON * (1 + P.vero.alv) * 1e6) / 1e6;
export const ALV = P.vero.alv;
