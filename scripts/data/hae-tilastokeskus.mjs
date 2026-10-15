/**
 * Tilastokeskus (StatFin, PxWeb) : deux séries officielles utilisées par le comparateur pörssi / kiinteä.
 *   12su — Sähkön kokonaiskulutus (GWh) par mois : profil mensuel « sähkölämmitteinen talo »
 *          (part de chaque mois dans la consommation nationale, moyenne des 3 dernières années complètes).
 *   13rb — Sähkön hinta kuluttajatyypeittäin : prix moyen de l'énergie (veroton) et prix total payé par
 *          un ménage de 5 000 à 15 000 kWh/an (type D), 12 derniers mois publiés.
 * Usage : node scripts/data/hae-tilastokeskus.mjs → src/data/tilastokeskus.json
 */
import { writeFileSync } from 'node:fs';
const B = 'https://pxdata.stat.fi/PxWeb/api/v1/fi/StatFin/';
async function px(table, query) {
  const r = await fetch(B + table, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query, response: { format: 'json-stat2' } }) });
  if (!r.ok) throw new Error(`${table} HTTP ${r.status}`);
  return r.json();
}
const meta = async (t) => (await fetch(B + t)).json();

// 12su
const m12 = await meta('ehk/12su.px');
const months = m12.variables[0].values;
const lastYear = Number(months.filter((m) => m.endsWith('M12')).at(-1).slice(0, 4));
const years = [lastYear - 2, lastYear - 1, lastYear];
const sel = months.filter((m) => years.includes(Number(m.slice(0, 4))));
const j = await px('ehk/12su.px', [
  { code: 'timeperiod_m', selection: { filter: 'item', values: sel } },
  { code: 'energia_30_20200915', selection: { filter: 'item', values: ['SSS'] } },
  { code: 'contentscode', selection: { filter: 'item', values: ['maara_gwh'] } },
]);
const vals = j.value; const shares = Array(12).fill(0);
for (const y of years) {
  const v = sel.map((m, i) => [m, vals[i]]).filter(([m]) => m.startsWith(String(y))).map(([, x]) => x);
  const tot = v.reduce((a, b) => a + b, 0); v.forEach((x, i) => (shares[i] += x / tot / years.length));
}
// 13rb
const m13 = await meta('ehi/13rb.px');
const mm = m13.variables[0].values.slice(-12);
const k = await px('ehi/13rb.px', [
  { code: 'timeperiod_m', selection: { filter: 'item', values: mm } },
  { code: 'energia_48_20220905', selection: { filter: 'item', values: ['A', 'SSS'] } },
  { code: 'energia_49_20220905', selection: { filter: 'item', values: ['D'] } },
  { code: 'contentscode', selection: { filter: 'item', values: ['hinta_snt_kwh'] } },
]);
// json-stat2 : ordre des dimensions = ordre de la requête (mois × composante)
const hinnat = mm.map((m, i) => ({ kk: m.replace('M', '-'), energiaVeroton: k.value[i * 2], kokonais: k.value[i * 2 + 1] }));
const out = {
  haettu: new Date().toISOString().slice(0, 10),
  kulutusprofiili: { lahde: 'Tilastokeskus 12su, sähkön kokonaiskulutus', vuodet: years, osuudet: shares.map((x) => Math.round(x * 10000) / 10000) },
  kotitalousD: { lahde: 'Tilastokeskus 13rb, kotitalousasiakas 5 000–15 000 kWh/v', kuukaudet: hinnat },
};
writeFileSync('src/data/tilastokeskus.json', JSON.stringify(out, null, 1));
console.log(years, out.kulutusprofiili.osuudet.join(' '), hinnat.at(-1));
