import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('helen'); const y = t.yleis, a = t.aika!;
  const teho = a.teho!.eurKwKk;
  return { t, y, a, teho, p: h.M.perusKk(y, 'kt'), pa: h.M.perusKk(a, '3x25'), teho5: teho * 5 * 12, teho10: teho * 10 * 12 };
};

export default defineGuide({
  id: 'siirto-helen',
  group: 'verkko',
  order: 13,
  tool: 'tanaan',
  toolProps: { verkko: 'helen' },
  related: ['tehomaksu', 'siirtohinnat', 'siirto-caruna-espoo', 'saunan-hinta', 'sahkolasku'],
  sources: ['helen', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-helen',
    nav: 'Helen Sähköverkko',
    card: 'Helsingin yleissiirto ja tehomaksullinen aikasiirto sekä pörssisähkön kokonaishinta Helsingissä.',
    title: 'Helen siirtohinta 2026: pörssisähkö Helsingissä kaikkineen',
    description: 'Helen Sähköverkon siirtohinnat 2026: yleissiirto ja tehomaksullinen aikasiirto. Näe pörssisähkön kokonaishinta Helsingissä vartti vartilta tänään ja huomenna.',
    h1: 'Helen Sähköverkko: pörssisähkön hinta Helsingissä',
    intro: 'Helsingissä valitaan kahdesta siirtotuotteesta, ja toisessa on tehomaksu. Laskuri lisää Helenin siirron ja verot jokaiseen varttiin.',
    resume: (h) => {
      const v = V(h);
      return `Helen Sähköverkko siirtää sähkön Helsingissä. Sen hinnastossa on kotitalouksille vain kaksi tuotetta. Yleissiirrossa perusmaksu on ${h.eur(v.p)} kuukaudessa kaikille enintään 63 ampeerin käyttöpaikoille ja siirtomaksu ${h.c(v.y.energia.kaikki!)} arvonlisäveron kanssa. Aikasiirrossa perusmaksu on ${h.eur(v.pa)}, päiväsiirto kello 7–22 ${h.c(v.a.energia.paiva!)} ja yösiirto ${h.c(v.a.energia.yo!)}, mutta lisäksi maksetaan tehomaksua ${h.num(v.teho, 2)} euroa kilowatilta kuukaudessa. Tehomaksun peruste on kuukauden kolmanneksi suurin tunnin keskiteho, ja yöajan tehosta lasketaan 80 prosenttia. Pörssisähkön kokonaishinta Helenin yleissiirrolla on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} keskimäärin ${h.c(v.t.paiva.ka)}. Laskuri on asetettu Helenin yleissiirtoon; vaihda aikasiirtoon nähdäksesi päivän ja yön hintaeron sekä oman sopimuksesi kokonaishinnan jokaiselle vartille. Laskurin kuukausimaksuihin sisältyvät verkon ja myyjän perusmaksut, mutta aikasiirron tehomaksu riippuu omasta huipustasi, joten se näkyy alla olevassa vuosivertailussa erikseen. Helsingin siirtohinnat ovat laskurin verkkojen edullisemmasta päästä, joten pörssihinnan osuus kokonaishinnasta on suuri.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miten Helenin tehomaksu lasketaan?', a: `Tehomaksu lasketaan kuukauden kolmanneksi suurimman tunnin keskitehon mukaan, ja yöllä mitatusta tehosta otetaan huomioon 80 prosenttia. Hinta on ${h.num(v.teho, 2)} euroa kilowatilta kuukaudessa. Jos kolmanneksi suurin tunti on 5 kilowattia, tehomaksu on vuodessa noin ${h.eur(v.teho5, 0)}. Suurten kuormien porrastaminen eri tunneille ja niiden siirtäminen yöhön pienentää maksua.` },
        { q: 'Kenelle Helenin aikasiirto kannattaa?', a: `Helenin mukaan yleissiirto on tavallisesti edullisin asunnoissa, joiden kulutus on alle 13 000 kilowattituntia vuodessa. Aikasiirto voi kannattaa sähkölämmitteisessä omakotitalossa, jos suuri osa kulutuksesta osuu yöhön eikä tehohuippu kasva suureksi. Laskelmamme mukaan 5 kilowatin huipulla raja on noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattituntia vuodessa.` },
        { q: 'Riippuuko Helenin perusmaksu sulakkeesta?', a: 'Yleissiirrossa ei: perusmaksu on sama kaikille enintään 63 ampeerin käyttöpaikoille, oli kyse kerrostaloasunnosta tai omakotitalosta. Aikasiirto on tarkoitettu enintään 80 ampeerin käyttöpaikoille, ja sen perusmaksu on samoin kiinteä. Kustannusero syntyy siirtomaksusta ja aikasiirron tehomaksusta. Suuri pääsulake ei siis Helsingissä nosta yleissiirron hintaa, mikä helpottaa esimerkiksi sähköauton latauksen hankintaa.' },
        { q: 'Kuka laskuttaa sähköveron Helsingissä?', a: `Helen Sähköverkko laskuttaa verkkopalvelun yhteydessä sähköveron ja huoltovarmuusmaksun, veroluokassa I yhteensä ${h.c(h.M.VERO_C, 4)} kilowattitunnilta arvonlisäveron kanssa. Sähkönmyyjäsi voi olla eri yhtiö kuin Helen, ja se laskuttaa vain energian, marginaalin ja oman perusmaksunsa. Siksi helsinkiläinen saa sähköstä kaksi laskua, ellei myyjä laskuta myös verkkopalvelua.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Kaksi tuotetta, yksi perusmaksu sulakkeesta riippumatta</h2>
${hintaTaulukko(h, v.t)}
<p>Helenin yleissiirto on yksinkertainen: kiinteä perusmaksu ja yksi siirtohinta ympäri vuorokauden. Siksi pörssisähkön käyttäjälle Helsingissä halvin vartti on aina se, jonka pörssihinta on halvin. Aikasiirrossa yön siirtohinta on ${h.c(v.a.energia.paiva! - v.a.energia.yo!)} päivää halvempi, mikä siirtää halvimman jakson painopistettä yöhön.</p>
<h2>Tehomaksu muuttaa laskelman</h2>
${vuosiTaulukko(h, v.t)}
<p>Aikasiirron vuosikustannukseen on taulukossa laskettu tehomaksu 5 kilowatin huipulla. Jos huippu on 10 kilowattia, tehomaksu nousee noin ${h.eur(v.teho10, 0)} vuodessa. Sähkösaunan, sähköauton ja lämmityksen käyttäminen yhtä aikaa nostaa huippua nopeasti. Kun kuormat porrastetaan eri tunneille ja suurin kulutus siirretään yöhön, jolloin tehosta lasketaan vain 80 prosenttia, maksu pienenee. Lue lisää ${h.a('tehomaksu', 'tehomaksun oppaasta')}.</p>
<h2>Helsinkiläisen pörssisähkön hinta</h2>
<p>Helsingissä siirtomaksu on pienempi kuin monessa maaseutuverkossa, joten pörssihinnan osuus kokonaishinnasta on suurempi. Kun pörssihinta on lähellä nollaa, kilowattitunnin kokonaishinta on silti siirron ja veron verran, ${h.c(v.y.energia.kaikki! + h.M.VERO_C)} ennen marginaalia. Kalliilla tunnilla ero on suuri. Tavallisessa kerrostaloasunnossa siirron osuus on silti suuri, koska perusmaksu jaetaan pienelle kulutukselle. Vertaa naapurialueisiin ${h.a('siirto-caruna-espoo', 'Espoossa')} ja ${h.a('siirto-caruna', 'Caruna Oy:n alueella')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-helen',
    nav: 'Helen Sähköverkko',
    card: 'Helsinki’s general transfer and time-of-day transfer with a power fee, and the all-in spot price in Helsinki.',
    title: 'Helen Transfer Fee 2026: Spot Electricity in Helsinki All-in',
    description: 'Helen Sähköverkko transfer fees 2026: general transfer and time-of-day transfer with a power fee. See the all-in spot electricity price in Helsinki by quarter.',
    h1: 'Helen Sähköverkko: the spot electricity price in Helsinki',
    intro: 'In Helsinki you choose between two transfer products, one of them with a power fee. The calculator adds Helen’s transfer and taxes to every quarter hour.',
    resume: (h) => {
      const v = V(h);
      return `Helen Sähköverkko distributes electricity in Helsinki. Its price list offers households only two products. On general transfer the basic fee is ${h.eur(v.p)} a month for every site up to 63 A and the transfer fee ${h.c(v.y.energia.kaikki!)} including VAT. On time-of-day transfer the basic fee is ${h.eur(v.pa)}, day transfer (07:00–22:00) ${h.c(v.a.energia.paiva!)} and night transfer ${h.c(v.a.energia.yo!)}, plus a power fee of ${h.num(v.teho, 2)} euros per kilowatt per month. The power fee is based on the month’s third-highest hourly average power, with night-time power counted at 80%. The all-in spot price on Helen’s general transfer averages ${v.t.arvio ? `an estimated ${h.c(v.t.paiva.ka)}` : `${h.c(v.t.paiva.ka)} today`}. The calculator is preset to Helen’s general transfer; switch to time-of-day to see the day–night gap and the all-in price of every quarter hour on your own contract.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'How is Helen’s power fee calculated?', a: `It is based on the month’s third-highest hourly average power, with 80% of night-time power counted. The price is ${h.num(v.teho, 2)} euros per kilowatt per month. If your third-highest hour is 5 kilowatts, the power fee is about ${h.eur(v.teho5, 0)} a year. Staggering large loads reduces it.` },
        { q: 'Who should choose Helen’s time-of-day transfer?', a: `Helen says general transfer is usually cheapest in homes using less than 13,000 kilowatt-hours a year. Time-of-day can pay in an electrically heated house if much use falls at night and the power peak stays moderate. By our calculation, with a 5 kW peak the break-even is about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours a year.` },
        { q: 'Does Helen’s basic fee depend on the fuse?', a: 'Not on general transfer: the basic fee is the same for every site up to 63 A, whether a flat or a house. Time-of-day transfer is for sites up to 80 A and its basic fee is likewise fixed. The cost difference comes from the transfer fee and the time-of-day power fee.' },
        { q: 'Who bills electricity tax in Helsinki?', a: `Helen Sähköverkko bills electricity tax and the security-of-supply fee with the network service, ${h.c(h.M.VERO_C, 4)} per kilowatt-hour including VAT in tax class I. Your retailer may be a different company from Helen and bills only energy, margin and its own monthly fee.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Two products, one basic fee whatever the fuse</h2>
${hintaTaulukko(h, v.t)}
<p>Helen’s general transfer is simple: a fixed basic fee and one transfer price around the clock. For a spot customer in Helsinki the cheapest quarter is therefore always the one with the cheapest exchange price. On time-of-day transfer night transfer is ${h.c(v.a.energia.paiva! - v.a.energia.yo!)} cheaper than day, which shifts the cheapest window towards the night.</p>
<h2>The power fee changes the sums</h2>
${vuosiTaulukko(h, v.t)}
<p>The table includes the power fee at a 5 kW peak in the time-of-day cost. With a 10 kW peak the power fee rises to about ${h.eur(v.teho10, 0)} a year. Running the sauna, the car charger and heating at the same time drives the peak up fast. Staggering loads across hours and moving the largest use to the night, when only 80% of power counts, cuts the fee. More in the ${h.a('tehomaksu', 'power fee guide')}.</p>
<h2>The spot price for a Helsinki household</h2>
<p>Transfer in Helsinki is cheaper than in many rural networks, so the exchange price is a bigger share of the all-in price. When spot is near zero, a kilowatt-hour still costs transfer plus tax, ${h.c(v.y.energia.kaikki! + h.M.VERO_C)} before the margin. In an expensive hour the gap is large. Compare with the neighbouring areas in ${h.a('siirto-caruna-espoo', 'Espoo')} and ${h.a('siirto-caruna', 'Caruna Oy’s area')}.</p>`;
    },
  },
});
