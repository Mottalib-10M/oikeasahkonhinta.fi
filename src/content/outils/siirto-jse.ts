import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('jse'); const y = t.yleis, a = t.aika!, k = t.kausi!;
  const halvin = verkkoTiedot('caruna-espoo');
  const ero = t.taulu[1].arvot[0].e - halvin.taulu[1].arvot[0].e;
  return { t, y, a, k, ero, kt: h.M.perusKk(y, 'kt'), p25: h.M.perusKk(y, '3x25'), p35: h.M.perusKk(y, '3x35'), a25: h.M.perusKk(a, '3x25') };
};

export default defineGuide({
  id: 'siirto-jse',
  group: 'verkko',
  order: 17,
  tool: 'tanaan',
  toolProps: { verkko: 'jse', sulake: 1 },
  related: ['siirtohinnat', 'siirto-savon-voima', 'siirtomaksu', 'porssi-vai-kiintea', 'saunan-hinta'],
  sources: ['jse', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-jarvi-suomen-energia',
    nav: 'Järvi-Suomen Energia',
    card: 'Järvi-Suomen Energian siirtohinnat ja pörssisähkön kokonaishinta Etelä-Savossa ja Järvi-Suomessa.',
    title: 'Järvi-Suomen Energia siirtohinta 2026: pörssisähkö ja siirto',
    description: 'Järvi-Suomen Energian siirtohinnat 2026 Etelä-Savossa: yleis-, vuodenaika- ja yösähkön siirto. Pörssisähkön kokonaishinta varteittain ja siirron vuosikulu.',
    h1: 'Järvi-Suomen Energia: kun siirto on laskun suurin osa',
    intro: 'Järvi-Suomen Energian maaseutuverkossa siirto maksaa usein enemmän kuin itse sähkö. Laskuri näyttää kokonaishinnan jokaiselle vartille.',
    resume: (h) => {
      const v = V(h);
      return `Järvi-Suomen Energia siirtää sähkön laajalla ja harvaan asutulla alueella Etelä-Savossa ja muualla Järvi-Suomessa, jossa verkkoa on paljon asiakasta kohti. Se näkyy hinnoissa. Hinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen, ja yleissähkön siirto maksaa ${h.c(v.y.energia.kaikki!)} arvonlisäveron kanssa. Perusmaksu on 3 × 25 ampeerin omakotitalossa ${h.eur(v.p25)} ja 3 × 35 ampeerilla ${h.eur(v.p35)} kuukaudessa. Omakotitalon 5 000 kilowattitunnin siirto maksaa Järvi-Suomen Energian verkossa noin ${h.eur(v.ero, 0)} vuodessa enemmän kuin Caruna Espoon verkossa, ja se on ${v.t.sija5}. edullisin laskurin ${v.t.n} verkosta. Pörssisähkön kokonaishinta yleissiirrolla on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} keskimäärin ${h.c(v.t.paiva.ka)}, josta siirron ja veron osuus on suuri. Laskuri on asetettu yleissähkön siirtoon omakotitalossa; vaihda oma tuotteesi ja sopimuksesi, niin näet jokaisen vartin kokonaishinnan ja kuukausittaiset perusmaksut. Siksi oikealla siirtotuotteella on alueella poikkeuksellisen suuri merkitys. Postinumerohaku varmistaa yhtiön.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miksi Järvi-Suomen Energian siirto on niin kallista?', a: 'Siirtohinta riippuu siitä, paljonko verkkoa tarvitaan asiakasta kohti ja paljonko sitä on uusittava. Järvi-Suomen alueella välimatkat ovat pitkiä ja asiakkaita vähän, ja sähköverkkoa on rakennettu säävarmaksi maakaapeliksi. Energiavirasto valvoo, ettei yhtiön tuotto ylitä kohtuullista tasoa, mutta kustannukset jaetaan alueen omille asiakkaille. Hinnat tarkistetaan laskuriin yhtiön omasta hinnastosta.' },
        { q: 'Kannattaako vapaa-ajan asunnolle yleissähkön siirto?', a: `Yleensä kyllä, koska mökin kulutus on pieni ja muiden tuotteiden perusmaksu on suurempi. Yleissähkön siirron perusmaksu on 3 × 25 ampeerilla ${h.eur(v.p25)} kuukaudessa, ja se maksetaan myös silloin, kun mökki on tyhjillään. Vuodessa pelkkä perusmaksu on siis ${h.eur(v.p25 * 12, 0)}. Jos mökki on käytössä vain kesällä, kannattaa tarkistaa myös liittymän ylläpitomaksu.` },
        { q: 'Milloin Järvi-Suomen Energian yösähkö kannattaa?', a: `Yösähkön siirto on päivällä ${h.c(v.a.energia.paiva!)} ja yöllä ${h.c(v.a.energia.yo!)}, ja perusmaksu 3 × 25 ampeerilla ${h.eur(v.a25)} kuukaudessa. Laskelmamme mukaan yösähkö ohittaa yleissähkön noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattitunnin talvipainotteisella vuosikulutuksella. Varaavassa lämmityksessä raja on alempi. Vuodenaikasähkö on vaihtoehto, jos talvipäivien kulutusta voi korvata puulämmityksellä.` },
        { q: 'Milloin lämmityksen ohjaus kytkeytyy päälle?', a: 'Hinnaston mukaan etäluettavilla mittareilla annettava lämmityksen ohjaus kytkeytyy satunnaisesti joka ilta kello 22 ja 23 välillä, jotta kaikki lämmitykset eivät käynnisty samalla hetkellä. Mittarin laskureille kulutus kertyy silti aina siirtotuotteen aikajaotuksen mukaisesti, eli kello 22 alkaen yöhinnalla. Laskuri käyttää samaa aikajakoa jokaisessa vartissa.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Hinnasto ${h.date(v.t.v.voimassa!)} alkaen</h2>
${hintaTaulukko(h, v.t)}
<p>Vuodenaika- ja yösähkön siirrolla on Järvi-Suomen Energialla sama perusmaksu, ja kerros- ja rivitaloille, joissa on vähintään kolme huoneistoa, on yleissähkössä omat alemmat perusmaksut. Hinnoissa on mukana arvonlisävero 25,5 prosenttia, ja sähkövero peritään niiden lisäksi.</p>
<h2>Siirron vuosikustannus</h2>
${vuosiTaulukko(h, v.t)}
<p>Kun siirto maksaa näin paljon, pörssisähkön halpa tunti ei tee kilowattitunnista halpaa: vaikka pörssihinta olisi nolla, kokonaishinta on silti siirron ja veron summa, ${h.c(v.y.energia.kaikki! + h.M.VERO_C)}. Siksi energian säästäminen ja oikea siirtotuote vaikuttavat alueella laskuun enemmän kuin kulutuksen ajoitus pelkän pörssihinnan mukaan.</p>
<h2>Mitä tehdä kalliin siirron alueella</h2>
<p>Tarkista ensin, että siirtotuote vastaa kulutustasi; sähkölämmitteisessä talossa vuodenaika- tai yösähkö voi olla satoja euroja halvempi. Harkitse myös, tarvitaanko suurta pääsulaketta, sillä perusmaksun ero 3 × 25 ja 3 × 35 ampeerin välillä on ${h.eur(v.p35 - v.p25)} kuukaudessa. ${h.a('saunan-hinta', 'Saunan')} ja muiden suurten kulutusten hinnan näet laitelaskureista. Vertaa naapuriverkkoon ${h.a('siirto-savon-voima', 'Savon Voimaan')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-jarvi-suomen-energia',
    nav: 'Järvi-Suomen Energia',
    card: 'Järvi-Suomen Energia’s transfer fees and the all-in spot price in South Savo and the Lakeland.',
    title: 'Järvi-Suomen Energia Transfer Fee 2026: Spot Price All-in',
    description: 'Järvi-Suomen Energia transfer fees 2026 in South Savo: general, seasonal and night transfer. The all-in spot price by quarter hour and the annual transfer cost.',
    h1: 'Järvi-Suomen Energia: when transfer is the biggest part of the bill',
    intro: 'On Järvi-Suomen Energia’s rural network transfer often costs more than the electricity itself. The calculator shows the all-in price of every quarter hour.',
    resume: (h) => {
      const v = V(h);
      return `Järvi-Suomen Energia distributes electricity across a wide, sparsely populated area of South Savo and the rest of the Finnish Lakeland, where there is a lot of network per customer. That shows in prices. The price list applies from ${h.date(v.t.v.voimassa!)}, and general transfer costs ${h.c(v.y.energia.kaikki!)} including VAT. The basic fee is ${h.eur(v.p25)} a month for a 3 × 25 A house and ${h.eur(v.p35)} on 3 × 35 A. For a house using 5,000 kilowatt-hours, transfer on Järvi-Suomen Energia’s network costs about ${h.eur(v.ero, 0)} a year more than on Caruna Espoo’s, ranking ${v.t.sija5} of the calculator’s ${v.t.n} networks from cheapest. The all-in spot price on general transfer averages ${v.t.arvio ? `an estimated ${h.c(v.t.paiva.ka)}` : `${h.c(v.t.paiva.ka)} today`}, a large share of it transfer and tax. The calculator is preset to general transfer for a house; switch to your own product and contract to see every quarter hour’s all-in price and your monthly fees.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Why is transfer with Järvi-Suomen Energia so expensive?', a: 'Transfer prices depend on how much network each customer needs and how much of it must be renewed. In the Lakeland distances are long and customers few, and lines have been rebuilt as weatherproof underground cable. The Energy Authority caps the company’s return, but costs are shared among the area’s own customers.' },
        { q: 'Is general transfer right for a holiday home?', a: `Usually yes, because a cottage uses little and the other products have higher basic fees. The general transfer basic fee is ${h.eur(v.p25)} a month on 3 × 25 A and is due even when the cottage is empty, ${h.eur(v.p25 * 12, 0)} a year from the basic fee alone.` },
        { q: 'When does Järvi-Suomen Energia’s night transfer pay?', a: `Night transfer costs ${h.c(v.a.energia.paiva!)} by day and ${h.c(v.a.energia.yo!)} at night, with a 3 × 25 A basic fee of ${h.eur(v.a25)} a month. By our calculation it overtakes general transfer at about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours of winter-heavy annual use. With storage heating the threshold is lower.` },
        { q: 'When does the heating control switch on?', a: 'According to the price list, heating control via remotely read meters switches on at a random moment between 22:00 and 23:00 each evening, so that not all heating starts at once. Consumption is still recorded by the product’s time split, at the night rate from 22:00.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Price list from ${h.date(v.t.v.voimassa!)}</h2>
${hintaTaulukko(h, v.t)}
<p>Seasonal and night transfer share the same basic fee at Järvi-Suomen Energia, and general transfer has lower basic fees for blocks of flats and terraced houses with at least three dwellings. Prices include 25.5% VAT, and electricity tax is charged on top.</p>
<h2>Annual transfer cost</h2>
${vuosiTaulukko(h, v.t)}
<p>When transfer costs this much, a cheap spot hour does not make a kilowatt-hour cheap: even at a zero exchange price the all-in price is transfer plus tax, ${h.c(v.y.energia.kaikki! + h.M.VERO_C)}. Saving energy and choosing the right transfer product therefore affect the bill more here than timing use by the spot price alone.</p>
<h2>What to do in a high-transfer area</h2>
<p>First check that your transfer product fits your use; in an electrically heated house seasonal or night transfer can be hundreds of euros cheaper. Also consider whether you need a large main fuse, since the basic fee gap between 3 × 25 A and 3 × 35 A is ${h.eur(v.p35 - v.p25)} a month. The appliance calculators show what a ${h.a('saunan-hinta', 'sauna')} or other large load costs. Compare with the neighbouring ${h.a('siirto-savon-voima', 'Savon Voima network')}.</p>`;
    },
  },
});
