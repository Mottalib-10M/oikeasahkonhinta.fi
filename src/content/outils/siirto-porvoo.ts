import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('porvoo'); const y = t.yleis, a = t.aika, k = t.kausi;
  const p25 = h.M.perusKk(y, '3x25'), a25 = a ? h.M.perusKk(a, '3x25') : 0;
  /** Aikasiirron lisäperusmaksu yleissiirtoon nähden, €/vuosi (3 × 25 A). */
  const lisaVuosi = (a25 - p25) * 12;
  /** Yösiirron hyöty kilowattitunnilta: päivähinta on sama kuin yleissiirrossa. */
  const yoEtu = a ? y.energia.kaikki! - a.energia.yo! : 0;
  return { t, y, a, k, p25, a25, lisaVuosi, yoEtu, kt: h.M.perusKk(y, 'kt'), p1: h.M.perusKk(y, '1x25'), p35: h.M.perusKk(y, '3x35'), k25: k ? h.M.perusKk(k, '3x25') : 0 };
};

export default defineGuide({
  id: 'siirto-porvoo',
  group: 'verkko',
  order: 29,
  tool: 'tanaan',
  toolProps: { verkko: 'porvoo', sulake: 1 },
  related: ['siirtohinnat', 'siirto-helen', 'sahkoauton-lataus', 'huomenna', 'siirtomaksu'],
  sources: ['porvoo', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-porvoon-sahkoverkko',
    nav: 'Porvoon Sähköverkko',
    card: 'Porvoon Sähköverkon yleis-, aika- ja kausisiirto ilman kotitalouksien tehomaksua sekä pörssisähkön kokonaishinta Porvoossa.',
    title: 'Porvoon Sähköverkko siirtohinta 2026: aika- ja kausisiirto',
    description: 'Porvoon Sähköverkon siirtohinnat 2026: yleis-, aika- ja kausisiirto, perusmaksut sulakkeen mukaan, ei tehomaksua kotitalouksille. Pörssisähkö vartti vartilta.',
    h1: 'Porvoon Sähköverkko: siirtohinta ja pörssisähkö Porvoossa',
    intro: 'Porvoossa kotitalouden siirtoon ei kuulu tehomaksua. Ratkaisevaa on, kumpi on suurempi: aikasiirron yöetu vai sen korkeampi perusmaksu.',
    resume: (h) => {
      const v = V(h);
      return `Porvoon Sähköverkko Oy siirtää sähkön Porvoon alueella, ja sen verkkopalveluhinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen. Vuoden ${v.t.v.asiakkaat!.vuosi} toimintakertomuksen mukaan siirtoasiakkaita on ${h.num(v.t.v.asiakkaat!.maara)}. Kotitalouksien kolmessa tuotteessa ei ole tehomaksua: hinnaston tehomaksu koskee vain erillistä tehonsiirtoa suurille liittymille. Yleissiirto maksaa ${h.c(v.y.energia.kaikki!)}, ja perusmaksu on yksivaiheisessa 1 × 25 ampeerin liittymässä sama kuin kolmivaiheisessa 3 × 25 ampeerin liittymässä, ${h.eur(v.p25)} kuukaudessa. Rivi- ja kerrostalossa perusmaksu on ${h.eur(v.kt)}, kun kiinteistössä on vähintään viisi asuntoa. ${v.a ? `Aikasiirron erikoisuus on, että sen päivähinta on täsmälleen sama kuin yleissiirron, ${h.c(v.a.energia.paiva!)}, ja yöllä kello 22–7 siirto maksaa ${h.c(v.a.energia.yo!)}. Yöstä saa siis vain hyötyä, mutta perusmaksu ${h.eur(v.a25)} on ${h.eur(v.lisaVuosi, 0)} vuodessa yleissiirtoa suurempi.` : ''} ${v.k ? `Kausisiirrossa talviarkipäivän siirto maksaa ${h.c(v.k.energia.talvipaiva!)} ja muu aika ${h.c(v.k.energia.muu!)}.` : ''} Omakotitalon 5 000 kilowattitunnin siirto on Porvoossa ${v.t.sija5}. edullisin laskurin ${v.t.n} verkosta. Laskuri on asetettu yleissiirtoon; vaihda tuote ja sulake, niin näet jokaisen vartin kokonaishinnan.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Onko Porvoon Sähköverkolla tehomaksu omakotitalossa?', a: `Ei. Verkkopalveluhinnaston yleis-, aika- ja kausisiirrossa on vain perusmaksu ja siirtomaksu. Tehomaksu kuuluu yhtiön erilliseen tehonsiirtoon, jonka hinnaston mukaan veloitusteho on kuukauden tehohuippu ja vähintään 50 kilowattia, eli se on tarkoitettu suurille liittymille. Omakotitalossa voi siis ajoittaa saunan, latauksen ja pyykinpesun samaan halpaan varttiin ilman, että siirtolasku kasvaa.` },
        { q: 'Milloin Porvoon aikasiirto tulee yleissiirtoa halvemmaksi?', a: `Koska aikasiirron päivähinta on sama kuin yleissiirron, säästö syntyy vain yökulutuksesta: ${h.c(v.yoEtu)} jokaiselta kello 22–7 käytetyltä kilowattitunnilta. Sillä on katettava ${h.eur(v.lisaVuosi, 0)} suurempi vuotuinen perusmaksu. Laskelmamme mukaan talvipainotteisella kulutuksella raja on noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattituntia vuodessa. Mitä suurempi osa kulutuksesta on yöllä, sitä aiemmin aikasiirto voittaa.` },
        { q: 'Miksi Porvoon kuormanohjaus kytkeytyy vasta puolenyön jälkeen?', a: 'Yhtiön mukaan mittari valitsee kuormanohjauksen kytkeytymisajan joka päivä satunnaisesti kello 0–1, massavaraaja-asiakkailla kello 23–24, jotta verkkoon ei synny kuormituspiikkiä. Yösähkön siirtohinta on silti voimassa kello 22–7, vaikka ohjaus kytkeytyisi myöhemmin. Lämminvesivaraaja ehtii yhtiön mukaan lämmetä ennen kello 7. Kytkeytymisajan voi vaihtaa yhtiön lomakkeella.' },
        { q: 'Kuinka usein Porvoossa voi vaihtaa siirtotuotetta?', a: `Hinnaston mukaan verkkopalvelutuotteen voi vaihtaa aikaisintaan 12 kuukautta edellisestä vaihdosta. Valinta kannattaa siksi tehdä koko vuoden kulutuksen perusteella eikä yhden kylmän kuukauden mukaan. ${v.k ? `Kausisiirron perusmaksu ${h.eur(v.k25)} on sama kuin aikasiirrossa, joten ero näiden kahden välillä tulee vain siitä, osuuko kulutus talven arkipäiviin vai öihin.` : ''}` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Porvoon Sähköverkon verkkopalveluhinnasto</h2>
${hintaTaulukko(h, v.t)}
<p>Hinnaston mukaan yleissiirron perusmaksu on sama ${h.eur(v.p1)} sekä 1 × 25 A, 1 × 35 A että 3 × 25 A liittymässä, ja vasta 3 × 35 A liittymässä se nousee tasolle ${h.eur(v.p35)}. Kerrostalohinta edellyttää rivi- tai kerrostaloa, jossa on vähintään viisi asuntoa; pienemmässä talossa maksetaan sulakkeen mukainen perusmaksu.</p>
<h2>Vuosikustannus Porvoossa</h2>
${vuosiTaulukko(h, v.t)}
<p>Koska tehomaksua ei ole, taulukon luvut koostuvat vain siirtomaksusta ja perusmaksusta. Sähkölämmitteisessä talossa ${v.k ? `kausisiirron ${h.c(v.k.energia.muu!)} muun ajan hinta koskee myös koko kesää ja talviöitä, kun taas ` : ''}aikasiirron yöhinta koskee joka yötä ympäri vuoden.</p>
<h2>Pörssisähkö Porvoossa ilman tehomaksua</h2>
<p>Ilman tehomaksua pörssisähkön halvimpiin vartteihin voi keskittää suuria kuormia ilman tehohuipun riskiä. Aikasiirrossa halpa pörssiyö ja ${v.a ? h.c(v.a.energia.yo!) : ''} yösiirto osuvat yhteen, mikä sopii esimerkiksi ${h.a('sahkoauton-lataus', 'sähköauton lataukseen')}. Tarkista ${h.a('huomenna', 'huomisen hinnat')} iltapäivällä ja vertaa Porvoota esimerkiksi pääkaupunkiseudun ${h.a('siirto-helen', 'Heleniin')} ${h.a('siirtohinnat', 'siirtohintojen vertailussa')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-porvoon-sahkoverkko',
    nav: 'Porvoon Sähköverkko',
    card: 'Porvoon Sähköverkko’s general, time-of-day and seasonal transfer with no household power fee, and the all-in spot price in Porvoo.',
    title: 'Porvoon Sähköverkko Transfer Fee 2026: Night and Seasonal',
    description: 'Porvoon Sähköverkko transfer fees 2026: general, time-of-day and seasonal transfer, basic fees by fuse, no power fee for homes. Spot price quarter by quarter.',
    h1: 'Porvoon Sähköverkko: transfer fee and spot electricity in Porvoo',
    intro: 'In Porvoo a household’s transfer carries no power fee. What matters is which is larger: the night saving on time-of-day transfer or its higher basic fee.',
    resume: (h) => {
      const v = V(h);
      return `Porvoon Sähköverkko Oy distributes electricity in the Porvoo area; its network price list applies from ${h.date(v.t.v.voimassa!)}. According to its ${v.t.v.asiakkaat!.vuosi} annual report it has ${h.num(v.t.v.asiakkaat!.maara)} transfer customers. Its three household products have no power fee: the price list reserves the power fee for a separate power transfer product for large connections. General transfer costs ${h.c(v.y.energia.kaikki!)}, and a single-phase 1 × 25 A connection pays the same basic fee as a three-phase 3 × 25 A one, ${h.eur(v.p25)} a month. Terraced and apartment homes pay ${h.eur(v.kt)} when the building has at least five dwellings. ${v.a ? `The unusual feature of time-of-day transfer is that its day rate is exactly the general rate, ${h.c(v.a.energia.paiva!)}, while at night from 22:00 to 07:00 transfer costs ${h.c(v.a.energia.yo!)}. The night can only help, but the basic fee of ${h.eur(v.a25)} is ${h.eur(v.lisaVuosi, 0)} a year above general transfer.` : ''} ${v.k ? `On seasonal transfer winter weekdays cost ${h.c(v.k.energia.talvipaiva!)} and other times ${h.c(v.k.energia.muu!)}.` : ''} For a house using 5,000 kilowatt-hours, Porvoo ranks ${v.t.sija5} of the calculator’s ${v.t.n} networks from cheapest. The calculator is preset to general transfer; switch product and fuse to see every quarter hour’s all-in price.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Does Porvoon Sähköverkko charge a power fee for a house?', a: `No. General, time-of-day and seasonal transfer on the network price list consist only of a basic fee and a transfer fee. The power fee belongs to the company’s separate power transfer product, where under the price list the billed power is the month’s peak and at least 50 kilowatts, so it is meant for large connections. A house can therefore run the sauna, car charger and washing in the same cheap quarter without raising its transfer bill.` },
        { q: 'When does Porvoo’s time-of-day transfer beat general transfer?', a: `Because the day rate on time-of-day transfer equals the general rate, the saving comes only from night use: ${h.c(v.yoEtu)} on every kilowatt-hour used between 22:00 and 07:00. That has to cover a basic fee ${h.eur(v.lisaVuosi, 0)} a year higher. By our calculation the threshold with winter-heavy use is about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours a year. The larger your night share, the sooner it wins.` },
        { q: 'Why does Porvoo’s load control switch on only after midnight?', a: 'According to the company, the meter picks the switch-on time at random each day between 00:00 and 01:00, or between 23:00 and 00:00 for storage-heater customers, so that the grid avoids a load spike. The night transfer rate still applies from 22:00 to 07:00 even if control switches on later. The company says a water heater still warms up before 07:00. The switch-on window can be changed with the company’s form.' },
        { q: 'How often can I change transfer product in Porvoo?', a: `According to the price list a network product can be changed no sooner than 12 months after the previous change. It is therefore worth choosing on a whole year’s consumption rather than one cold month. ${v.k ? `The seasonal transfer basic fee of ${h.eur(v.k25)} is the same as on time-of-day transfer, so the difference between the two depends only on whether your use falls on winter weekdays or at night.` : ''}` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Porvoon Sähköverkko’s network price list</h2>
${hintaTaulukko(h, v.t)}
<p>Under the price list the general transfer basic fee is the same ${h.eur(v.p1)} for 1 × 25 A, 1 × 35 A and 3 × 25 A connections, and only 3 × 35 A raises it to ${h.eur(v.p35)}. The flat rate requires a terraced or apartment building with at least five dwellings; a smaller building pays the basic fee for its fuse.</p>
<h2>Annual cost in Porvoo</h2>
${vuosiTaulukko(h, v.t)}
<p>With no power fee, the figures consist only of the transfer fee and the basic fee. In an electrically heated house ${v.k ? `seasonal transfer’s other-time rate of ${h.c(v.k.energia.muu!)} covers the whole summer and winter nights, whereas ` : ''}the time-of-day night rate covers every night all year round.</p>
<h2>Spot electricity in Porvoo without a power fee</h2>
<p>Without a power fee you can bunch large loads into the cheapest spot quarters with no risk of a power peak. On time-of-day transfer a cheap spot night and the ${v.a ? h.c(v.a.energia.yo!) : ''} night transfer rate coincide, which suits ${h.a('sahkoauton-lataus', 'electric car charging')}, for example. Check ${h.a('huomenna', 'tomorrow’s prices')} in the afternoon and compare Porvoo with, say, ${h.a('siirto-helen', 'Helen in Helsinki')} in the ${h.a('siirtohinnat', 'transfer fee comparison')}.</p>`;
    },
  },
});
