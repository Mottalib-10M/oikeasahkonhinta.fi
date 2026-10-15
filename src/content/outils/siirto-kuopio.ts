import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('kuopio'); const y = t.yleis, a = t.aika!;
  const teho = a.teho!.eurKwKk;
  return { t, y, a, teho, p: h.M.perusKk(y, '3x25'), pa: h.M.perusKk(a, '3x25'), t8: teho * 8 * 12 };
};

export default defineGuide({
  id: 'siirto-kuopio',
  group: 'verkko',
  order: 19,
  tool: 'tanaan',
  toolProps: { verkko: 'kuopio', sulake: 1 },
  related: ['tehomaksu', 'siirto-savon-voima', 'siirto-helen', 'siirtohinnat', 'sahkoauton-lataus'],
  sources: ['kuopio', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-kuopio',
    nav: 'Kuopion Sähköverkko',
    card: 'Kuopion Sähköverkon yleissiirto ja tehomaksullinen aikasiirto sekä pörssisähkön kokonaishinta Kuopiossa.',
    title: 'Kuopion Sähköverkko siirtohinta 2026: pörssisähkö kaikkineen',
    description: 'Kuopion Sähköverkon siirtohinnat 2026: yleissiirto ja aikasiirto tehomaksulla. Näe pörssisähkön kokonaishinta Kuopiossa vartti vartilta siirron ja veron kanssa.',
    h1: 'Kuopion Sähköverkko: pörssisähkön hinta Kuopiossa',
    intro: 'Kuopiossa aikasiirtoon kuuluu tehomaksu kuukauden suurimman tunnin mukaan. Laskuri näyttää siirron ja veron jokaisessa vartissa.',
    resume: (h) => {
      const v = V(h);
      return `Kuopion Sähköverkko siirtää sähkön Kuopion kaupunkialueella, kun taas ympäröivä Pohjois-Savo kuuluu suurelta osin Savon Voiman verkkoon. Verkkopalvelumaksut ovat voimassa ${h.date(v.t.v.voimassa!)} alkaen. Yleissiirrossa perusmaksu on ${h.eur(v.p)} kuukaudessa enintään 63 ampeerin liittymille ja siirtomaksu ${h.c(v.y.energia.kaikki!)} arvonlisäveron kanssa. Aikasiirrossa perusmaksu on ${h.eur(v.pa)}, päiväsiirto kello 7–22 maksaa ${h.c(v.a.energia.paiva!)} ja yösiirto ${h.c(v.a.energia.yo!)}, ja lisäksi peritään pätötehomaksua ${h.num(v.teho, 2)} euroa kilowatilta kuukaudessa laskutuskuukauden korkeimman tunnin keskitehon mukaan. Pörssisähkön kokonaishinta yleissiirrolla on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} keskimäärin ${h.c(v.t.paiva.ka)}. Laskuri on asetettu Kuopion yleissiirtoon. Vaihda aikasiirtoon ja oma sopimuksesi, niin näet päivän ja yön eron jokaisessa vartissa; tehomaksu riippuu omasta huipustasi ja näkyy alempana vuosivertailussa. Ympäröivän maaseudun Savon Voiman hinnat löydät omalta sivultaan. Kuopion yleissiirto on laskurin verkkojen edullisemmasta päästä, joten pörssihinnan vaihtelu näkyy kokonaishinnassa selvästi.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miten Kuopion aikasiirron tehomaksu määräytyy?', a: `Aikasiirrossa pätötehon laskutusperusteena on laskutuskuukauden korkein keskituntiteho. Maksu on ${h.num(v.teho, 2)} euroa kilowatilta kuukaudessa. Jos kuukauden suurin tunti on 8 kilowattia, tehomaksu on vuodessa noin ${h.eur(v.t8, 0)}. Kuormien porrastaminen eri tunneille pienentää maksua suoraan. Yleissiirrossa tehomaksua ei ole. Pienempi huippu pienentää maksua joka kuukausi.` },
        { q: 'Miksi Kuopio ja Savon Voima eroavat niin paljon?', a: 'Kuopion Sähköverkko palvelee tiivistä kaupunkia, jossa verkkoa on vähän asiakasta kohti. Savon Voima Verkko palvelee laajaa maaseutualuetta ympärillä. Siksi Savon Voiman perus- ja siirtomaksut ovat selvästi suuremmat. Postinumerohaku kertoo, kumman yhtiön verkossa asut, sillä raja ei aina noudata kuntarajaa. Laskuri valitsee hinnaston postinumeron perusteella.' },
        { q: 'Kannattaako Kuopiossa aikasiirto sähköauton kanssa?', a: `Riippuu siitä, nostaako lataus kuukauden suurinta tuntia. Yöllä siirto on ${h.c(v.a.energia.paiva! - v.a.energia.yo!)} päivää halvempaa, mutta 11 kilowatin lataus samaan aikaan muun kulutuksen kanssa voi nostaa huipun yli 11 kilowatin. Hidas lataus tai latauksen jakaminen useammalle tunnille pitää tehomaksun pienenä. Sähköautolaskuri auttaa arvioimaan latauksen keston.` },
        { q: 'Mikä on Kuopion vuosisähkönsiirto?', a: 'Hinnastossa mainittu vuosisähkönsiirto on lakkautustuote, jota ei enää tarjota uusiin kohteisiin. Laskurissa on siksi vain yleissiirto ja aikasiirto. Jos sinulla on edelleen vuosisähkönsiirto, valitse laskurissa Muu verkkoyhtiö ja syötä hinta oman laskusi mukaan. Tuotteen siirtohinta on hinnaston mukaan muita selvästi korkeampi.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Kuopion hinnat</h2>
${hintaTaulukko(h, v.t)}
<p>Kuopion Sähköverkon yleissiirron perusmaksu on sama kaikille enintään 63 ampeerin liittymille, ja aikasiirto on tarkoitettu sähkölämmitteisille rivi- ja omakotitaloille. Sähkövero on hinnastossa erikseen, ja laskuri lisää sen jokaiseen varttiin.</p>
<h2>Yleissiirto vai aikasiirto</h2>
${vuosiTaulukko(h, v.t)}
<p>Taulukon aikasiirron hintaan on laskettu tehomaksu 5 kilowatin kuukausihuipulla. Laskelmamme mukaan aikasiirto tulee yleissiirtoa halvemmaksi noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattitunnin talvipainotteisella vuosikulutuksella. Jos huippu on suurempi, raja nousee. Kun huippu on pieni ja yökulutus suuri, aikasiirto voi olla selvästi edullisempi.</p>
<h2>Tehomaksu ja pörssisähkö</h2>
<p>Pörssisähkön käyttäjän houkutus on ajaa kaikki suuret kuormat samoille halvoille tunneille. Kuopion aikasiirrossa se voi kostautua, sillä samanaikaiset kuormat nostavat kuukauden suurimman tunnin. Halvin ratkaisu on usein jakaa kulutus useammalle halvalle tunnille. Lue ${h.a('tehomaksu', 'tehomaksun opas')} ja vertaa ${h.a('siirto-savon-voima', 'Savon Voiman')} ja ${h.a('siirto-helen', 'Helenin')} tehomaksuihin.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-kuopio',
    nav: 'Kuopion Sähköverkko',
    card: 'Kuopion Sähköverkko’s general transfer and time-of-day transfer with a power fee, and the all-in spot price in Kuopio.',
    title: 'Kuopio Transfer Fee 2026: Spot Electricity With All Fees',
    description: 'Kuopion Sähköverkko transfer fees 2026: general transfer and time-of-day transfer with a power fee. See the all-in spot electricity price in Kuopio by quarter.',
    h1: 'Kuopion Sähköverkko: the spot electricity price in Kuopio',
    intro: 'In Kuopio time-of-day transfer carries a power fee based on the month’s highest hour. The calculator shows transfer and tax in every quarter hour.',
    resume: (h) => {
      const v = V(h);
      return `Kuopion Sähköverkko distributes electricity in the city of Kuopio, while surrounding North Savo largely belongs to Savon Voima’s network. Its network fees apply from ${h.date(v.t.v.voimassa!)}. On general transfer the basic fee is ${h.eur(v.p)} a month for connections up to 63 A and the transfer fee ${h.c(v.y.energia.kaikki!)} including VAT. On time-of-day transfer the basic fee is ${h.eur(v.pa)}, day transfer (07:00–22:00) costs ${h.c(v.a.energia.paiva!)} and night transfer ${h.c(v.a.energia.yo!)}, plus an active power fee of ${h.num(v.teho, 2)} euros per kilowatt per month based on the billing month’s highest hourly average power. The all-in spot price on general transfer averages ${v.t.arvio ? `an estimated ${h.c(v.t.paiva.ka)}` : `${h.c(v.t.paiva.ka)} today`}. The calculator is preset to Kuopio’s general transfer. Switch to time-of-day and your own contract to see the day–night gap in every quarter hour; the power fee depends on your own peak and appears below in the annual comparison.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'How is Kuopio’s time-of-day power fee set?', a: `It is based on the billing month’s highest hourly average power, at ${h.num(v.teho, 2)} euros per kilowatt per month. If the month’s highest hour is 8 kilowatts, the power fee is about ${h.eur(v.t8, 0)} a year. Staggering loads across hours reduces it directly.` },
        { q: 'Why do Kuopio and Savon Voima differ so much?', a: 'Kuopion Sähköverkko serves a compact city with little network per customer; Savon Voima Verkko serves the wide rural area around it, so its basic and transfer fees are clearly higher. The postcode lookup tells you which network you are on, since the boundary does not always follow municipal lines.' },
        { q: 'Is time-of-day transfer worth it in Kuopio with an electric car?', a: `It depends on whether charging lifts the month’s highest hour. Night transfer is ${h.c(v.a.energia.paiva! - v.a.energia.yo!)} cheaper than day, but 11 kW charging alongside other use can push the peak above 11 kW. Slow charging or spreading the charge over more hours keeps the power fee small.` },
        { q: 'What is Kuopio’s annual transfer product?', a: 'The annual transfer product in the price list is being discontinued and is not offered to new sites. The calculator therefore covers general and time-of-day transfer only. If you still have the annual product, choose Other operator and enter the price from your own bill.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Kuopio’s prices</h2>
${hintaTaulukko(h, v.t)}
<p>Kuopion Sähköverkko’s general transfer basic fee is the same for every connection up to 63 A, and time-of-day transfer is meant for electrically heated terraced and detached houses. Electricity tax is listed separately and the calculator adds it to every quarter hour.</p>
<h2>General or time-of-day transfer</h2>
${vuosiTaulukko(h, v.t)}
<p>The table’s time-of-day cost includes the power fee at a 5 kW monthly peak. By our calculation time-of-day becomes cheaper than general transfer at about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours of winter-heavy annual use. A higher peak raises the threshold; with a low peak and heavy night use time-of-day can be clearly cheaper.</p>
<h2>The power fee and spot electricity</h2>
<p>A spot customer is tempted to run every large load in the same cheap hours. On Kuopio’s time-of-day transfer that can backfire, because simultaneous loads raise the month’s highest hour. The cheapest approach is often to spread use over several cheap hours. Read the ${h.a('tehomaksu', 'power fee guide')} and compare with ${h.a('siirto-savon-voima', 'Savon Voima')} and ${h.a('siirto-helen', 'Helen')}.</p>`;
    },
  },
});
