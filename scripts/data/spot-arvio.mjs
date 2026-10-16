/**
 * Calcul pur des données de prix du site (jours publiés + estimation de secours « keskihinta-arvio »),
 * sans lecture ni écriture de fichier : utilisé par rakenna-spot.mjs et testé par tests/spot-arvio.test.ts.
 *   days  — jours archivés { pvm, lahde, alku, hinnat[€/MWh], alustava? }
 *   kk    — agrégats mensuels officiels { lahde, kuukaudet: { 'AAAA-MM': €/MWh } }
 *   today — date civile d'Helsinki (AAAA-MM-JJ)
 */
export const hkiDate = (d) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Helsinki' }).format(d);
const hkiQuarter = (t) => {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Helsinki', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(t));
  const h = Number(p.find((x) => x.type === 'hour').value), m = Number(p.find((x) => x.type === 'minute').value);
  return h * 4 + Math.floor(m / 15);
};
const addDays = (iso, n) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const weekend = (iso) => { const w = new Date(`${iso}T12:00:00Z`).getUTCDay(); return w === 0 || w === 6; };
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const r2 = (x) => Math.round(x * 100) / 100;
/** Valeurs d'un jour rangées par quart d'heure local 0..95 (jour de changement d'heure : moyenne des doublons). */
function byQuarter(d) {
  const acc = Array.from({ length: 96 }, () => []);
  const t0 = Date.parse(d.alku);
  d.hinnat.forEach((v, i) => acc[hkiQuarter(t0 + i * 900_000)].push(v));
  let last = 0;
  return acc.map((a) => (a.length ? (last = mean(a)) : last));
}
export function rakennaSpot({ days, kk, today, paivitetty = new Date().toISOString() }) {
  kk = kk ?? { kuukaudet: {}, lahde: '' };
  const year = days.filter((d) => d.pvm > addDays(today, -366) && d.pvm <= today);
  // Moyennes directes par mois × type de jour (au moins 8 jours).
  const suora = {};
  for (let m = 1; m <= 12; m++) for (const w of ['arki', 'vkl']) {
    const set = year.filter((d) => Number(d.pvm.slice(5, 7)) === m && weekend(d.pvm) === (w === 'vkl'));
    if (set.length >= 8) {
      const q = set.map(byQuarter);
      (suora[m] ??= {})[w] = { paivia: set.length, hinnat: Array.from({ length: 96 }, (_, i) => r2(mean(q.map((x) => x[i])))) };
    }
  }
  // Profil par type de jour (écart à la moyenne du jour), sur l'année archivée.
  const profiili = {};
  for (const w of ['arki', 'vkl']) {
    const set = year.filter((d) => weekend(d.pvm) === (w === 'vkl')).map(byQuarter);
    if (set.length) {
      const dev = set.map((q) => { const m = mean(q); return q.map((x) => x - m); });
      profiili[w] = { paivia: set.length, poikkeama: Array.from({ length: 96 }, (_, i) => r2(mean(dev.map((x) => x[i])))) };
    }
  }
  // Niveau mensuel officiel : même mois civil, 12 derniers mois.
  const ym = today.slice(0, 7);
  const months12 = Object.keys(kk.kuukaudet).filter((k) => k < ym).sort().slice(-12);
  const taso = {};
  for (const k of months12) taso[Number(k.slice(5, 7))] = kk.kuukaudet[k];
  // Moyennes mensuelles affichées : archive si complète, sinon agrégat officiel.
  const kuukaudet = {};
  for (const k of Object.keys(kk.kuukaudet).sort()) kuukaudet[k] = { keskiarvo: kk.kuukaudet[k], lahde: 'nordpool-aggregaatti' };
  const byMonth = {};
  for (const d of days) (byMonth[d.pvm.slice(0, 7)] ??= []).push(d);
  for (const [k, list] of Object.entries(byMonth)) {
    const n = new Date(Date.UTC(Number(k.slice(0, 4)), Number(k.slice(5, 7)), 0)).getUTCDate();
    if (list.length === n && k < ym) kuukaudet[k] = { keskiarvo: r2(mean(list.flatMap((d) => d.hinnat))), lahde: 'arkisto' };
  }
  const recent = days.filter((d) => d.pvm >= addDays(today, -7));
  return {
    paivitetty,
    tanaan: today,
    paivat: Object.fromEntries(recent.map((d) => [d.pvm, { lahde: d.lahde, alku: d.alku, hinnat: d.hinnat, ...(d.alustava ? { alustava: true } : {}) }])),
    arvio: {
      jakso: year.length ? { alku: year[0].pvm, loppu: year.at(-1).pvm, paivia: year.length } : null,
      tasoJakso: months12.length ? { alku: months12[0], loppu: months12.at(-1) } : null,
      tasoLahde: kk.lahde,
      taso, profiili, suora,
    },
    kuukaudet,
    paivakeskiarvot: days.filter((d) => d.pvm >= addDays(today, -60)).map((d) => [d.pvm, r2(mean(d.hinnat)), r2(Math.min(...d.hinnat)), r2(Math.max(...d.hinnat))]),
  };
}
