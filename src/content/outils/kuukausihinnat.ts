import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { MARG } from '../../lib/arvot';

/** Kuukausihinnat : moyennes mensuelles FI (archive ou agrégat officiel) et prix réel. */
const V = (h: Helpers) => {
  const { M, S } = h;
  const kk = Object.keys(S.kuukaudet).filter((k) => k < S.tanaan.slice(0, 7)).sort();
  const rivit = kk.map((k) => ({ k, spot: M.spotC(S.kuukaudet[k].keskiarvo), lahde: S.kuukaudet[k].lahde }));
  const max = rivit.reduce((a, b) => (b.spot > a.spot ? b : a));
  const min = rivit.reduce((a, b) => (b.spot < a.spot ? b : a));
  const viim = rivit.at(-1)!;
  const v12 = rivit.slice(-12), e12 = rivit.slice(-24, -12);
  const ka = (r: typeof rivit) => (r.length ? r.reduce((a, b) => a + b.spot, 0) / r.length : 0);
  const helen = M.tuote(M.verkko('helen')!, 'yleis')!.energia.kaikki!;
  const jse = M.tuote(M.verkko('jse')!, 'yleis')!.energia.kaikki!;
  const pv = S.paivakeskiarvot;
  const halvinPaiva = pv.reduce((a, b) => (b[1] < a[1] ? b : a));
  const kalleinPaiva = pv.reduce((a, b) => (b[1] > a[1] ? b : a));
  return { rivit, max, min, viim, ka12: ka(v12), kaEd: ka(e12), nEd: e12.length, helen, jse, halvinPaiva, kalleinPaiva, pvN: pv.length };
};

export default defineGuide({
  id: 'kuukausihinnat',
  group: 'hinta',
  order: 30,
  tool: 'kuukaudet',
  toolProps: { verkko: 'helen' },
  related: ['porssi-vai-kiintea', 'sahkolasku', 'huomenna', 'negatiivinen-hinta', 'siirtohinnat'],
  sources: ['nordpool', 'entsoe', 'veroTaulukko', 'tkHinta'],
  fi: {
    slug: 'porssisahkon-hinta-kuukausittain',
    nav: 'Hinta kuukausittain',
    card: 'Pörssisähkön kuukausikeskihinnat ja kokonaishinta oman verkkoyhtiösi siirrolla.',
    title: 'Pörssisähkön hinta kuukausittain 2026: keskihinnat alv:llä',
    description: 'Pörssisähkön keskihinta kuukausittain 2025–2026: kuukauden pörssihinta alv:n kanssa ja kokonaishinta siirron ja sähköveron kanssa oman verkkoyhtiösi mukaan.',
    h1: 'Pörssisähkön hinta kuukausittain: keskihinnat ja koko hinta',
    intro: 'Kuukauden keskihinta kertoo, mitä pörssisähkö on maksanut. Laskuri lisää siihen siirron ja verot oman verkkoyhtiösi mukaan.',
    resume: (h) => {
      const v = V(h);
      return `Suomen tarjousalueen pörssisähkön keskihinta oli viimeisimpänä päättyneenä kuukautena, ${v.viim.k}, ${h.c(v.viim.spot)} arvonlisäveron kanssa. Viimeisten kahdentoista kuukauden keskiarvo on ${h.c(v.ka12)}${v.nEd >= 12 ? ` ja sitä edeltäneen vuoden ${h.c(v.kaEd)}` : ''}. Jakson kallein kuukausi oli ${v.max.k}, jolloin keskihinta oli ${h.c(v.max.spot)}, ja halvin ${v.min.k}, ${h.c(v.min.spot)}. Pörssihinta ei kuitenkaan ole se, mitä kuluttaja maksaa: Helen Sähköverkon yleissiirrolla kokonaishintaan tulee lisäksi siirto ${h.c(v.helen)}, sähkövero ${h.c(h.M.VERO_C, 4)} ja myyjän marginaali, joten viimeisimmän kuukauden kokonaishinta oli ${h.c(v.viim.spot + MARG + v.helen + h.M.VERO_C)}. Järvi-Suomen Energian alueella sama pörssihinta johti ${h.c(v.viim.spot + MARG + v.jse + h.M.VERO_C)} kokonaishintaan. Valitse alta oma verkkoyhtiösi ja sopimuksesi, niin taulukko näyttää jokaisen kuukauden kokonaishinnan. Taulukko kertoo myös, onko kuukauden luku laskettu omasta varttiarkistostamme vai Nord Poolin virallisesta kuukausikeskiarvosta. Talvikuukausien ja kesäkuukausien ero on tyypillisesti suuri, ja se näkyy suoraan pörssisopimuksen laskussa. Laskurin taulukko näyttää kaikki kuukaudet uusimmasta alkaen.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Mistä kuukausikeskihinnat tulevat?', a: 'Kuukausikeskiarvot lasketaan omasta varttihinta-arkistostamme, kun kuukauden kaikki päivät ovat siinä. Vanhemmille kuukausille käytetään Nord Poolin julkaisemia virallisia kuukausikeskiarvoja Suomen tarjousalueelle. Molemmat ovat yksinkertaisia keskiarvoja kaikista kuukauden tunneista tai varteista ilman kulutuksella painottamista. Arkisto täydentyy joka päivä automaattisesti, joten kuukausi siirtyy Nord Poolin luvusta omaan laskentaan heti, kun se on kokonaan arkistossa. Lähde näkyy taulukossa jokaisen kuukauden kohdalla.' },
        { q: 'Miksi oma pörssisähkön keskihintani on eri kuin kuukauden keskihinta?', a: 'Koska kulutat sähköä eri tavalla eri tunteina. Jos kulutus osuu kalliisiin aamu- ja iltatunteihin, kulutuksella painotettu hintasi on keskiarvoa korkeampi; jos kulutat paljon yöllä, se on matalampi. Sähkönmyyjäsi lasku kertoo toteutuneen keskihintasi, jota voit verrata tämän sivun kuukausihintaan. Ero on tavallisesti joitakin prosentteja, mutta sähkölämmitteisessä talossa pakkasjaksoina se voi olla suurempi.' },
        { q: 'Mikä oli halvin päivä viime aikoina?', a: `Viimeisen ${h.num(v.pvN)} päivän aikana halvin päivä oli ${h.date(v.halvinPaiva[0])}, jolloin pörssihinnan keskiarvo oli ${h.num(v.halvinPaiva[1], 2)} euroa megawattitunnilta ilman veroa. Kallein oli ${h.date(v.kalleinPaiva[0])}, keskimäärin ${h.num(v.kalleinPaiva[1], 2)} euroa megawattitunnilta. Päivittäiset hinnat näet etusivun laskurista. Megawattitunnin hinta muutetaan sentiksi kilowattitunnilta jakamalla kymmenellä, ja arvonlisävero lisätään sen jälkeen.` },
        { q: 'Miksi talvikuukaudet ovat kalliimpia?', a: 'Talvella sähkön kulutus on Suomessa suurimmillaan lämmityksen vuoksi, ja aurinkosähköä on vähän. Kovilla pakkasilla kysyntä voi ylittää edullisen tuotannon, jolloin hinta määräytyy kalliimpien voimalaitosten ja tuonnin mukaan. Keväällä tulvavesi ja kesällä vähäinen kulutus painavat hintoja alas. Myös ydinvoimaloiden vuosihuollot ja tuulisuus vaikuttavat yksittäisen kuukauden hintaan, joten kaikki talvet eivät ole yhtä kalliita.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Kuukausien pörssihinnat</h2>
${h.table(['Kuukausi', 'Pörssihinta sis. alv', 'Lähde'], [...v.rivit].reverse().map((r) => [r.k, h.c(r.spot), r.lahde === 'arkisto' ? 'varttiarkisto' : 'Nord Pool, kuukausikeskiarvo']), 'Suomen tarjousalue, kuukauden yksinkertainen keskiarvo, c/kWh alv 25,5 % mukaan lukien.', ['l', 'r', 'l'])}
<p>Taulukon hinnat ovat pelkkiä pörssihintoja arvonlisäveron kanssa. Yllä oleva laskuri lisää niihin valitsemasi verkkoyhtiön siirtomaksun kuukauden keskiarvona, sähköveron ja marginaalin tai korvaa ne kiinteällä hinnalla, ja näyttää kokonaishinnan sekä kuukausimaksut.</p>
<h2>Kokonaishinnan ja pörssihinnan ero</h2>
<p>Kun pörssihinta on matala, siirto ja vero ovat suurin osa kokonaishinnasta, ja eri verkkojen erot korostuvat. Esimerkiksi viimeisimpänä kuukautena kokonaishinta oli Helsingissä ja Järvi-Suomessa ${h.c(v.jse - v.helen)} eri, vaikka pörssihinta oli täsmälleen sama. Kalliina talvikuukautena pörssihinnan osuus kasvaa ja verkkojen erot jäävät suhteellisesti pienemmiksi.</p>
<h2>Kuukausihinta ja oma lasku</h2>
<p>Jos sopimuksesi on pörssisopimus, sähkönmyyjän lasku perustuu kulutuksesi ja kunkin tunnin tai vartin hinnan tuloon. Jos kulutus on tasaista, laskun keskihinta on lähellä kuukauden keskihintaa. Laske oma kuukautesi ${h.a('sahkolasku', 'sähkölaskulaskurilla')} ja vertaa sopimustyyppejä ${h.a('porssi-vai-kiintea', 'pörssi vai kiinteä -laskurissa')}. Huomisen hinnat ovat ${h.a('huomenna', 'huomisen sivulla')}.</p>`;
    },
  },
  en: {
    slug: 'spot-electricity-price-by-month',
    nav: 'Price by month',
    card: 'Monthly average spot prices and the all-in price with your own network’s transfer.',
    title: 'Spot Electricity Price by Month Finland 2026: Averages',
    description: 'Finnish spot electricity price by month, 2025–2026: each month’s average with VAT, and the all-in price with transfer and electricity tax for your operator.',
    h1: 'Spot electricity price by month: averages and the full price',
    intro: 'A month’s average tells you what spot electricity has cost. The calculator adds transfer and taxes for your own operator.',
    resume: (h) => {
      const v = V(h);
      return `The Finnish bidding-zone spot price averaged ${h.c(v.viim.spot)} including VAT in the latest completed month, ${v.viim.k}. The last twelve months averaged ${h.c(v.ka12)}${v.nEd >= 12 ? `, against ${h.c(v.kaEd)} in the year before` : ''}. The dearest month in the period was ${v.max.k} at ${h.c(v.max.spot)} and the cheapest ${v.min.k} at ${h.c(v.min.spot)}. The spot price is not what consumers pay, though: on Helen Sähköverkko’s general transfer the all-in price adds transfer of ${h.c(v.helen)}, electricity tax of ${h.c(h.M.VERO_C, 4)} and the retailer’s margin, so the latest month’s all-in price was ${h.c(v.viim.spot + MARG + v.helen + h.M.VERO_C)}. In Järvi-Suomen Energia’s area the same spot price meant ${h.c(v.viim.spot + MARG + v.jse + h.M.VERO_C)}. Choose your operator and contract below and the table shows each month’s all-in price. The table also shows whether each figure comes from our quarter-hour archive or Nord Pool’s official monthly average.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Where do the monthly averages come from?', a: 'Monthly averages are computed from our own quarter-hour price archive when every day of the month is in it. For older months we use Nord Pool’s official monthly averages for the Finnish bidding zone. Both are simple averages of every hour or quarter in the month, not weighted by consumption.' },
        { q: 'Why does my own average spot price differ from the monthly average?', a: 'Because you use different amounts at different hours. If your use falls in expensive morning and evening hours your consumption-weighted price is above the average; with heavy night use it is below. Your retailer’s bill shows your actual average, which you can compare with this page.' },
        { q: 'What was the cheapest day recently?', a: `Over the last ${h.num(v.pvN)} days the cheapest day was ${h.date(v.halvinPaiva[0])}, with an average spot price of ${h.num(v.halvinPaiva[1], 2)} euros per megawatt-hour before tax. The dearest was ${h.date(v.kalleinPaiva[0])} at ${h.num(v.kalleinPaiva[1], 2)} euros per megawatt-hour. See daily prices in the home page calculator.` },
        { q: 'Why are winter months more expensive?', a: 'In winter Finnish consumption peaks because of heating, and there is little solar power. In hard frost demand can exceed cheap generation, so the price is set by dearer plants and imports. In spring meltwater, and in summer low demand, push prices down.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Monthly spot prices</h2>
${h.table(['Month', 'Spot incl. VAT', 'Source'], [...v.rivit].reverse().map((r) => [r.k, h.c(r.spot), r.lahde === 'arkisto' ? 'quarter-hour archive' : 'Nord Pool monthly average']), 'Finnish bidding zone, simple monthly average, c/kWh including 25.5% VAT.', ['l', 'r', 'l'])}
<p>The table shows exchange prices with VAT only. The calculator above adds your chosen operator’s transfer fee as a monthly average, electricity tax and the margin, or replaces them with a fixed price, and shows the all-in price and monthly fees.</p>
<h2>All-in versus spot price</h2>
<p>When the spot price is low, transfer and tax are most of the all-in price and the differences between networks stand out. In the latest month the all-in price in Helsinki and in the Lakeland differed by ${h.c(v.jse - v.helen)} although the spot price was exactly the same. In an expensive winter month the spot share grows and network differences shrink in relative terms.</p>
<h2>Monthly price and your own bill</h2>
<p>On a spot contract your retailer’s bill is the sum of your use times each hour’s or quarter’s price. With even use, the bill’s average is close to the monthly average. Work out your own month in the ${h.a('sahkolasku', 'electricity bill calculator')} and compare contract types in the ${h.a('porssi-vai-kiintea', 'spot or fixed calculator')}. Tomorrow’s prices are on the ${h.a('huomenna', 'tomorrow page')}.</p>`;
    },
  },
});
