/**
 * Marge et abonnement de référence d'un contrat pörssisähkö, depuis le comparateur officiel de
 * l'Energiavirasto (sahkonhinta.fi, rajapinta productlist). On garde les produits destinés aux
 * particuliers (nom sans « Yritys »), à prix spot (composante c/kWh < 2, nom contenant spot,
 * pörssi, surffari ou tarkka) et on prend la médiane de la marge (c/kWh, TVA comprise) et de
 * l'abonnement (€/mois). Ces valeurs ne servent que de valeur par défaut, modifiable, du simulateur.
 * Usage : node scripts/data/hae-sopimukset.mjs → src/data/sopimukset.json
 */
import { writeFileSync } from 'node:fs';
const B = 'https://ev-shv-prod-app-wa-consumerapi1.azurewebsites.net/api/productlist/';
const seen = new Map();
for (const pc of ['00100', '02100', '33100', '20100', '90100', '40100', '70100', '15100']) {
  const r = await fetch(`${B}${pc}?contractType=Spot&preBilling=false&microproduction=false`);
  if (!r.ok) continue;
  for (const p of await r.json()) seen.set(p.Id, p);
}
const rows = [];
for (const p of seen.values()) {
  const name = `${p.Name}`;
  if (/yritys/i.test(name)) continue;
  const comps = p.Details.Pricing.PriceComponents;
  const c = comps.find((x) => x.PriceComponentType === 'General' && x.OriginalPayment.PaymentUnit === 'CentPerKiwattHour');
  const m = comps.find((x) => x.PriceComponentType === 'Monthly' && x.OriginalPayment.PaymentUnit === 'EurPerMonth');
  if (!c || !m || c.OriginalPayment.Price >= 2 || !/spot|pörssi|surffari|tarkka/i.test(name)) continue;
  rows.push({ yhtio: p.Company.Name, tuote: name, marginaali: c.OriginalPayment.Price, perusmaksu: m.OriginalPayment.Price, alkaen: p.Details.Pricing.StartDate.slice(0, 10) });
}
const med = (a) => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
const out = { lahde: 'Energiavirasto, sähkön hintavertailu (sahkonhinta.fi), tuotelista', haettu: new Date().toISOString().slice(0, 10), n: rows.length, marginaaliMediaani: med(rows.map((r) => r.marginaali)), perusmaksuMediaani: med(rows.map((r) => r.perusmaksu)), tuotteet: rows };
writeFileSync('src/data/sopimukset.json', JSON.stringify(out, null, 1));
console.log(out.n, 'produits', out.marginaaliMediaani, 'c/kWh', out.perusmaksuMediaani, '€/kk');
