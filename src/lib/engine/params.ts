/** Paramètres 2026 du site, lus une seule fois depuis `data/params-2026.json` (RECETTE §4). */
import raw from '../../data/params-2026.json';
import verkot from '../../data/verkot-2026.json';
export interface Source { url: string; label: { fi: string; en: string } }
const fmt = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return { fi: `${d}.${m}.${y}`, en: new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) }; };
/** Chaque hinnasto de réseau devient une source citable par son identifiant (`h.src('turku')`), sauf libellé écrit à la main dans params. */
const verkkoLahteet: Record<string, Source> = Object.fromEntries((verkot.verkot as Array<{ id: string; nimi: string; lahde: string; voimassa: string | null }>).map((v) => [v.id, {
  url: v.lahde,
  label: v.voimassa ? { fi: `${v.nimi}: verkkopalveluhinnasto ${fmt(v.voimassa).fi}`, en: `${v.nimi}: network service price list ${fmt(v.voimassa).en}` } : { fi: `${v.nimi}: verkkopalveluhinnasto`, en: `${v.nimi}: network service price list` },
}]));
export const P = { ...raw, sources: { ...verkkoLahteet, ...raw.sources } } as typeof raw & { sources: Record<string, Source> };
export type Params = typeof P;
export type SourceKey = string;
/** Sähkövero luokka I + huoltovarmuusmaksu, c/kWh sans TVA puis TVA comprise. */
export const VERO_VEROTON = Math.round((P.vero.sahkovero_I_c + P.vero.huoltovarmuus_c) * 1e6) / 1e6;
export const VERO_C = Math.round(VERO_VEROTON * (1 + P.vero.alv) * 1e6) / 1e6;
export const ALV = P.vero.alv;
