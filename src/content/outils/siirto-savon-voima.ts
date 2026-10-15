import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('savon-voima'); const y = t.yleis, k = t.kausi!;
  return { t, y, k, kt: h.M.perusKk(y, 'kt'), p1: h.M.perusKk(y, '1x25'), p25: h.M.perusKk(y, '3x25'), k25: h.M.perusKk(k, '3x25'), ero: k.energia.talvipaiva! - k.energia.muu! };
};

export default defineGuide({
  id: 'siirto-savon-voima',
  group: 'verkko',
  order: 21,
  tool: 'tanaan',
  toolProps: { verkko: 'savon-voima', sulake: 1 },
  related: ['siirto-kuopio', 'siirto-jse', 'siirtohinnat', 'saunan-hinta', 'sahkolasku'],
  sources: ['savon-voima', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-savon-voima',
    nav: 'Savon Voima',
    card: 'Savon Voima Verkon yleissähkö ja aikasähkö sekä pörssisähkön kokonaishinta Pohjois-Savossa.',
    title: 'Savon Voima siirtohinta 2026: pörssisähkö siirron kanssa',
    description: 'Savon Voima Verkon siirtohinnat 1.6.2026: yleissähkö ja talviarkipäivän mukaan hinnoiteltu aikasähkö. Pörssisähkön kokonaishinta Pohjois-Savossa varteittain.',
    h1: 'Savon Voima Verkko: pörssisähkö Pohjois-Savossa',
    intro: 'Savon Voiman aikasähkö ei ole yösähkö vaan talviarkipäivän mukaan hinnoiteltu tuote. Laskuri käyttää yhtiön omia aikarajoja.',
    resume: (h) => {
      const v = V(h);
      return `Savon Voima Verkko siirtää sähkön laajalla alueella Pohjois-Savossa ja sen ympäristössä, Kuopion kaupunkia lukuun ottamatta. Hinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen. Yleissähkön siirtomaksu on ${h.c(v.y.energia.kaikki!)} arvonlisäveron kanssa, ja perusmaksu on 3 × 25 ampeerin omakotitalossa ${h.eur(v.p25)} ja yksivaiheisessa erillisessä käyttöpaikassa ${h.eur(v.p1)} kuukaudessa; rivi- ja kerrostalohuoneistoissa, joissa liittymään kuuluu vähintään kolme huoneistoa, perusmaksu on pienempi. Huomionarvoista on, että Savon Voiman aikasähkö hinnoitellaan talviarkipäivän mukaan: 1.11.–31.3. maanantaista lauantaihin kello 7–22 siirto maksaa ${h.c(v.k.energia.talvipaiva!)} ja muulloin ${h.c(v.k.energia.muu!)}. Pörssisähkön kokonaishinta yleissähköllä on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} keskimäärin ${h.c(v.t.paiva.ka)}. Laskuri on asetettu Savon Voiman yleissähköön omakotitalossa; vaihda aikasähköön ja omaan sopimukseesi nähdäksesi talviarkipäivän vaikutuksen jokaisessa vartissa. Talviarkipäivien ja muun ajan ero on laskurin verkoista suurimpia. Siksi oikea tuotevalinta ratkaisee sähkölämmitteisessä talossa paljon.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Onko Savon Voiman aikasähkö sama kuin yösähkö?', a: `Ei. Monessa verkossa aikasähkö tarkoittaa päivä- ja yöhintaa, mutta Savon Voiman aikasähkössä kallis aika on talviarkipäivä, 1.11.–31.3. maanantaista lauantaihin kello 7–22. Silloin siirto maksaa ${h.c(v.k.energia.talvipaiva!)}, muulloin ${h.c(v.k.energia.muu!)}. Kesällä, öisin ja sunnuntaisin siirto on siis koko ajan halpaa. Laskuri käyttää yhtiön omaa aikajakoa.` },
        { q: 'Kenelle Savon Voiman aikasähkö sopii?', a: `Yhtiön mukaan aikasähkö sopii esimerkiksi sähkölämmittäjille, joiden kulutus on yli 15 000 kilowattituntia vuodessa, varsinkin jos marras–maaliskuussa kulutusta voi ohjata yöhön. Perusmaksu on 3 × 25 ampeerilla ${h.eur(v.k25)} kuukaudessa. Laskelmamme mukaan raja on noin ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowattituntia vuodessa. Varaava lämmitys laskee rajaa.` },
        { q: 'Kuuluuko Kuopio Savon Voiman verkkoon?', a: 'Kuopion kaupunkialueella verkkoyhtiö on Kuopion Sähköverkko, jonka hinnat ovat selvästi Savon Voimaa edullisempia. Savon Voima palvelee ympäröivää maaseutua ja muita Pohjois-Savon kuntia. Raja ei aina noudata kuntarajaa, joten tarkista oma yhtiösi laskurin postinumerohaulla tai siirtolaskusta. Kuopion hinnat ovat omalla sivullaan.' },
        { q: 'Miksi Savon Voima näyttää myös sähköverollisen siirtomaksun?', a: `Hinnasto ilmoittaa siirtomaksun lisäksi sähköveron ja niiden summan, jotta asiakas näkee verkkolaskun kilowattituntihinnan kerralla. Esimerkiksi yleissähkössä summa on ${h.c(v.y.energia.kaikki! + h.M.VERO_C)}. Laskuri tekee saman ja lisää vielä energian hinnan, joten näet koko sähkön hinnan jokaiselle vartille. Näin vertailu oman laskun kanssa on helppoa.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Hinnasto ${h.date(v.t.v.voimassa!)} alkaen</h2>
${hintaTaulukko(h, v.t)}
<p>Savon Voiman yleissähkössä on neljä perusmaksua sulakkeen ja asumismuodon mukaan, ja ero erillisen yksivaiheisen käyttöpaikan ja kerrostalohuoneiston välillä on suuri. Hinnasto kertoo yleissähkön olevan edullisin vaihtoehto asuinkäytössä, kun kulutus jää alle 15 000 kilowattitunnin vuodessa.</p>
<h2>Yleissähkö vai aikasähkö</h2>
${vuosiTaulukko(h, v.t)}
<p>Aikasähkön talviarkipäivän ja muun ajan ero on ${h.c(v.ero)}, laskurin verkoista suurimpia. Siksi tuote palkitsee voimakkaasti sen, joka pystyy siirtämään talvipäivien lämmityksen iltaan kello 22 jälkeen, yöhön tai sunnuntaille, esimerkiksi varaavalla lämmityksellä tai puulämmityksen avulla. Jos talvipäivien kulutusta ei voi siirtää, yleissähkö on useimmiten parempi.</p>
<h2>Pörssisähkö ja talviarkipäivä</h2>
<p>Pörssisähkö on usein kalleimmillaan juuri talviarkipäivien aamuina ja alkuiltoina. Aikasähkössä kallis siirto osuu samoille tunneille, joten niiden välttäminen säästää kahdesti. Laskuri näyttää talvella tämän hyppäyksen kello 7 ja 22. Vertaa ${h.a('siirto-kuopio', 'Kuopion')} ja ${h.a('siirto-jse', 'Järvi-Suomen Energian')} hintoihin.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-savon-voima',
    nav: 'Savon Voima',
    card: 'Savon Voima Verkko’s general and winter-weekday transfer and the all-in spot price in North Savo.',
    title: 'Savon Voima Transfer Fee 2026: Spot Price With Transfer',
    description: 'Savon Voima Verkko transfer fees from 1 June 2026: general transfer and a product priced by winter weekdays. The all-in spot price in North Savo by quarter.',
    h1: 'Savon Voima Verkko: spot electricity in North Savo',
    intro: 'Savon Voima’s “aikasähkö” is not a night product but one priced by winter weekdays. The calculator uses the company’s own time rules.',
    resume: (h) => {
      const v = V(h);
      return `Savon Voima Verkko distributes electricity over a wide area of North Savo and its surroundings, excluding the city of Kuopio. Its price list applies from ${h.date(v.t.v.voimassa!)}. General transfer costs ${h.c(v.y.energia.kaikki!)} including VAT, with a basic fee of ${h.eur(v.p25)} a month for a 3 × 25 A house and ${h.eur(v.p1)} for a separate single-phase site; flats and terraced homes on a connection with at least three dwellings pay less. Notably, Savon Voima’s “aikasähkö” is priced by winter weekdays: from 1 Nov to 31 Mar, Monday to Saturday 07:00–22:00, transfer costs ${h.c(v.k.energia.talvipaiva!)}, and ${h.c(v.k.energia.muu!)} at other times. The all-in spot price on general transfer averages ${v.t.arvio ? `an estimated ${h.c(v.t.paiva.ka)}` : `${h.c(v.t.paiva.ka)} today`}. The calculator is preset to Savon Voima’s general transfer for a house; switch to aikasähkö and your own contract to see the winter-weekday effect in every quarter hour.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Is Savon Voima’s aikasähkö the same as night transfer?', a: `No. In many networks aikasähkö means day and night rates, but on Savon Voima’s product the expensive time is the winter weekday, 1 Nov to 31 Mar, Monday to Saturday 07:00–22:00. Transfer then costs ${h.c(v.k.energia.talvipaiva!)}, otherwise ${h.c(v.k.energia.muu!)}, so summers, nights and Sundays are cheap throughout.` },
        { q: 'Who is Savon Voima’s aikasähkö for?', a: `The company says it suits electric heating above 15,000 kilowatt-hours a year, especially if November–March use can be shifted to the night. The 3 × 25 A basic fee is ${h.eur(v.k25)} a month. By our calculation the break-even is about ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowatt-hours a year.` },
        { q: 'Is Kuopio on Savon Voima’s network?', a: 'In the city of Kuopio the operator is Kuopion Sähköverkko, whose prices are clearly lower than Savon Voima’s. Savon Voima serves the surrounding countryside and other North Savo municipalities. The boundary does not always follow municipal lines, so check your operator with the calculator’s postcode lookup or your transfer bill.' },
        { q: 'Why does Savon Voima also show a tax-inclusive transfer fee?', a: `The price list shows electricity tax and the sum of tax and transfer so customers see the network bill’s per-kWh price at once. On general transfer that sum is ${h.c(v.y.energia.kaikki! + h.M.VERO_C)}. The calculator does the same and adds the energy price, so you see the full price of every quarter hour.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Price list from ${h.date(v.t.v.voimassa!)}</h2>
${hintaTaulukko(h, v.t)}
<p>Savon Voima’s general transfer has four basic fees by fuse and type of home, and the gap between a separate single-phase site and a flat is large. The price list says general transfer is the cheapest option for homes using less than 15,000 kilowatt-hours a year.</p>
<h2>General transfer or aikasähkö</h2>
${vuosiTaulukko(h, v.t)}
<p>Aikasähkö’s gap between winter weekdays and other times is ${h.c(v.ero)}, one of the widest in the calculator. The product therefore strongly rewards anyone who can move winter daytime heating to after 22:00, the night or Sunday, using storage heating or a wood stove. If winter daytime use cannot move, general transfer is usually better.</p>
<h2>Spot electricity and winter weekdays</h2>
<p>Spot prices are often highest on winter weekday mornings and early evenings. On aikasähkö the expensive transfer falls in the same hours, so avoiding them saves twice. In winter the calculator shows the step at 07:00 and 22:00. Compare with ${h.a('siirto-kuopio', 'Kuopio')} and ${h.a('siirto-jse', 'Järvi-Suomen Energia')}.</p>`;
    },
  },
});
