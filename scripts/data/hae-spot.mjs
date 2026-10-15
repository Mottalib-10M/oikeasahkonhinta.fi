/**
 * Prix spot day-ahead de la zone FI, archivés par jour civil finlandais (Europe/Helsinki).
 *
 * Usage :
 *   node scripts/data/hae-spot.mjs                 → hier, aujourd'hui et demain (si publiés)
 *   node scripts/data/hae-spot.mjs --alku 2026-08-15 [--loppu 2026-10-16]   → rattrapage
 *   node scripts/data/hae-spot.mjs --kuukaudet    → moyennes mensuelles officielles (12 derniers mois)
 *
 * Sources, dans cet ordre (variable SPOT_LAHTEET, par défaut « entsoe,nordpool ») :
 *   1. ENTSO-E Transparency Platform, document A44 (prix day-ahead), zone 10YFI-1--------U.
 *      Jeton requis : variable d'environnement ENTSOE_TOKEN (secret GitHub du même nom).
 *      Sans jeton, cette source est sautée.
 *   2. Nord Pool, Day-ahead prices (dataportal-api.nordpoolgroup.com), zone FI, EUR, sans jeton.
 *      Ne sert que les ~60 derniers jours et le lendemain dès sa publication (vers 13 h 45, heure de Finlande).
 * Un jour déjà archivé avec un statut définitif n'est pas retéléchargé.
 * Sortie : data/spot/AAAA-MM-JJ.json — { pvm, lahde, resoluutio, haettu, alku, hinnat[€/MWh] }.
 * Aucun prix n'est inventé : un jour sans source reste absent, et le site affiche alors l'estimation
 * moyenne de scripts/data/rakenna-spot.mjs, signalée comme telle.
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';

const DIR = 'data/spot';
mkdirSync(DIR, { recursive: true });
const TOKEN = process.env.ENTSOE_TOKEN || '';
const LAHTEET = (process.env.SPOT_LAHTEET || 'entsoe,nordpool').split(',').map((s) => s.trim()).filter(Boolean);
const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };

/** Date civile d'Helsinki d'un instant. */
const hkiDate = (d) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Helsinki' }).format(d);
const addDays = (iso, n) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
/** Premier instant UTC du jour civil d'Helsinki `iso` (21 h ou 22 h UTC la veille). */
function hkiMidnightUtc(iso) {
  for (const h of [20, 21, 22, 23]) {
    const t = new Date(`${addDays(iso, -1)}T${String(h).padStart(2, '0')}:00:00Z`);
    if (hkiDate(t) === iso && hkiDate(new Date(t.getTime() - 1)) !== iso) return t;
  }
  throw new Error(`minuit introuvable ${iso}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Série de [instant UTC ms, €/MWh] au quart d'heure (une valeur horaire est répétée 4 fois). */
async function nordpool(cetDate) {
  const u = `https://dataportal-api.nordpoolgroup.com/api/DayAheadPrices?date=${cetDate}&market=DayAhead&deliveryArea=FI&currency=EUR`;
  const r = await fetch(u, { headers: { accept: 'application/json' } });
  if (r.status === 204) return { rows: [], final: false };
  if (!r.ok) throw new Error(`Nord Pool ${cetDate} : HTTP ${r.status}`);
  const j = await r.json();
  const rows = [];
  for (const e of j.multiAreaEntries ?? []) {
    const a = Date.parse(e.deliveryStart), b = Date.parse(e.deliveryEnd), v = e.entryPerArea?.FI;
    if (typeof v !== 'number') continue;
    for (let t = a; t < b; t += 900_000) rows.push([t, v]);
  }
  const final = (j.areaStates ?? []).some((s) => s.state === 'Final' && s.areas.includes('FI'));
  return { rows, final };
}

const ymdhm = (d) => d.toISOString().replace(/[-:T]/g, '').slice(0, 12);
async function entsoe(fromUtc, toUtc) {
  const u = `https://web-api.tp.entsoe.eu/api?securityToken=${encodeURIComponent(TOKEN)}&documentType=A44&in_Domain=10YFI-1--------U&out_Domain=10YFI-1--------U&periodStart=${ymdhm(fromUtc)}&periodEnd=${ymdhm(toUtc)}`;
  const r = await fetch(u);
  const x = await r.text();
  if (!r.ok) throw new Error(`ENTSO-E HTTP ${r.status} ${x.slice(0, 200).replace(TOKEN, '***')}`);
  if (/<Acknowledgement_MarketDocument/.test(x)) return [];
  const rows = new Map();
  for (const ts of x.split('<TimeSeries>').slice(1)) {
    for (const per of ts.split('<Period>').slice(1)) {
      const start = Date.parse(per.match(/<start>([^<]+)<\/start>/)[1]);
      const end = Date.parse(per.match(/<end>([^<]+)<\/end>/)[1]);
      const res = per.match(/<resolution>PT(\d+)M<\/resolution>/);
      const step = Number(res ? res[1] : 60) * 60_000;
      const pts = [...per.matchAll(/<position>(\d+)<\/position>\s*<price\.amount>([-\d.]+)<\/price\.amount>/g)].map((m) => [Number(m[1]), Number(m[2])]);
      const byPos = new Map(pts);
      const n = Math.round((end - start) / step);
      let last = null;
      for (let p = 1; p <= n; p++) {
        if (byPos.has(p)) last = byPos.get(p); // courbe A03 : une position absente répète la précédente
        if (last === null) continue;
        for (let t = start + (p - 1) * step; t < start + p * step; t += 900_000) if (!rows.has(t)) rows.set(t, last);
      }
    }
  }
  return [...rows.entries()].sort((a, b) => a[0] - b[0]);
}

function day(iso, rows, lahde) {
  const a = hkiMidnightUtc(iso).getTime(), b = hkiMidnightUtc(addDays(iso, 1)).getTime();
  const m = new Map(rows);
  const hinnat = [];
  for (let t = a; t < b; t += 900_000) { if (!m.has(t)) return null; hinnat.push(Math.round(m.get(t) * 100) / 100); }
  return { pvm: iso, lahde, resoluutio: 15, haettu: new Date().toISOString(), alku: new Date(a).toISOString(), hinnat };
}

async function fetchDays(days) {
  const done = [];
  const pending = days.filter((d) => {
    const f = `${DIR}/${d}.json`;
    return !existsSync(f) || JSON.parse(readFileSync(f, 'utf8')).alustava;
  });
  if (!pending.length) return done;
  for (const src of LAHTEET) {
    const left = pending.filter((d) => !done.includes(d));
    if (!left.length) break;
    try {
      if (src === 'entsoe') {
        if (!TOKEN) { console.log('ENTSO-E : pas de jeton (ENTSOE_TOKEN), source sautée'); continue; }
        // Une requête par bloc de 300 jours au plus (limite de l'API : un an).
        for (let i = 0; i < left.length; i += 300) {
          const chunk = left.slice(i, i + 300);
          const rows = await entsoe(hkiMidnightUtc(chunk[0]), hkiMidnightUtc(addDays(chunk.at(-1), 1)));
          for (const d of chunk) { const o = day(d, rows, 'entsoe'); if (o) { writeFileSync(`${DIR}/${d}.json`, JSON.stringify(o)); done.push(d); } }
        }
      } else if (src === 'nordpool') {
        const cache = new Map();
        for (const d of left) {
          let rows = [], final = true;
          for (const c of [addDays(d, -1), d]) { // jour CET d-1 et d couvrent le jour d'Helsinki
            if (!cache.has(c)) { try { cache.set(c, await nordpool(c)); } catch (e) { cache.set(c, { rows: [], final: false, err: e.message }); } await sleep(250); }
            const v = cache.get(c); rows = rows.concat(v.rows); final = final && v.final;
          }
          const o = day(d, rows, 'nordpool');
          if (o) { if (!final) o.alustava = true; writeFileSync(`${DIR}/${d}.json`, JSON.stringify(o)); done.push(d); }
        }
      }
    } catch (e) { console.log(`${src} : ${e.message}`); }
  }
  return done;
}

if (args.includes('--kuukaudet')) {
  // Moyennes mensuelles officielles de la zone FI (Nord Pool, agrégats), pour l'estimation de secours.
  const now = new Date(); const y = Number(hkiDate(now).slice(0, 4));
  const out = {};
  for (const year of [y - 1, y]) {
    const r = await fetch(`https://dataportal-api.nordpoolgroup.com/api/AggregatePrices?year=${year}&market=DayAhead&deliveryArea=FI&currency=EUR`);
    if (!r.ok) { console.log(`agrégats ${year} : HTTP ${r.status}`); continue; }
    const j = await r.json();
    for (const m of j.multiAreaMonthlyAggregates ?? []) out[m.deliveryStart.slice(0, 7)] = m.averagePerArea.FI;
  }
  writeFileSync('data/kuukausikeskiarvot.json', JSON.stringify({ lahde: 'Nord Pool, Day-ahead aggregate prices, FI, EUR/MWh', haettu: hkiDate(new Date()), kuukaudet: out }, null, 1));
  console.log(`${Object.keys(out).length} mois`);
} else {
  const today = hkiDate(new Date());
  const alku = arg('--alku'), loppu = arg('--loppu') ?? addDays(today, 1);
  const days = [];
  if (alku) { for (let d = alku; d <= loppu; d = addDays(d, 1)) days.push(d); }
  else days.push(addDays(today, -1), today, addDays(today, 1));
  const done = await fetchDays(days);
  console.log(`${done.length} jour(s) archivé(s) : ${done.join(' ') || '—'} ; sources ${LAHTEET.join(' > ')}`);
}
