import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('pks'); const y = t.yleis, a = t.aika!, k = t.kausi!;
  return { t, y, a, k, kt: h.M.perusKk(y, 'kt'), p25: h.M.perusKk(y, '3x25'), a25: h.M.perusKk(a, '3x25'), kausiEro: k.energia.talvipaiva! - k.energia.muu! };
};

export default defineGuide({
  id: 'siirto-pks',
  group: 'verkko',
  order: 18,
  tool: 'tanaan',
  toolProps: { verkko: 'pks', sulake: 1 },
  related: ['siirtohinnat', 'siirto-caruna-espoo', 'siirto-savon-voima', 'tehomaksu', 'sahkolasku'],
  sources: ['pks', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-pks-sahkonsiirto',
    nav: 'PKS Sähkönsiirto',
    card: 'PKS Sähkönsiirron yksiaika-, päivä-yö- ja vuodenaikatuote sekä pörssisähkön kokonaishinta Pohjois-Karjalassa.',
    title: 'PKS Sähkönsiirto siirtohinta 2026: pörssisähkö ja siirto',
    description: 'PKS Sähkönsiirron hinnat 1.8.2026: yleissiirto yksiaika, päivä-yö ja vuodenaika. Pörssisähkön kokonaishinta Pohjois-Karjalassa siirron ja veron kanssa.',
    h1: 'PKS Sähkönsiirto: pörssisähkö Pohjois-Karjalassa',
    intro: 'PKS Sähkönsiirron hinnasto muuttui elokuussa 2026. Laskuri käyttää uusia hintoja ja lisää ne jokaiseen varttiin.',
    resume: (h) => {
      const v = V(h);
      return `PKS Sähkönsiirto siirtää sähkön suuressa osassa Pohjois-Karjalaa ja sen lähialueita. Yhtiön uusin verkkopalveluhinnasto tuli voimaan ${h.date(v.t.v.voimassa!)}, ja se on laskurin tuorein. Yleissiirto yksiaika maksaa ${h.c(v.y.energia.kaikki!)} kilowattitunnilta arvonlisäveron kanssa, ja perusmaksu on 3 × 25 ampeerin talossa ${h.eur(v.p25)} kuukaudessa. Kerros- ja rivitaloasukkaiden yksivaiheisille liittymille ja vähintään viiden käyttöpaikan liittymille on omat, alemmat perusmaksut. PKS:n hinnasto ilmoittaa siirtohinnat kolmen desimaalin tarkkuudella ja näyttää valmiiksi myös siirron ja sähköveron summan. Pörssisähkön kokonaishinta yksiaikaisella yleissiirrolla on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} keskimäärin ${h.c(v.t.paiva.ka)}. Laskuri on asetettu PKS:n yksiaikaiseen yleissiirtoon omakotitalossa. Vaihda tilalle päivä-yö- tai vuodenaikatuote ja oma sopimuksesi, niin näet jokaisen vartin kokonaishinnan ja päivän halvimman jakson. Joensuun keskustassa verkkoyhtiö on kuitenkin Caruna Espoo, jonka hinnat ovat selvästi alempia. Postinumerohaku kertoo, kumpi yhtiö palvelee osoitettasi.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Mitä PKS Sähkönsiirron hinnoissa muuttui elokuussa 2026?', a: `Yhtiö otti käyttöön ${h.date(v.t.v.voimassa!)} alkaen uuden verkkopalveluhinnaston. Laskurissa ovat tämän hinnaston hinnat, esimerkiksi yksiaikaisen yleissiirron ${h.c(v.y.energia.kaikki!)} ja 3 × 25 ampeerin perusmaksu ${h.eur(v.p25)}. Jos laskusi kattaa ajan ennen elokuuta, sen hinnat voivat poiketa laskurista. Tarkistusohjelma seuraa yhtiön hinnastoa myös jatkossa.` },
        { q: 'Kannattaako PKS:n vuodenaikatuote?', a: `Vuodenaikatuotteessa talviarkipäivä, 1.11.–31.3. maanantaista lauantaihin kello 7–22, maksaa ${h.c(v.k.energia.talvipaiva!)} ja muu aika ${h.c(v.k.energia.muu!)}. Ero on ${h.c(v.kausiEro)}, joten tuote kannattaa vain, jos talvipäivien kulutusta voi siirtää iltaan, yöhön tai sunnuntaihin. Perusmaksu on sama kuin päivä-yötuotteessa. Laskurin vuosivertailu näyttää tuotteiden erot kolmelle kodille.` },
        { q: 'Mitä PKS:n verkkopalveluun sisältyy?', a: 'Hinnaston mukaan verkkopalveluun sisältyvät muun muassa asiakaspalvelu, verkon valvonta ja vikojen korjaus ympäri vuorokauden, mittalaitteiden huolto ja maksuton ohjauspalvelu mittalaitteen apukoskettimelta. Lisäksi on toimitustakuu, joka sisältää vakiokorvauksen kaikista yli 12 tuntia kestävistä sähkökatkoista. Nämä palvelut sisältyvät perus- ja siirtomaksuun. Tiedot ovat yhtiön hinnastosta.' },
        { q: 'Saako PKS:llä kerrostaloasunto halvemman perusmaksun?', a: `Saa. Yksivaiheisille 25 ja 35 ampeerin kerros- ja rivitaloasukkaille on oma perusmaksu, ja vähintään viiden käyttöpaikan liittymille 3 × 25 ampeerin alempi perusmaksu ${h.eur(v.kt)} kuukaudessa. Yksittäiset yksivaiheiset käyttöpaikat kuuluvat hinnaston mukaan 3 × 25 ampeerin ryhmään. Laskurin valinta Kerrostalo käyttää alempaa maksua.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Uusi hinnasto ${h.date(v.t.v.voimassa!)}</h2>
${hintaTaulukko(h, v.t)}
<p>PKS:n kolmella sulakepohjaisella tuotteella on kaksi perusmaksutasoa: yksiaikaisella yleissiirrolla pienempi ja päivä-yö- sekä vuodenaikatuotteella suurempi. Päivä-yötuotteen päiväaika on maanantaista sunnuntaihin kello 7–22, ja ohjauspalvelu kytkee yösähkön päälle kello 22 ja 23 välillä.</p>
<h2>Kolmen tuotteen vuosivertailu</h2>
${vuosiTaulukko(h, v.t)}
<p>Päivä-yötuotteessa yön siirto on ${h.c(v.a.energia.paiva! - v.a.energia.yo!)} päivää halvempaa, ja perusmaksu 3 × 25 ampeerilla ${h.eur(v.a25)} kuukaudessa. Laskelmamme mukaan se ohittaa yksiaikaisen tuotteen noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattitunnin vuosikulutuksella, kun kulutus painottuu talveen ja jakautuu tasaisesti vuorokaudelle.</p>
<h2>Pohjois-Karjalan pörssisähkön käyttäjälle</h2>
<p>PKS:n siirtomaksu on laskurin kalliimpien joukossa, joten kokonaishinnassa siirto ja vero ovat suuri osa myös silloin, kun pörssisähkö on halpaa. Joensuun keskustassa verkkoyhtiö on kuitenkin ${h.a('siirto-caruna-espoo', 'Caruna Espoo')}, jonka hinnat ovat selvästi alempia. Tarkista oma verkkoyhtiösi postinumerolla ja vertaa ${h.a('siirtohinnat', 'kaikkia verkkoja')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-pks-sahkonsiirto',
    nav: 'PKS Sähkönsiirto',
    card: 'PKS Sähkönsiirto’s single-rate, day-night and seasonal products and the all-in spot price in North Karelia.',
    title: 'PKS Sähkönsiirto Transfer Fee 2026: Spot Price With Transfer',
    description: 'PKS Sähkönsiirto prices from 1 Aug 2026: single-rate, day-night and seasonal transfer. The all-in spot price in North Karelia by quarter with transfer and tax.',
    h1: 'PKS Sähkönsiirto: spot electricity in North Karelia',
    intro: 'PKS Sähkönsiirto’s price list changed in August 2026. The calculator uses the new prices and adds them to every quarter hour.',
    resume: (h) => {
      const v = V(h);
      return `PKS Sähkönsiirto distributes electricity across much of North Karelia and nearby areas. Its newest price list took effect on ${h.date(v.t.v.voimassa!)}, the most recent in the calculator. Single-rate general transfer costs ${h.c(v.y.energia.kaikki!)} per kilowatt-hour including VAT, and the basic fee for a 3 × 25 A house is ${h.eur(v.p25)} a month. Single-phase connections of residents in flats and terraced houses, and connections with at least five sites, have their own lower basic fees. PKS quotes transfer prices to three decimals and also shows the sum of transfer and electricity tax. The all-in spot price on single-rate general transfer averages ${v.t.arvio ? `an estimated ${h.c(v.t.paiva.ka)}` : `${h.c(v.t.paiva.ka)} today`}. The calculator is preset to PKS’s single-rate transfer for a house. Switch to the day-night or seasonal product and your own contract to see every quarter hour’s all-in price and the day’s cheapest window.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'What changed in PKS Sähkönsiirto’s prices in August 2026?', a: `The company brought in a new network price list from ${h.date(v.t.v.voimassa!)}. The calculator uses it, for example ${h.c(v.y.energia.kaikki!)} for single-rate general transfer and a 3 × 25 A basic fee of ${h.eur(v.p25)}. If your bill covers a period before August, its prices may differ from the calculator.` },
        { q: 'Is PKS’s seasonal product worth it?', a: `On the seasonal product a winter weekday, 1 Nov to 31 Mar, Monday to Saturday 07:00–22:00, costs ${h.c(v.k.energia.talvipaiva!)} and other times ${h.c(v.k.energia.muu!)}. The gap is ${h.c(v.kausiEro)}, so it only pays if you can move winter daytime use to evenings, nights or Sundays. The basic fee equals the day-night product’s.` },
        { q: 'What does PKS’s network service include?', a: 'According to the price list it includes customer service, round-the-clock network monitoring and fault repair, meter maintenance and a free control service from the meter’s auxiliary contact. There is also a supply guarantee with standard compensation for every outage lasting over 12 hours.' },
        { q: 'Do flats get a lower basic fee with PKS?', a: `Yes. Single-phase 25 and 35 A residents of flats and terraced houses have their own basic fee, and connections with at least five sites get the lower 3 × 25 A basic fee of ${h.eur(v.kt)} a month. Individual single-phase sites fall into the 3 × 25 A group, according to the price list.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>New price list from ${h.date(v.t.v.voimassa!)}</h2>
${hintaTaulukko(h, v.t)}
<p>PKS’s three fuse-based products have two basic fee levels: a lower one for single-rate general transfer and a higher one for the day-night and seasonal products. Day-night daytime runs Monday to Sunday 07:00–22:00, and the control service switches night power on between 22:00 and 23:00.</p>
<h2>Annual comparison of the three products</h2>
${vuosiTaulukko(h, v.t)}
<p>On the day-night product night transfer is ${h.c(v.a.energia.paiva! - v.a.energia.yo!)} cheaper than day, with a 3 × 25 A basic fee of ${h.eur(v.a25)} a month. By our calculation it overtakes the single-rate product at about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours a year with winter-heavy use spread evenly over the day.</p>
<h2>For spot customers in North Karelia</h2>
<p>PKS’s transfer fee is among the higher ones in the calculator, so transfer and tax weigh heavily in the all-in price even when spot is cheap. In central Joensuu, though, the operator is ${h.a('siirto-caruna-espoo', 'Caruna Espoo')}, whose prices are clearly lower. Check your operator by postcode and compare ${h.a('siirtohinnat', 'all networks')}.</p>`;
    },
  },
});
