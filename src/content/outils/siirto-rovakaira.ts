import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('rovakaira'); const y = t.yleis, a = t.aika, k = t.kausi;
  const p25 = h.M.perusKk(y, '3x25'), a25 = a ? h.M.perusKk(a, '3x25') : 0, k25 = k ? h.M.perusKk(k, '3x25') : 0;
  return {
    t, y, a, k, pkt: h.M.perusKk(y, 'kt'), p25, a25, k25,
    /** Aikasähkön päiväsiirron ero yleissähköön, c/kWh. */
    eroAika: (a?.energia.paiva ?? 0) - (y.energia.kaikki ?? 0),
    /** Kausisähkön talviarkipäivän ja muun ajan ero, c/kWh. */
    eroKausi: (k?.energia.talvipaiva ?? 0) - (k?.energia.muu ?? 0),
    /** Perusmaksun lisä yleissähköön verrattuna 3 × 25 A:lla, €/vuosi. */
    lisaAika: (a25 - p25) * 12, lisaKausi: (k25 - p25) * 12,
    asiakkaat: t.v.asiakkaat?.maara ?? 0,
  };
};

export default defineGuide({
  id: 'siirto-rovakaira',
  group: 'verkko',
  order: 31,
  tool: 'tanaan',
  toolProps: { verkko: 'rovakaira', sulake: 1 },
  related: ['siirtohinnat', 'siirto-elenia', 'saunan-hinta', 'huomenna', 'porssi-vai-kiintea'],
  sources: ['rovakaira', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-rovakaira',
    nav: 'Rovakaira',
    card: 'Rovakairan yleis-, aika- ja kausisähkön siirto sekä pörssisähkön kokonaishinta Rovaniemellä, Kittilässä ja Sodankylässä.',
    title: 'Rovakaira siirtohinta 2026: Rovaniemi, Kittilä, Sodankylä',
    description: 'Rovakairan siirtohinnat 2026: yleis-, aika- ja kausisähkö Rovaniemellä, Kittilässä ja Sodankylässä. Pörssisähkön kokonaishinta siirron ja verojen kanssa.',
    h1: 'Rovakaira: pörssisähkön hinta Rovaniemellä, Kittilässä ja Sodankylässä',
    intro: 'Rovakairan verkossa talven arkipäivät ratkaisevat paljon: kausisähkössä ne ovat vuoden kallein jakso. Laskuri lisää siirron ja verot jokaiseen varttiin.',
    resume: (h) => {
      const v = V(h);
      return `Rovakaira Oy kertoo olevansa Lapin suurin verkkopalveluyhtiö. Se jakaa sähköä Kittilän, Rovaniemen ja Sodankylän alueella, ja asiakkaita on yli ${h.num(v.asiakkaat)}. Verkkopalveluhinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen, eikä kotitalouksien kolmessa siirtotuotteessa ole tehomaksua. Yleissähkön siirto maksaa ${h.c(v.y.energia.kaikki!)}, ja perusmaksu on 3 × 25 ampeerilla ${h.eur(v.p25)} kuukaudessa. Edullisempi ${h.eur(v.pkt)} koskee hinnaston mukaan vain kerros- tai rivitaloa, jonka liittymässä on vähintään viisi käyttöpaikkaa. Aikasähkön päiväsiirto kello 7–22 on ${h.c(v.a?.energia.paiva ?? 0)} ja yösiirto ${h.c(v.a?.energia.yo ?? 0)}. Kausisähkössä talviarkipäivä, marraskuusta maaliskuuhun maanantaista lauantaihin kello 7–22, maksaa ${h.c(v.k?.energia.talvipaiva ?? 0)} ja kaikki muu aika ${h.c(v.k?.energia.muu ?? 0)}. Kausisähkön perusmaksu ${h.eur(v.k25)} on ${v.k25 < v.a25 ? 'pienempi' : 'suurempi'} kuin aikasähkön ${h.eur(v.a25)}. Omakotitalon 5 000 kilowattitunnin siirto on Rovakairalla ${v.t.sija5}. edullisin laskurin ${v.t.n} verkosta ja kerrostalon 2 000 kilowattitunnin siirto ${v.t.sija2}. edullisin. Hinnaston mukaan verojen osuus siirtolaskusta on noin puolet. Laskuri on asetettu yleissähkön siirtoon; vaihda tuotteeksi aika- tai kausisähkö, niin näet, miten pörssihinnan halvat varttit osuvat Rovakairan halpoihin jaksoihin.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Kuka saa Rovakairan kerrostalohinnan?', a: `Hinnaston mukaan yleissähkön ${h.eur(v.pkt)} kuukausihinta koskee kerros- tai rivitaloa, jonka pääsulake on enintään 3 × 25 ampeeria ja jonka liittymässä on vähintään viisi käyttöpaikkaa. Paritalo tai pieni rivitalo, jossa käyttöpaikkoja on vähemmän, maksaa 3 × 25 ampeerin perusmaksun ${h.eur(v.p25)}. Ero on ${h.eur((v.p25 - v.pkt) * 12, 0)} vuodessa. Siirtomaksu ${h.c(v.y.energia.kaikki!)} on sama molemmissa.` },
        { q: 'Milloin Rovakairan kausisähkön siirto tulee edulliseksi?', a: `Kausisähkössä marras–maaliskuun arkipäivät maanantaista lauantaihin kello 7–22 maksavat ${h.c(v.k?.energia.talvipaiva ?? 0)}, muu aika ${h.c(v.k?.energia.muu ?? 0)}, eli ero on ${h.c(v.eroKausi)}. Sunnuntai, illat ja yöt sekä koko huhti–lokakuu ovat halvempaa aikaa. Laskelmamme mukaan kausisähkö ohittaa yleissähkön noin ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowattitunnin talvipainotteisella vuosikulutuksella.` },
        { q: 'Miksi Rovakairan aikasähkön päiväsiirto on lähes yleissähkön hintainen?', a: `Aikasähkön päiväsiirto kello 7–22 on ${h.c(v.a?.energia.paiva ?? 0)}, vain ${h.c(v.eroAika, 2)} enemmän kuin yleissähkön ${h.c(v.y.energia.kaikki!)}. Yösiirto kello 22–7 on ${h.c(v.a?.energia.yo ?? 0)}. Perusmaksu on kuitenkin 3 × 25 ampeerilla ${h.eur(v.lisaAika, 0)} vuodessa suurempi. Laskelmamme mukaan aikasähkö ohittaa yleissähkön noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattitunnin talvipainotteisella kulutuksella.` },
        { q: 'Paljonko Rovakairan siirtolaskusta on veroja?', a: `Hinnaston mukaan noin puolet. Rovakaira laskuttaa siirtomaksun lisäksi sähköveron, huoltovarmuusmaksun ja arvonlisäveron; sähkövero ja huoltovarmuusmaksu ovat veroluokassa 1 yhteensä ${h.c(h.M.VERO_C, 4)}. Siirtotuotteen voi valita vapaasti, mutta vaihtaa vain kerran 12 kuukauden aikana. Vaihto on hinnaston maksuttomissa palveluissa, joten tuotteen voi vaihtaa vaikka ennen lämmityskautta.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Rovakairan siirtohinnat</h2>
${hintaTaulukko(h, v.t)}
<p>Aika- ja kausisähköllä ei ole kerrostalohintaa, joten niiden kerrostalosarakkeessa on 3 × 25 ampeerin perusmaksu. Kausisähkön kahden hinnan ero, ${h.c(v.eroKausi)}, on Rovakairan tuotteista suurin: talviarkipäivän kilowattitunti on selvästi muun ajan hintaa kalliimpi. Hinnaston mukaan siirtotuotteen voi valita vapaasti jännitetason sisällä.</p>
<h2>Vuosikustannus Rovakairan verkossa</h2>
${vuosiTaulukko(h, v.t)}
<p>Pienellä kulutuksella yleissähkö on edullisin, koska sen perusmaksu on pienin. Aikasähkön perusmaksu on ${h.eur(v.lisaAika, 0)} ja kausisähkön ${h.eur(v.lisaKausi, 0)} vuodessa yleissähköä suurempi, joten ne tulevat edullisemmiksi vasta suurella, lämmityksen painottamalla kulutuksella. Taulukon sähkölämmitteinen talo käyttää 18 000 kilowattituntia talvipainotteisesti.</p>
<h2>Pörssisähkö Lapin talvessa</h2>
<p>Kausisähkön kallis jakso osuu talven arkipäiviin, jolloin myös pörssihinta voi olla korkea. Silloin kallis vartti ja kallis siirto kasautuvat, kun taas sunnuntaina ja kello 22 jälkeen siirto on halpaa, osui pörssihinta mihin tahansa. ${h.a('saunan-hinta', 'Saunan lämmitys')} ja varaajan lataus kannattaa katsoa ${h.a('huomenna', 'huomisen hinnoista')}. Muualla Lapissa verkkoyhtiö voi olla ${h.a('siirto-elenia', 'Elenia')}; ${h.a('siirtohinnat', 'siirtohintojen vertailu')} näyttää kaikki laskurin verkot rinnakkain.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-rovakaira',
    nav: 'Rovakaira',
    card: 'Rovakaira’s general, time-of-day and seasonal transfer and the all-in spot price in Rovaniemi, Kittilä and Sodankylä.',
    title: 'Rovakaira Transfer Fee 2026: Rovaniemi, Kittilä, Sodankylä',
    description: 'Rovakaira transfer fees 2026: general, time-of-day and seasonal transfer in Rovaniemi, Kittilä and Sodankylä. The all-in spot price with transfer and taxes.',
    h1: 'Rovakaira: the spot electricity price in Rovaniemi, Kittilä and Sodankylä',
    intro: 'On Rovakaira’s network winter weekdays matter most: on seasonal transfer they are the year’s dearest period. The calculator adds transfer and taxes to every quarter hour.',
    resume: (h) => {
      const v = V(h);
      return `Rovakaira Oy describes itself as Lapland’s largest distribution company. It supplies electricity in the Kittilä, Rovaniemi and Sodankylä area and has more than ${h.num(v.asiakkaat)} customers. Its price list applies from ${h.date(v.t.v.voimassa!)}, and none of its three household transfer products has a power fee. General transfer costs ${h.c(v.y.energia.kaikki!)}, with a basic fee of ${h.eur(v.p25)} a month on 3 × 25 A. The lower ${h.eur(v.pkt)} applies, according to the price list, only to a block of flats or terraced house whose connection has at least five metering points. Time-of-day transfer costs ${h.c(v.a?.energia.paiva ?? 0)} by day (07:00–22:00) and ${h.c(v.a?.energia.yo ?? 0)} at night. On seasonal transfer a winter weekday, November to March, Monday to Saturday 07:00–22:00, costs ${h.c(v.k?.energia.talvipaiva ?? 0)} and all other time ${h.c(v.k?.energia.muu ?? 0)}. The seasonal basic fee of ${h.eur(v.k25)} is ${v.k25 < v.a25 ? 'lower' : 'higher'} than the time-of-day fee of ${h.eur(v.a25)}. For a house using 5,000 kilowatt-hours Rovakaira ranks ${v.t.sija5} of the calculator’s ${v.t.n} networks from cheapest, and ${v.t.sija2} for a flat using 2,000. The price list says taxes make up about half of the transfer bill. The calculator is set to general transfer; switch to time-of-day or seasonal to see how cheap spot quarters line up with Rovakaira’s cheap periods.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Who qualifies for Rovakaira’s apartment rate?', a: `According to the price list, the general transfer rate of ${h.eur(v.pkt)} a month applies to a block of flats or terraced house with a main fuse of at most 3 × 25 A and at least five metering points on the connection. A semi-detached house or small terrace with fewer metering points pays the 3 × 25 A basic fee of ${h.eur(v.p25)}. The gap is ${h.eur((v.p25 - v.pkt) * 12, 0)} a year. The transfer fee of ${h.c(v.y.energia.kaikki!)} is the same for both.` },
        { q: 'When does Rovakaira’s seasonal transfer become cheaper?', a: `On seasonal transfer, weekdays from November to March, Monday to Saturday 07:00–22:00, cost ${h.c(v.k?.energia.talvipaiva ?? 0)} and other times ${h.c(v.k?.energia.muu ?? 0)}, a gap of ${h.c(v.eroKausi)}. Sundays, evenings, nights and the whole of April to October are the cheap period. By our calculation seasonal transfer overtakes general transfer at about ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowatt-hours a year of winter-heavy use.` },
        { q: 'Why is Rovakaira’s day-time transfer almost the general rate?', a: `Time-of-day transfer by day, 07:00–22:00, costs ${h.c(v.a?.energia.paiva ?? 0)}, only ${h.c(v.eroAika, 2)} more than general transfer’s ${h.c(v.y.energia.kaikki!)}. Night transfer, 22:00–07:00, costs ${h.c(v.a?.energia.yo ?? 0)}. The basic fee, however, is ${h.eur(v.lisaAika, 0)} a year higher on 3 × 25 A. By our calculation time-of-day transfer overtakes general transfer at about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours of winter-heavy use.` },
        { q: 'How much of Rovakaira’s transfer bill is tax?', a: `About half, according to the price list. On top of the transfer fee Rovakaira bills electricity tax, the security-of-supply fee and VAT; in tax class 1 the electricity tax and security-of-supply fee come to ${h.c(h.M.VERO_C, 4)}. You may choose any transfer product but switch only once in 12 months. A switch is listed among the free services, so you can change product before the heating season, for example.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Rovakaira’s transfer prices</h2>
${hintaTaulukko(h, v.t)}
<p>Time-of-day and seasonal transfer have no apartment rate, so their flat column shows the 3 × 25 A basic fee. Seasonal transfer’s gap of ${h.c(v.eroKausi)} between its two rates is the widest of Rovakaira’s products: a winter weekday kilowatt-hour costs well above the other-time rate. According to the price list the transfer product can be chosen freely within the voltage level.</p>
<h2>Annual cost on Rovakaira’s network</h2>
${vuosiTaulukko(h, v.t)}
<p>At low use general transfer is cheapest because its basic fee is lowest. Time-of-day transfer’s basic fee is ${h.eur(v.lisaAika, 0)} and seasonal’s ${h.eur(v.lisaKausi, 0)} a year above general transfer’s, so they only catch up at high, heating-led consumption. The electrically heated house in the table uses 18,000 kilowatt-hours weighted towards winter.</p>
<h2>Spot electricity in the Lapland winter</h2>
<p>Seasonal transfer’s expensive period falls on winter weekdays, when the spot price can also be high. A dear quarter and dear transfer then stack up, whereas on Sundays and after 22:00 transfer is cheap whatever the spot price does. Check ${h.a('huomenna', 'tomorrow’s prices')} before ${h.a('saunan-hinta', 'heating the sauna')} or charging a hot-water tank. Elsewhere in Lapland the operator may be ${h.a('siirto-elenia', 'Elenia')}; the ${h.a('siirtohinnat', 'transfer price comparison')} shows every network in the calculator side by side.</p>`;
    },
  },
});
