import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('caruna-espoo'); const c = verkkoTiedot('caruna');
  const y = t.yleis, a = t.aika!, k = t.kausi!;
  const ero5 = c.taulu[1].arvot[0].e - t.taulu[1].arvot[0].e;
  return { t, c, y, a, k, ero5, p25: h.M.perusKk(y, '3x25'), kt: h.M.perusKk(y, 'kt') };
};

export default defineGuide({
  id: 'siirto-caruna-espoo',
  group: 'verkko',
  order: 11,
  tool: 'tanaan',
  toolProps: { verkko: 'caruna-espoo', sulake: 1 },
  related: ['siirtohinnat', 'siirto-caruna', 'siirto-helen', 'tehomaksu', 'sahkoauton-lataus'],
  sources: ['caruna-espoo', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-caruna-espoo',
    nav: 'Caruna Espoo',
    card: 'Espoon, Kauniaisten, Kirkkonummen ja Joensuun keskustan siirtohinnat ja pörssisähkön kokonaishinta.',
    title: 'Caruna Espoo siirtohinta 2026: pörssisähkö kaikkineen',
    description: 'Caruna Espoo Oy:n siirtohinnat 2026 Espoossa, Kauniaisissa ja Kirkkonummella: yleis-, yö- ja kausisiirto. Pörssisähkön kokonaishinta varteittain tänään.',
    h1: 'Caruna Espoo: Suomen edullisimpia siirtohintoja',
    intro: 'Espoossa, Kauniaisissa, Kirkkonummella ja Joensuun keskustassa sähkön siirto on halvempaa kuin muualla Carunan verkossa.',
    resume: (h) => {
      const v = V(h);
      return `Caruna Espoo Oy on Caruna-konsernin erillinen verkkoyhtiö, joka palvelee Espoota, Kauniaista, Kirkkonummea ja Joensuun keskustaa. Sen hinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen, ja yleissiirron siirtomaksu on vain ${h.c(v.y.energia.kaikki!)} arvonlisäveron kanssa. Erikoista on perusmaksu: se on ${h.eur(v.p25)} kuukaudessa kaikille 25–63 ampeerin liittymille, joten suurempi pääsulake ei maksa enempää, ja kerros- ja rivitaloasunnoissa ${h.eur(v.kt)}. Omakotitalossa, joka kuluttaa 5 000 kilowattituntia vuodessa, siirto on Caruna Espoon alueella ${h.eur(v.ero5, 0)} vuodessa halvempaa kuin Caruna Oy:n alueella. Pörssisähkön kokonaishinta yleissiirrolla on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} keskimäärin ${h.c(v.t.paiva.ka)}. Laskuri on asetettu Caruna Espoon yleissiirtoon; vaihda oma tuotteesi ja sopimuksesi, niin näet jokaisen vartin kokonaishinnan ja päivän halvimman jakson. Postinumerokenttä varmistaa, kuuluuko osoitteesi Caruna Espoon vai Caruna Oy:n verkkoon, koska rajat eivät aina noudata kuntarajoja. Erot Caruna Oy:hyn ovat suurimmillaan omakotitaloissa.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miksi Caruna Espoon siirto on halvempaa kuin Caruna Oy:n?', a: 'Kyse on kahdesta erillisestä verkkoyhtiöstä, joilla on omat sallitut tuottonsa ja kustannuksensa. Tiheästi rakennetulla kaupunkialueella yhtä asiakasta kohti tarvitaan vähemmän johtoa kuin maaseudulla, ja verkko on suurelta osin maakaapelissa. Siksi Espoon alueen hinnasto on selvästi edullisempi, vaikka yhtiöt kuuluvat samaan konserniin. Kumpikin yhtiö on erikseen Energiaviraston valvoma.' },
        { q: 'Kannattaako sulakkeen koolla Caruna Espoon alueella?', a: `Yleissiirrossa ei, sillä perusmaksu on sama ${h.eur(v.p25)} kuukaudessa kaikille 25–63 ampeerin liittymille. Sähköauton latauksen takia sulaketta suurentava omakotitalo ei siis maksa siirrossa enempää, toisin kuin useimmissa muissa verkoissa. Itse sulakkeen suurentaminen on kuitenkin liittymän muutostyö, josta peritään erillinen maksu liittymishinnaston mukaan.` },
        { q: 'Kannattaako Espoossa yösiirto sähköauton takia?', a: `Yösiirrossa päivän siirtomaksu on ${h.c(v.a.energia.paiva!)} ja yön ${h.c(v.a.energia.yo!)}, mutta perusmaksu on ${h.eur(h.M.perusKk(v.a, '3x25'))} yleissiirron ${h.eur(v.p25)} sijaan. Jos lataat autoa enimmäkseen yöllä ja ajat paljon, yösiirto voi kannattaa. Laskelmamme mukaan raja on talvipainotteisella kulutuksella noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattituntia vuodessa, ja yölatauksen osuuden kasvaessa raja laskee.` },
        { q: 'Kuuluuko koko Joensuu Caruna Espoon verkkoon?', a: 'Ei. Caruna Espoon hinnasto koskee Joensuun keskustaa. Muualla Joensuussa ja Pohjois-Karjalassa verkkoyhtiö on useimmiten PKS Sähkönsiirto, jonka hinnat ovat selvästi korkeammat. Laskurin postinumerokenttä kertoo, mikä verkkoyhtiö osoitteessasi toimii Energiaviraston luettelon mukaan, ja valitsee sen hinnat laskuriin automaattisesti. Jos postinumerolla on useampi yhtiö, tarkista nimi siirtolaskusta.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Hinnasto ${h.date(v.t.v.voimassa!)} alkaen</h2>
${hintaTaulukko(h, v.t)}
<p>Caruna Espoon kolmella siirtotuotteella on vain kaksi perusmaksua: kerros- ja rivitaloasunnoille sekä kaikille muille 25–63 ampeerin liittymille. Tämä tekee Espoon alueesta poikkeuksen, sillä useimmissa verkoissa 3 × 35 ampeerin perusmaksu on selvästi 3 × 25 ampeerin maksua suurempi.</p>
<h2>Mikä tuote sopii espoolaiseen kotiin</h2>
${vuosiTaulukko(h, v.t)}
<p>Kerrostaloissa ja pienen kulutuksen omakotitaloissa yleissiirto on lähes aina halvin. Kausisiirron talviarkipäivän ${h.c(v.k.energia.talvipaiva!)} ja muun ajan ${h.c(v.k.energia.muu!)} ero on pieni, joten kausisiirto kannattaa vain hyvin suurella kulutuksella. Yösiirron ${h.c(v.a.energia.yo!)} yöhinta on puolestaan maan halvimpia, mikä tekee siitä houkuttelevan sähköauton yölataukseen ja varaavaan lämmitykseen.</p>
<h2>Pieni siirtomaksu, suurempi osuus pörssihinnalle</h2>
<p>Koska siirto ja perusmaksu ovat Espoossa pieniä, pörssihinnan vaihtelu näkyy kokonaishinnassa suhteellisesti voimakkaammin kuin kalliimmissa verkoissa. Halvan yön ja kalliin illan ero on euroissa sama kuin muualla, mutta osuutena laskusta suurempi. Siksi kulutuksen ajoittaminen halvoille tunneille on espoolaiselle pörssisähkön käyttäjälle erityisen tehokas tapa säästää. Vertaa naapuriverkkoihin ${h.a('siirto-helen', 'Helsingissä')} ja ${h.a('siirto-caruna', 'Caruna Oy:n alueella')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-caruna-espoo',
    nav: 'Caruna Espoo',
    card: 'Transfer fees in Espoo, Kauniainen, Kirkkonummi and central Joensuu, and the all-in spot price.',
    title: 'Caruna Espoo Transfer Fee 2026: Spot Price With All Fees',
    description: 'Caruna Espoo Oy transfer fees 2026 in Espoo, Kauniainen and Kirkkonummi: general, night and seasonal transfer. See the all-in spot electricity price by quarter.',
    h1: 'Caruna Espoo: among Finland’s cheapest transfer fees',
    intro: 'In Espoo, Kauniainen, Kirkkonummi and central Joensuu, transfer costs less than elsewhere on Caruna’s network.',
    resume: (h) => {
      const v = V(h);
      return `Caruna Espoo Oy is a separate network company within the Caruna group, serving Espoo, Kauniainen, Kirkkonummi and central Joensuu. Its price list has applied since ${h.date(v.t.v.voimassa!)}, and the general transfer fee is only ${h.c(v.y.energia.kaikki!)} including VAT. The basic fee is unusual: ${h.eur(v.p25)} a month for every connection from 25 to 63 A, so a larger main fuse costs nothing extra, and ${h.eur(v.kt)} for flats and terraced homes. For a house using 5,000 kilowatt-hours a year, transfer in Caruna Espoo’s area is ${h.eur(v.ero5, 0)} a year cheaper than in Caruna Oy’s area. The all-in spot price on general transfer averages ${v.t.arvio ? `an estimated ${h.c(v.t.paiva.ka)}` : `${h.c(v.t.paiva.ka)} today`}. The calculator is preset to Caruna Espoo’s general transfer; switch to your own product and contract to see every quarter hour’s all-in price and the day’s cheapest window.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Why is Caruna Espoo cheaper than Caruna Oy?', a: 'They are two separate network companies with their own allowed returns and costs. A densely built city area needs less line per customer than the countryside, and much of the network is underground cable. That is why the Espoo area’s price list is clearly cheaper even though both belong to the same group.' },
        { q: 'Does fuse size matter in Caruna Espoo’s area?', a: `Not on general transfer: the basic fee is the same ${h.eur(v.p25)} a month for every connection from 25 to 63 A. A house that upsizes its fuse for car charging pays no more for transfer, unlike in most networks. The fuse upgrade itself is a connection change with its own charge.` },
        { q: 'Is night transfer worth it in Espoo for an electric car?', a: `Night transfer costs ${h.c(v.a.energia.paiva!)} by day and ${h.c(v.a.energia.yo!)} at night, but the basic fee is ${h.eur(h.M.perusKk(v.a, '3x25'))} instead of ${h.eur(v.p25)}. If you charge mostly at night and drive a lot, it can pay. By our calculation the break-even with winter-heavy use is about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours a year.` },
        { q: 'Is all of Joensuu on Caruna Espoo’s network?', a: 'No. Caruna Espoo’s price list covers central Joensuu. Elsewhere in Joensuu and North Karelia the operator is usually PKS Sähkönsiirto, whose prices are clearly higher. The calculator’s postcode field tells you which operator serves your address according to the Energy Authority list.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Price list from ${h.date(v.t.v.voimassa!)}</h2>
${hintaTaulukko(h, v.t)}
<p>Caruna Espoo’s three transfer products have only two basic fees: one for flats and terraced homes and one for every other connection from 25 to 63 A. That makes the Espoo area an exception, since in most networks the 3 × 35 A basic fee is clearly higher than the 3 × 25 A one.</p>
<h2>Which product suits a home in Espoo</h2>
${vuosiTaulukko(h, v.t)}
<p>In flats and low-consumption houses general transfer is almost always cheapest. The gap between seasonal transfer’s winter weekday rate of ${h.c(v.k.energia.talvipaiva!)} and its other-time rate of ${h.c(v.k.energia.muu!)} is small, so seasonal transfer only pays at very high consumption. Night transfer’s night rate of ${h.c(v.a.energia.yo!)} is among the lowest in the country, which makes it attractive for overnight car charging and storage heating.</p>
<h2>Low transfer, a bigger share for the spot price</h2>
<p>Because transfer and basic fees are small in Espoo, swings in the exchange price show up more strongly in the all-in price than in dearer networks. The gap between a cheap night and an expensive evening is the same in euros, but a larger share of the bill. Timing use for cheap hours is therefore a particularly effective way for Espoo spot customers to save. Compare with the neighbouring networks in ${h.a('siirto-helen', 'Helsinki')} and ${h.a('siirto-caruna', 'Caruna Oy’s area')}.</p>`;
    },
  },
});
