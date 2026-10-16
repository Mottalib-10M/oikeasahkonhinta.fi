import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('vantaa'); const tt = t.v.tuotteet;
  const kt = tt.find((x) => x.nimi === 'Kerrostalosiirto')!, y = tt.find((x) => x.nimi === 'Yleissiirto')!;
  const a = t.aika, k = t.kausi;
  /** Kerrostalosiirron etu yleissiirtoon nähden 2 000 kWh:n kerrostaloasunnossa, €/vuosi. */
  const ktEtu = t.vuosi(y, 2000, 'kt', 'tasainen') - t.vuosi(kt, 2000, 'kt', 'tasainen');
  return {
    t, kt, y, a, k, ktEtu,
    pk: h.M.perusKk(kt, 'kt'), py: h.M.perusKk(y, '3x25'), py35: h.M.perusKk(y, '3x35'),
    pa: a ? h.M.perusKk(a, '3x25') : null, pkk: k ? h.M.perusKk(k, '3x25') : null,
    tasA: t.tasapaino(a, y), tasK: t.tasapaino(k, y),
  };
};

export default defineGuide({
  id: 'siirto-vantaa',
  group: 'verkko',
  order: 23,
  tool: 'tanaan',
  toolProps: { verkko: 'vantaa', sulake: 1 },
  related: ['siirtohinnat', 'siirto-helen', 'siirto-caruna-espoo', 'sahkoauton-lataus', 'porssi-vai-kiintea'],
  sources: ['vantaa', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-vantaan-energia',
    nav: 'Vantaan Energia',
    card: 'Vantaan Energian kerrostalo-, yleis-, aika- ja kausisiirto sekä pörssisähkön kokonaishinta Vantaalla.',
    title: 'Vantaan Energia siirtohinta 2026: aika- ja kausisiirto',
    description: 'Vantaan Energian siirtohinnat 2026: uusi Kerrostalosiirto, yleissiirto sama perusmaksu kaikille 25–63 A sulakkeille, aika- ja kausisiirto. Hinta varteittain.',
    h1: 'Vantaan Energia: pörssisähkön hinta Vantaalla siirron kanssa',
    intro: 'Vantaalla siirron perusmaksu ei kasva sulakkeen mukana, ja kerrostaloille on huhtikuusta 2026 alkaen oma tuote. Laskuri lisää siirron ja verot jokaiseen varttiin.',
    resume: (h) => {
      const v = V(h);
      return `Vantaan Energia Sähköverkot siirtää sähkön Vantaalla yhtiön mukaan yli ${h.num(v.t.v.asiakkaat!.maara)} asiakkaalle, ja sen verkkopalveluhinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen. Hinnaston erikoisuus on perusmaksu, joka ei riipu pääsulakkeesta: yleissiirrossa se on ${h.eur(v.py)} kuukaudessa kaikilla 25–63 ampeerin sulakkeilla, joten 3 × 35 ampeerin talo maksaa saman ${h.eur(v.py35)} kuin 3 × 25 ampeerin talo. Yleissiirron siirtomaksu on ${h.c(v.y.energia.kaikki!)}. Hinnastoon lisättiin samalla uusi Kerrostalosiirto, jonka siirtomaksu on ${h.c(v.kt.energia.kaikki!)} ja perusmaksu ${h.eur(v.pk)}. ${v.a ? `Aikasiirrossa päivähinta ${h.c(v.a.energia.paiva!)} on voimassa kaikkina viikonpäivinä kello 7–22 ja yöhinta ${h.c(v.a.energia.yo!)} muina aikoina. ` : ''}${v.k ? `Kausisiirron talvipäivähinta ${h.c(v.k.energia.talvipaiva!)} koskee marras–maaliskuun maanantaita–lauantaita kello 7–22, muulloin hinta on ${h.c(v.k.energia.muu!)}. ` : ''}Tehosiirto on hinnaston mukaan tarkoitettu yli 3 × 63 ampeerin käyttöpaikoille, joten tavallisen kodin siirrossa ei ole tehomaksua. Omakotitalon 5 000 kilowattitunnin siirto on Vantaalla ${v.t.sija5}. edullisin laskurin ${v.t.n} verkosta, ja kerrostalon 2 000 kilowattitunnin siirto on ${v.t.sija2}. edullisin. Laskuri on asetettu yleissiirtoon; vaihda tuote ja asunto, niin näet jokaisen vartin kokonaishinnan.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Kenelle Vantaan Energian Kerrostalosiirto on tarkoitettu?', a: `Hinnaston mukaan Kerrostalosiirto on tarkoitettu enintään 3 × 25 ampeerin käyttöpaikoille, jotka sijaitsevat vähintään kymmenen kulutuskäyttöpaikan liittymissä. Tuote tuli hinnastoon ${h.date(v.t.v.voimassa!)}. Sen siirtomaksu on ${h.c(v.kt.energia.kaikki!)} ja perusmaksu ${h.eur(v.pk)} kuukaudessa. Laskelmamme mukaan 2 000 kilowattitunnin asunto maksaa sillä vuodessa noin ${h.eur(v.ktEtu, 0)} vähemmän kuin yleissiirrolla. Laskurissa tuote näkyy, kun valitset asunnoksi kerrostalon.` },
        { q: 'Maksaako suurempi pääsulake Vantaalla enemmän siirrossa?', a: `Ei 63 ampeeriin asti. Hinnaston mukaan yleis-, aika- ja kausisiirron perusmaksu on sama kaikille 25–63 ampeerin sulakkeille, yleissiirrossa ${h.eur(v.py)} kuukaudessa. Vasta 80–100 ampeerin sulakkeille on oma, suurempi perusmaksu. Siirtomaksu ei riipu sulakkeesta lainkaan. Sulakkeen suurentaminen on kuitenkin liittymän muutostyö, josta sovitaan erikseen verkkoyhtiön kanssa. Esimerkiksi sähköauton latausta varten suurennettu sulake ei siis nosta kuukausimaksua.` },
        { q: 'Kumpi on Vantaalla edullisempi, aikasiirto vai kausisiirto?', a: `Molempien perusmaksu on ${v.pa !== null ? h.eur(v.pa) : '–'} kuukaudessa, kaksinkertainen yleissiirron ${h.eur(v.py)} perusmaksuun nähden. Laskelmamme mukaan talvipainotteisessa sähkölämmityksessä aikasiirto ohittaa yleissiirron noin ${v.tasA ? h.num(v.tasA) : '–'} ja kausisiirto noin ${v.tasK ? h.num(v.tasK) : '–'} kilowattitunnin vuosikulutuksella. Aikasiirto palkitsee yökäytöstä joka päivä, kausisiirto vain kulutuksen siirtämisestä pois talven päiviltä. Kausisiirrossa myös kesän päivät ovat halvempaa muuta aikaa.` },
        { q: 'Kuinka usein Vantaan Energian siirtotuotetta voi vaihtaa?', a: 'Hinnaston mukaan valitun tuotteen voi vaihtaa maksutta toiseen tuotteeseen, jos edellisestä tuotevaihdosta on kulunut vähintään 12 kuukautta. Yhtiön verkkoasiointipalvelussa voi myös vertailla itselleen sopivinta verkkopalvelutuotetta. Kannattaa ensin katsoa tämän sivun vuosikustannustaulukosta, millä kulutuksella eri tuotteet kohtaavat, koska väärä valinta sitoo vuodeksi. Myös sähköauton tai lämpöpumpun hankinta voi muuttaa sopivinta tuotetta.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Vantaan Energian verkkopalveluhinnasto</h2>
${hintaTaulukko(h, v.t)}
<p>Taulukon perusmaksut ovat samat 3 × 25 ja 3 × 35 ampeerin sarakkeissa, koska hinnasto hinnoittelee 25–63 ampeerin sulakkeet yhdellä hinnalla. Kerrostalosiirron omakotitalosarakkeissa on viiva: hinnaston mukaan se on vain enintään 3 × 25 ampeerin käyttöpaikoille vähintään kymmenen kulutuskäyttöpaikan liittymissä.</p>
<h2>Vuosikustannus Vantaalla</h2>
${vuosiTaulukko(h, v.t)}
<p>Koska perusmaksu ei kasva sulakkeen mukana, Vantaalla tuotteen valinta ratkeaa lähes kokonaan siirtomaksun perusteella. Aika- ja kausisiirron kaksinkertainen perusmaksu maksaa itsensä takaisin vasta suurella kulutuksella, kun riittävä osa siitä osuu halvempaan aikaan. Yhtiön mukaan valtaosa sen jakeluverkosta kulkee säävarmasti maan alla.</p>
<h2>Pörssisähkö ja aikasiirto Vantaalla</h2>
<p>${v.a ? `Aikasiirrossa yöhinta ${h.c(v.a.energia.yo!)} on ${h.c(v.a.energia.paiva! - v.a.energia.yo!)} päivähintaa halvempi, ja hinnaston mukaan päivähinta koskee myös viikonloppua. ` : ''}Kun pörssisähkön halvimmat vartit osuvat yöhön, siirron ja energian edut kasautuvat, mikä näkyy laskurissa hyppäyksenä kello 22 ja 7. Siksi ${h.a('sahkoauton-lataus', 'sähköauton lataus')} ja lämminvesivaraaja kannattaa ajastaa yöhön, ja ${h.a('huomenna', 'huomisen hinnat')} kertovat, mihin varttiin. Naapurikaupungeissa verkkoyhtiö on Helsingissä ${h.a('siirto-helen', 'Helen')} ja Espoossa ${h.a('siirto-caruna-espoo', 'Caruna Espoo')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-vantaan-energia',
    nav: 'Vantaan Energia',
    card: 'Vantaan Energia’s apartment, general, time-of-day and seasonal transfer and the all-in spot price in Vantaa.',
    title: 'Vantaan Energia Transfer Fee 2026: Time and Seasonal Rates',
    description: 'Vantaan Energia transfer fees 2026: new apartment tariff, one basic fee for all 25–63 A fuses, time-of-day and seasonal transfer. All-in spot price by quarter.',
    h1: 'Vantaan Energia: the spot electricity price in Vantaa with transfer',
    intro: 'In Vantaa the basic transfer fee does not rise with the fuse, and since April 2026 apartment buildings have their own product. The calculator adds transfer and taxes to every quarter hour.',
    resume: (h) => {
      const v = V(h);
      return `Vantaan Energia Sähköverkot distributes electricity in Vantaa to more than ${h.num(v.t.v.asiakkaat!.maara)} customers, according to the company; its price list applies from ${h.date(v.t.v.voimassa!)}. Its distinctive feature is a basic fee that does not depend on the main fuse: general transfer costs ${h.eur(v.py)} a month for every fuse from 25 to 63 A, so a 3 × 35 A house pays the same ${h.eur(v.py35)} as a 3 × 25 A house. The general transfer fee is ${h.c(v.y.energia.kaikki!)}. The same price list added a new apartment tariff, Kerrostalosiirto, at ${h.c(v.kt.energia.kaikki!)} with a basic fee of ${h.eur(v.pk)}. ${v.a ? `On time-of-day transfer the day rate of ${h.c(v.a.energia.paiva!)} applies every day of the week from 07:00 to 22:00, and the night rate of ${h.c(v.a.energia.yo!)} at other times. ` : ''}${v.k ? `Seasonal transfer charges its winter-day rate of ${h.c(v.k.energia.talvipaiva!)} from November to March, Monday to Saturday, 07:00–22:00, and ${h.c(v.k.energia.muu!)} otherwise. ` : ''}Under the price list power-based transfer is for metering points above 3 × 63 A, so an ordinary home pays no power fee. For a house using 5,000 kilowatt-hours Vantaa ranks ${v.t.sija5} of the calculator’s ${v.t.n} networks from cheapest, and ${v.t.sija2} for a 2,000 kWh flat.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Who can use Vantaan Energia’s apartment tariff?', a: `According to the price list, Kerrostalosiirto is for metering points of up to 3 × 25 A located in connections with at least ten consumption points. The product was added on ${h.date(v.t.v.voimassa!)}. Its transfer fee is ${h.c(v.kt.energia.kaikki!)} and its basic fee ${h.eur(v.pk)} a month. By our calculation a 2,000 kWh flat pays about ${h.eur(v.ktEtu, 0)} a year less on it than on general transfer. In the calculator the product appears when you choose a flat.` },
        { q: 'Does a bigger main fuse cost more in Vantaa?', a: `Not up to 63 A. According to the price list, the general, time-of-day and seasonal basic fee is the same for every fuse from 25 to 63 A, ${h.eur(v.py)} a month on general transfer. Only 80–100 A fuses have their own, higher basic fee. The transfer fee does not depend on the fuse at all. Enlarging the fuse is still a connection change agreed separately with the network company. A fuse enlarged for car charging, for example, does not raise the monthly fee.` },
        { q: 'Which is cheaper in Vantaa, time-of-day or seasonal transfer?', a: `Both have a basic fee of ${v.pa !== null ? h.eur(v.pa) : '–'} a month, double general transfer’s ${h.eur(v.py)}. By our calculation, with winter-heavy electric heating, time-of-day transfer overtakes general transfer at about ${v.tasA ? h.num(v.tasA) : '–'} and seasonal transfer at about ${v.tasK ? h.num(v.tasK) : '–'} kilowatt-hours a year. Time-of-day rewards night use every day; seasonal only rewards moving use off winter days. On seasonal transfer, summer days also count as the cheaper other time.` },
        { q: 'How often can you change Vantaan Energia’s transfer product?', a: 'According to the price list, you can switch to another product free of charge if at least 12 months have passed since your previous product change. The company’s online service also lets you compare which network product suits you best. Check this page’s annual cost table first to see where the products cross over, because a wrong choice ties you in for a year. Buying an electric car or a heat pump can also change which product suits you.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Vantaan Energia’s network price list</h2>
${hintaTaulukko(h, v.t)}
<p>The basic fees match in the 3 × 25 A and 3 × 35 A columns because the price list charges a single rate for fuses from 25 to 63 A. The apartment tariff shows dashes in the house columns: under the price list it is only for metering points of up to 3 × 25 A in connections with at least ten consumption points.</p>
<h2>Annual cost in Vantaa</h2>
${vuosiTaulukko(h, v.t)}
<p>Because the basic fee does not grow with the fuse, the choice of product in Vantaa comes down almost entirely to the transfer fee. The doubled basic fee of time-of-day and seasonal transfer only pays for itself at high consumption, when enough of it falls in the cheaper hours. According to the company, most of its distribution network runs weatherproof underground.</p>
<h2>Spot electricity and time-of-day transfer in Vantaa</h2>
<p>${v.a ? `On time-of-day transfer the night rate of ${h.c(v.a.energia.yo!)} is ${h.c(v.a.energia.paiva! - v.a.energia.yo!)} below the day rate, and under the price list the day rate also applies at weekends. ` : ''}When the cheapest spot quarters fall at night, the transfer and energy savings stack up, which shows in the calculator as a step at 22:00 and 07:00. That is why ${h.a('sahkoauton-lataus', 'car charging')} and the water heater are worth timing for the night, and ${h.a('huomenna', 'tomorrow’s prices')} show which quarter. In the neighbouring cities the network operator is ${h.a('siirto-helen', 'Helen')} in Helsinki and ${h.a('siirto-caruna-espoo', 'Caruna Espoo')} in Espoo.</p>`;
    },
  },
});
