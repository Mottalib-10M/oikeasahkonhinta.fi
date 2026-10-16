/**
 * Jours fériés officiels de Finlande (pyhäpäivät), calculés pour n'importe quelle année :
 * uudenvuodenpäivä 1.1., loppiainen 6.1., pitkäperjantai, pääsiäispäivä, 2. pääsiäispäivä,
 * vappu 1.5., helatorstai (pâques + 39 j), helluntaipäivä (pâques + 49 j), juhannuspäivä (samedi
 * du 20 au 26.6.), pyhäinpäivä (samedi du 31.10. au 6.11.), itsenäisyyspäivä 6.12., joulupäivä
 * 25.12., tapaninpäivä 26.12. Liste : Pohjoismaiden ministerineuvosto, « Suomen pyhäpäivät »
 * (source `pyhat` de params-2026.json, lue le 2026-10-16 via sa copie web.archive.org du 2024-09-08, le site répondant 403 aux robots ; pyhäinpäivä = samedi entre le 31.10. et le 6.11.). Les veilles (jouluaatto, juhannusaatto) n'en font pas partie.
 */
const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const plus = (y: number, m: number, d: number, n: number) => { const t = new Date(Date.UTC(y, m - 1, d + n)); return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()); };
/** Dimanche de Pâques (calendrier grégorien, algorithme de Meeus/Jones/Butcher) : [mois, jour]. */
export function paasiainen(y: number): [number, number] {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const kk = Math.floor((h + l - 7 * m + 114) / 31), pv = ((h + l - 7 * m + 114) % 31) + 1;
  return [kk, pv];
}
/** Samedi compris entre le jour `d` du mois `m` et les 6 jours suivants. */
const lauantai = (y: number, m: number, d: number) => { const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); return plus(y, m, d, (6 - w + 7) % 7); };
const CACHE = new Map<number, Map<string, { fi: string; en: string }>>();
/** Jours fériés d'une année : date AAAA-MM-JJ → nom fi / en. */
export function pyhapaivat(y: number): Map<string, { fi: string; en: string }> {
  const c = CACHE.get(y); if (c) return c;
  const [pm, pd] = paasiainen(y);
  const out = new Map<string, { fi: string; en: string }>([
    [iso(y, 1, 1), { fi: 'uudenvuodenpäivä', en: 'New Year’s Day' }],
    [iso(y, 1, 6), { fi: 'loppiainen', en: 'Epiphany' }],
    [plus(y, pm, pd, -2), { fi: 'pitkäperjantai', en: 'Good Friday' }],
    [iso(y, pm, pd), { fi: 'pääsiäispäivä', en: 'Easter Sunday' }],
    [plus(y, pm, pd, 1), { fi: '2. pääsiäispäivä', en: 'Easter Monday' }],
    [iso(y, 5, 1), { fi: 'vappu', en: 'May Day' }],
    [plus(y, pm, pd, 39), { fi: 'helatorstai', en: 'Ascension Day' }],
    [plus(y, pm, pd, 49), { fi: 'helluntaipäivä', en: 'Whit Sunday' }],
    [lauantai(y, 6, 20), { fi: 'juhannuspäivä', en: 'Midsummer Day' }],
    [lauantai(y, 10, 31), { fi: 'pyhäinpäivä', en: 'All Saints’ Day' }],
    [iso(y, 12, 6), { fi: 'itsenäisyyspäivä', en: 'Independence Day' }],
    [iso(y, 12, 25), { fi: 'joulupäivä', en: 'Christmas Day' }],
    [iso(y, 12, 26), { fi: 'tapaninpäivä', en: 'Boxing Day' }],
  ]);
  CACHE.set(y, out);
  return out;
}
/** Le jour civil `pvm` (AAAA-MM-JJ) est-il un jour férié officiel ? */
export const onPyha = (pvm: string) => pyhapaivat(Number(pvm.slice(0, 4))).has(pvm);
/** Nom du jour férié, ou null. */
export const pyhanNimi = (pvm: string, lang: 'fi' | 'en' = 'fi') => pyhapaivat(Number(pvm.slice(0, 4))).get(pvm)?.[lang] ?? null;
