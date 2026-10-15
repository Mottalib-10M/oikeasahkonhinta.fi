import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => { const t = verkkoTiedot('caruna'); const y = t.yleis, a = t.aika!, k = t.kausi!; return { t, y, a, k, kt: h.M.perusKk(y, 'kt'), p25: h.M.perusKk(y, '3x25'), p35: h.M.perusKk(y, '3x35') }; };

export default defineGuide({
  id: 'siirto-caruna',
  group: 'verkko',
  order: 10,
  tool: 'tanaan',
  toolProps: { verkko: 'caruna', sulake: 1 },
  related: ['siirtohinnat', 'siirto-caruna-espoo', 'siirtomaksu', 'porssi-vai-kiintea', 'sahkovero'],
  sources: ['caruna', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-caruna',
    nav: 'Caruna',
    card: 'Caruna Oy:n yleis-, yö- ja kausisiirto sekä pörssisähkön kokonaishinta Carunan alueella.',
    title: 'Caruna siirtohinta 2026: pörssisähkö siirron ja veron kanssa',
    description: 'Caruna Oy:n siirtohinnat 2026: yleissiirto, yösiirto ja kausisiirto sekä perusmaksut. Näe pörssisähkön kokonaishinta Carunan alueella vartti vartilta tänään.',
    h1: 'Caruna Oy: siirtohinta ja pörssisähkön kokonaishinta',
    intro: 'Caruna Oy:n verkossa sähkö maksaa enemmän kuin pörssihinta kertoo. Laskuri lisää Carunan siirtomaksun ja verot jokaiseen varttiin.',
    resume: (h) => {
      const v = V(h);
      return `Caruna Oy siirtää sähköä laajalla alueella Länsi-Suomessa, Uudellamaalla, Satakunnassa ja Pohjanmaalla. Yhtiön voimassa oleva verkkopalveluhinnasto on tullut voimaan ${h.date(v.t.v.voimassa!)}, ja sitä ei ole sen jälkeen muutettu. Yleissiirron siirtomaksu on ${h.c(v.y.energia.kaikki!)} arvonlisäveron kanssa ja perusmaksu 3 × 25 ampeerin omakotitalossa ${h.eur(v.p25)} kuukaudessa, kerros- ja rivitaloasunnossa ${h.eur(v.kt)}. Kun pörssihintaan lisätään marginaali, siirto ja sähkövero, kilowattitunnin keskihinta Carunan yleissiirrolla on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} ${h.c(v.t.paiva.ka)}. Omakotitalon 5 000 kilowattitunnin siirto on Carunan verkossa ${v.t.sija5}. edullisin laskurin ${v.t.n} verkosta, joten perusmaksun osuus laskusta on suuri. Laskuri on valmiiksi asetettu Carunan yleissiirtoon ja omakotitaloon; vaihda tilalle oma siirtotuotteesi, sulakkeesi ja sopimuksesi, niin näet jokaisen vartin kokonaishinnan, päivän halvimman jakson ja kuukausittaiset perusmaksut. Postinumerokenttä tarkistaa, kuuluuko osoitteesi Caruna Oy:n vai Caruna Espoon verkkoon, sillä yhtiöiden hinnat poikkeavat toisistaan selvästi.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miksi Carunan perusmaksu on omakotitalossa niin suuri?', a: `Carunan perusmaksu määräytyy pääsulakkeen mukaan, ja 3 × 25 ampeerin liittymällä se on ${h.eur(v.p25)} kuukaudessa, 3 × 35 ampeerilla jo ${h.eur(v.p35)}. Yhtiö perustelee perusmaksua sillä, että verkon on oltava valmis siirtämään sulakkeen mukainen teho milloin tahansa. Pieni vuosikulutus ei siksi juuri laske siirtolaskua.` },
        { q: 'Kannattaako Carunan yösiirto?', a: `Yösiirrossa päivän siirtomaksu on ${h.c(v.a.energia.paiva!)} ja yön (kello 22–7) ${h.c(v.a.energia.yo!)}, mutta perusmaksu on 3 × 25 A liittymässä ${h.eur(h.M.perusKk(v.a, '3x25'))}. Laskelmamme mukaan yösiirto tulee talvipainotteisella kulutuksella yleissiirtoa halvemmaksi noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattitunnin vuosikulutuksesta alkaen, kun kulutus jakautuu tasaisesti vuorokaudelle. Jos pystyt ajoittamaan lämmityksen yöhön, raja on matalampi.` },
        { q: 'Saako kerrostaloasunto Carunalla halvemman perusmaksun?', a: `Saa, jos liittymän takana on vähintään kolme mitattua käyttöpaikkaa. Silloin yleissiirron perusmaksu on ${h.eur(v.kt)} kuukaudessa enintään 25 ampeerin sulakkeella. Yksittäinen yksivaiheinen käyttöpaikka, kuten mökki, maksaa ${h.eur(h.M.perusKk(v.y, '1x25'))} kuukaudessa. Taloyhtiön kannattaa varmistaa, että kaikki huoneistot on mitattu erikseen, jotta alempi hinta on käytössä.` },
        { q: 'Onko Caruna Espoo sama yhtiö kuin Caruna Oy?', a: 'Ei hinnaston osalta. Caruna Espoo Oy palvelee Espoota, Kauniaista, Kirkkonummea ja Joensuun keskustaa omalla, selvästi edullisemmalla hinnastollaan. Kaikki muut Carunan alueet kuuluvat Caruna Oy:lle. Tarkista yhtiön nimi siirtolaskusta tai syötä postinumero laskuriin, joka hakee oikean verkkoyhtiön Energiaviraston postinumeroluettelosta ja valitsee sen hinnaston automaattisesti.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Carunan hinnat yhdellä silmäyksellä</h2>
${hintaTaulukko(h, v.t)}
<p>Hinnasto on ollut sama ${h.date(v.t.v.voimassa!)} lähtien, joten Carunan asiakkaan siirtolasku on muuttunut sen jälkeen lähinnä sähköveron ja kulutuksen vuoksi. Sähkövero nousi ${h.date(h.P.vero.voimassa)}, kun huoltovarmuusmaksu kasvoi, ja se näkyy samalla Carunan laskulla.</p>
<h2>Kolme tuotetta, kolme käyttäjää</h2>
${vuosiTaulukko(h, v.t)}
<p>Yleissiirto on Carunan oletus ja yleensä halvin kerros- ja rivitaloasunnoissa sekä taloissa, joissa ei ole sähkölämmitystä. Yösiirto on tehty varaavalle sähkölämmitykselle: se kannattaa, kun suuri osa sähköstä menee kello 22 jälkeen esimerkiksi varaajaan tai lämminvesivaraajaan. Kausisiirto sopii suoralle sähkölämmitykselle, jos talvella voi käyttää myös takkaa tai ilmalämpöpumppua, sillä talviarkipäivän ${h.c(v.k.energia.talvipaiva!)} on Carunan kallein siirtohinta mutta muu aika vain ${h.c(v.k.energia.muu!)}.</p>
<h2>Pörssisähkö Carunan verkossa</h2>
<p>Koska yleissiirron siirtomaksu on sama kaikkina vuorokauden aikoina, pörssihinnan vaihtelu siirtyy Carunan asiakkaan kokonaishintaan sellaisenaan. Yösiirrossa ero kasvaa: yöllä siirto on ${h.c(v.a.energia.paiva! - v.a.energia.yo!)} päivää halvempi, joten halvan yön pörssihinta ja halpa siirto osuvat samaan aikaan. Laskuri yllä näyttää molemmat vaikutukset jokaiselle vartille. Vertaa Carunaa muihin verkkoihin ${h.a('siirtohinnat', 'siirtohintojen vertailussa')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-caruna',
    nav: 'Caruna',
    card: 'Caruna Oy’s general, night and seasonal transfer and the all-in spot price in Caruna’s area.',
    title: 'Caruna Transfer Fee 2026: Spot Electricity All-in Price',
    description: 'Caruna Oy transfer fees 2026: general, night and seasonal transfer plus basic fees. See the all-in spot electricity price in Caruna’s area, quarter by quarter.',
    h1: 'Caruna Oy: transfer fee and all-in spot electricity price',
    intro: 'On Caruna Oy’s network electricity costs more than the exchange price suggests. The calculator adds Caruna’s transfer fee and taxes to every quarter hour.',
    resume: (h) => {
      const v = V(h);
      return `Caruna Oy distributes electricity across a wide area of western Finland, Uusimaa, Satakunta and Ostrobothnia. Its current network price list took effect on ${h.date(v.t.v.voimassa!)} and has not changed since. The general transfer fee is ${h.c(v.y.energia.kaikki!)} including VAT, and the basic fee is ${h.eur(v.p25)} a month for a house on a 3 × 25 A fuse and ${h.eur(v.kt)} for a flat or terraced home. Adding margin, transfer and electricity tax to the exchange price, the average kilowatt-hour on Caruna’s general transfer costs ${v.t.arvio ? `an estimated ${h.c(v.t.paiva.ka)}` : `${h.c(v.t.paiva.ka)} today`}. For a house using 5,000 kilowatt-hours, transfer on Caruna’s network ranks ${v.t.sija5} out of the calculator’s ${v.t.n} networks from cheapest, so the basic fee weighs heavily on the bill. Choose your product and contract below to see the price of every quarter hour.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Why is Caruna’s basic fee so high for a house?', a: `Caruna’s basic fee depends on the main fuse: ${h.eur(v.p25)} a month on 3 × 25 A and already ${h.eur(v.p35)} on 3 × 35 A. The company argues the network must be ready to carry the fuse’s full power at any time. Low annual use therefore barely reduces the transfer bill.` },
        { q: 'Is Caruna’s night transfer worth it?', a: `On night transfer the daytime fee is ${h.c(v.a.energia.paiva!)} and the night fee (22:00–07:00) ${h.c(v.a.energia.yo!)}, but the basic fee on 3 × 25 A is ${h.eur(h.M.perusKk(v.a, '3x25'))}. By our calculation night transfer beats general transfer from about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours a year with winter-heavy use spread evenly over the day.` },
        { q: 'Do flats get a lower basic fee from Caruna?', a: `Yes, if at least three metered sites share the connection. The general transfer basic fee is then ${h.eur(v.kt)} a month on a fuse of up to 25 A. A single one-phase site such as a cottage pays ${h.eur(h.M.perusKk(v.y, '1x25'))}. Housing companies should make sure every flat is metered separately to qualify.` },
        { q: 'Is Caruna Espoo the same as Caruna Oy?', a: 'Not for prices. Caruna Espoo Oy serves Espoo, Kauniainen, Kirkkonummi and central Joensuu with its own, much cheaper price list. Every other Caruna area belongs to Caruna Oy. Check the company name on your transfer bill or enter your postcode in the calculator.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Caruna’s prices at a glance</h2>
${hintaTaulukko(h, v.t)}
<p>The price list has been unchanged since ${h.date(v.t.v.voimassa!)}, so a Caruna customer’s transfer bill has moved mainly with electricity tax and consumption since then. Electricity tax rose on ${h.date(h.P.vero.voimassa)} when the security-of-supply fee increased, and it appears on the same Caruna bill.</p>
<h2>Three products, three users</h2>
${vuosiTaulukko(h, v.t)}
<p>General transfer is Caruna’s default and usually cheapest for flats, terraced homes and houses without electric heating. Night transfer is designed for storage electric heating: it pays when much of your power goes in after 22:00, for example into a heat store or water heater. Seasonal transfer suits direct electric heating if you can also use a fireplace or air heat pump in winter, since the winter weekday rate of ${h.c(v.k.energia.talvipaiva!)} is Caruna’s highest transfer price while other times cost only ${h.c(v.k.energia.muu!)}.</p>
<h2>Spot electricity on Caruna’s network</h2>
<p>Because the general transfer fee is the same at every hour, swings in the exchange price pass straight into a Caruna customer’s all-in price. On night transfer the gap widens: transfer is ${h.c(v.a.energia.paiva! - v.a.energia.yo!)} cheaper at night, so cheap night-time spot prices and cheap transfer coincide. The calculator above shows both effects for every quarter hour. Compare Caruna with the other networks in the ${h.a('siirtohinnat', 'transfer fee comparison')}.</p>`;
    },
  },
});
