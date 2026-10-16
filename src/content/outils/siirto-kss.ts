import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('kss'); const y = t.yleis, a = t.aika, k = t.kausi;
  /** Aikasiirron rajat normaaliaikana ja kesäaikana (hinnaston mukaan rajat eivät seuraa kesäaikaa). */
  const tu = a?.ajat?.tunnit ?? [7, 22];
  const nt = `${tu[0]}–${tu[1]}`, kt = `${tu[0] + 1}–${tu[1] + 1}`;
  const ntEn = `${String(tu[0]).padStart(2, '0')}:00–${tu[1]}:00`, ktEn = `${String(tu[0] + 1).padStart(2, '0')}:00–${tu[1] + 1}:00`;
  const p25 = h.M.perusKk(y, '3x25'), a25 = a ? h.M.perusKk(a, '3x25') : 0, a35 = a ? h.M.perusKk(a, '3x35') : 0, k25 = k ? h.M.perusKk(k, '3x25') : 0;
  return { t, y, a, k, nt, kt, ntEn, ktEn, pkt: h.M.perusKk(y, 'kt'), p25, a25, a35, k25, lisaVuosi: (a25 - p25) * 12, asiakkaat: t.v.asiakkaat?.maara ?? 0 };
};

export default defineGuide({
  id: 'siirto-kss',
  group: 'verkko',
  order: 28,
  tool: 'tanaan',
  toolProps: { verkko: 'kss', sulake: 1 },
  related: ['siirtohinnat', 'siirto-ksoy', 'siirto-lahti', 'sahkoauton-lataus', 'huomenna'],
  sources: ['kss', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-kss-verkko',
    nav: 'KSS Verkko',
    card: 'KSS Verkon yleis-, aika- ja kausisiirto Kouvolassa ja Iitissä sekä aikasiirron kesäajan rajat.',
    title: 'KSS Verkko siirtohinta 2026: Kouvola, Iitti ja pörssisähkö',
    description: 'KSS Verkon siirtohinnat 2026 Kouvolassa ja Iitissä: yleis-, aika- ja kausisiirto, perusmaksut ja aikasiirron kesäajan rajat. Pörssisähkö vartti vartilta.',
    h1: 'KSS Verkko: siirtohinta ja pörssisähkö Kouvolassa ja Iitissä',
    intro: 'KSS Verkon aikasiirron päivä- ja yöaika pysyvät normaaliajassa ympäri vuoden, joten kesällä halpa yösiirto alkaa vasta tuntia myöhemmin.',
    resume: (h) => {
      const v = V(h);
      return `KSS Verkko siirtää sähkön Kouvolan ja Iitin seudulla, ja yhtiön mukaan sillä on yli ${h.num(v.asiakkaat)} asiakasta. Verkkopalvelumaksut ovat voimassa ${h.date(v.t.v.voimassa!)} alkaen. Yleissiirto maksaa ${h.c(v.y.energia.kaikki!)} arvonlisäveron kanssa, ja perusmaksu on kerrostalossa ${h.eur(v.pkt)} ja 3 × 25 ampeerin talossa ${h.eur(v.p25)} kuukaudessa. ${v.a ? `Aikasiirrossa päiväaika kello ${v.nt} maksaa ${h.c(v.a.energia.paiva!)} ja yöaika ${h.c(v.a.energia.yo!)}. Hinnaston mukaan aikarajoissa ei sovelleta kesäaikaan siirtymistä, joten kesällä päiväaika on paikallista aikaa kello ${v.kt} ja yösiirron halpa jakso alkaa vasta kello ${v.kt.split('–')[1]}. ` : ''}${v.k ? `Kausisiirrossa talviarkipäivän siirto 1.11.–31.3. maanantaista lauantaihin maksaa ${h.c(v.k.energia.talvipaiva!)} ja muu aika ${h.c(v.k.energia.muu!)}. ` : ''}${v.a ? `Aika- ja kausisiirrolla on sama perusmaksu, 3 × 25 ampeerilla ${h.eur(v.a25)} kuukaudessa, eli ${h.eur(v.lisaVuosi, 0)} vuodessa enemmän kuin yleissiirrossa. ` : ''}Kotitalouksien hinnastossa ei ole tehomaksua, ja tuotteen voi vaihtaa 12 kuukauden yhtäjaksoisen käytön jälkeen. Pörssisähkön kokonaishinta yleissiirrolla on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} keskimäärin ${h.c(v.t.paiva.ka)}. Omakotitalon 5 000 kilowattitunnin siirto on KSS Verkossa ${v.t.sija5}. edullisin laskurin ${v.t.n} verkosta. Laskuri on asetettu KSS Verkon alueelle 3 × 25 ampeerin omakotitaloon ja ottaa aikasiirron kesäajan rajat huomioon; vaihda oma tuotteesi, niin näet jokaisen vartin hinnan.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miksi KSS Verkon yösiirto alkaa kesällä vasta kello 23?', a: `Hinnaston mukaan aikasiirron päiväaika on kello ${v.nt} ja yöaika kello ${v.nt.split('–')[1]}–${v.nt.split('–')[0]}, eikä kesäaikaan siirtymistä sovelleta. Rajat on siis sidottu normaaliaikaan. Kun kellot siirretään keväällä tunnilla eteenpäin, päiväaika on paikallista aikaa kello ${v.kt}, ja ${h.c(v.a?.energia.yo ?? 0)} yöhinta alkaa vasta kello ${v.kt.split('–')[1]}. Kesällä sähköauton latauksen tai varaajan ajastus kannattaa siksi siirtää tunnilla myöhemmäksi.` },
        { q: 'Kumpi kannattaa KSS Verkolla, aika- vai kausisiirto?', a: `Molemmilla on sama perusmaksu, 3 × 25 ampeerilla ${h.eur(v.a25)} ja 3 × 35 ampeerilla ${h.eur(v.a35)} kuukaudessa, ja halvin hinta on molemmissa ${h.c(v.a?.energia.yo ?? 0)}. Ero on kalliissa jaksossa: aikasiirron päiväaika maksaa ${h.c(v.a?.energia.paiva ?? 0)} ympäri vuoden, kausisiirron talviarkipäivä ${h.c(v.k?.energia.talvipaiva ?? 0)} vain marraskuusta maaliskuuhun. Laskelmamme mukaan aikasiirto ohittaa yleissiirron noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} ja kausisiirto noin ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowattitunnin talvipainotteisella kulutuksella.` },
        { q: 'Kuinka usein KSS Verkon siirtotuotetta voi vaihtaa?', a: 'Hinnaston mukaan tuotteen vaihto on sallittu 12 kuukauden yhtäjaksoisen käytön jälkeen. Jos vaihdat yleissiirrosta aika- tai kausisiirtoon, uusi tuote on siis käytössä vähintään vuoden, eli yhden lämmityskauden ja yhden kesän yli. Siksi valinta kannattaa laskea koko vuoden kulutuksella eikä yhden kalliin talvikuukauden perusteella. Tämän sivun vuosikustannustaulukko näyttää tuotteet rinnakkain kolmella tyyppikäyttäjällä.' },
        { q: 'Onko KSS Verkolla tehomaksua omakotitalossa?', a: `Ei. KSS Verkon kotitalouksien verkkopalvelumaksuissa on vain siirtomaksu ja sulakkeen mukainen perusmaksu kolmessa tuotteessa. Yhtiön sivujen mukaan tehosähkö on yksi sen mittaustavoista, mutta se ei kuulu tähän hinnastoon. Huipun pienentäminen ei siis alenna laskua, mutta aika- tai kausisiirrossa kulutuksen siirtäminen halvempaan jaksoon alentaa. Sähkövero ja huoltovarmuusmaksu, yhteensä ${h.c(h.M.VERO_C, 4)}, tulevat siirron lisäksi.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>KSS Verkon verkkopalvelumaksut</h2>
${hintaTaulukko(h, v.t)}
<p>KSS Verkon hinnastossa aika- ja kausisiirto jakavat saman perusmaksutaulukon, ja niiden halvin siirtohinta on sama. ${v.a ? `Aikasiirron päiväaikakin (${h.c(v.a.energia.paiva!)}) on yleissiirron ${h.c(v.y.energia.kaikki!)} alapuolella, joten tuotteen hinta on lähes kokonaan perusmaksussa. ` : ''}Hinnastossa on lisäksi pienin 1 × 16 ampeerin yleissiirto kohteille, joiden suurin sallittu teho on 500 wattia.</p>
<h2>Vuosikustannus Kouvolassa ja Iitissä</h2>
${vuosiTaulukko(h, v.t)}
<p>Kerrostalossa ja pienellä kulutuksella yleissiirto jää edullisimmaksi, koska aika- ja kausisiirtoa ei ole hinnastossa kerrostalon perusmaksulla. 3 × 25 ampeerin talossa aika- tai kausisiirron ${h.eur(v.lisaVuosi, 0)} suurempi vuotuinen perusmaksu kuittautuu vasta, kun kulutusta on paljon ja se osuu halpaan jaksoon, kuten varaavassa sähkölämmityksessä.</p>
<h2>Kesäaika, pörssisähkö ja ajastus</h2>
<p>Pörssisähkön halvimmat vartit osuvat usein yöhön, mutta KSS Verkon aikasiirrossa yöhinta alkaa kesällä vasta kello ${v.kt.split('–')[1]} ja päättyy kello ${v.kt.split('–')[0]}. Laskurin kaavio näyttää siirron hyppäyksen oikeassa kohdassa, ja ${h.a('huomenna', 'huomisen hinnoista')} näet, mihin yön varttiin ${h.a('sahkoauton-lataus', 'sähköauton lataus')} kannattaa ajastaa. Muualla Kymenlaaksossa, esimerkiksi Kotkassa ja Haminassa, verkkoyhtiö on ${h.a('siirto-ksoy', 'Kymenlaakson Sähköverkko')} ja lännessä Lahden kaupungissa ${h.a('siirto-lahti', 'Lahti Energia')}; postinumerohaku kertoo, kenen verkossa osoitteesi on. Muut verkot löydät ${h.a('siirtohinnat', 'siirtohintojen vertailusta')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-kss-verkko',
    nav: 'KSS Verkko',
    card: 'KSS Verkko’s general, time-of-day and seasonal transfer in Kouvola and Iitti and its summer-time hours.',
    title: 'KSS Verkko Transfer Fee 2026: Kouvola, Iitti and Spot Price',
    description: 'KSS Verkko transfer fees 2026 in Kouvola and Iitti: general, time-of-day and seasonal transfer, basic fees and summer-time night hours. Spot price by quarter.',
    h1: 'KSS Verkko: transfer fee and spot electricity in Kouvola and Iitti',
    intro: 'KSS Verkko’s day and night periods stay on standard time all year, so in summer cheap night transfer starts an hour later on the clock.',
    resume: (h) => {
      const v = V(h);
      return `KSS Verkko distributes electricity around Kouvola and Iitti and, according to the company, serves more than ${h.num(v.asiakkaat)} customers. Its network service fees apply from ${h.date(v.t.v.voimassa!)}. General transfer costs ${h.c(v.y.energia.kaikki!)} including VAT, with a basic fee of ${h.eur(v.pkt)} a month for a flat and ${h.eur(v.p25)} for a 3 × 25 A house. ${v.a ? `On time-of-day transfer the day period, ${v.ntEn}, costs ${h.c(v.a.energia.paiva!)} and the night period ${h.c(v.a.energia.yo!)}. Under the price list the periods do not shift for daylight saving time, so in summer the day period runs ${v.ktEn} local time and cheap night transfer starts only at ${v.ktEn.split('–')[1]}. ` : ''}${v.k ? `On seasonal transfer, winter weekdays (1 November–31 March, Monday to Saturday) cost ${h.c(v.k.energia.talvipaiva!)} and all other times ${h.c(v.k.energia.muu!)}. ` : ''}${v.a ? `Time-of-day and seasonal transfer share one basic fee, ${h.eur(v.a25)} a month on 3 × 25 A, or ${h.eur(v.lisaVuosi, 0)} a year more than general transfer. ` : ''}The household price list has no power fee, and a product can be changed after 12 months of continuous use. ${v.t.arvio ? 'By estimate, the' : 'Today the'} all-in spot price on general transfer averages ${h.c(v.t.paiva.ka)}. For a house using 5,000 kilowatt-hours, KSS Verkko ranks ${v.t.sija5} of the calculator’s ${v.t.n} networks from cheapest.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Why does KSS Verkko’s night transfer start at 23:00 in summer?', a: `According to the price list, the day period is ${v.ntEn} and the night period ${v.ntEn.split('–')[1]}–${v.ntEn.split('–')[0]}, and the switch to summer time is not applied. The periods are tied to standard time. Once the clocks go forward in spring, the day period runs ${v.ktEn} local time and the ${h.c(v.a?.energia.yo ?? 0)} night rate starts only at ${v.ktEn.split('–')[1]}. In summer, move a car-charging or water-heater timer an hour later.` },
        { q: 'Time-of-day or seasonal transfer: which suits KSS Verkko customers?', a: `Both have the same basic fee, ${h.eur(v.a25)} on 3 × 25 A and ${h.eur(v.a35)} on 3 × 35 A a month, and the same lowest rate of ${h.c(v.a?.energia.yo ?? 0)}. The difference is the expensive period: day-time transfer costs ${h.c(v.a?.energia.paiva ?? 0)} all year, the seasonal winter weekday ${h.c(v.k?.energia.talvipaiva ?? 0)} only from November to March. By our calculation time-of-day transfer beats general transfer from about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} and seasonal from about ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowatt-hours of winter-heavy use.` },
        { q: 'How often can I change my KSS Verkko transfer product?', a: 'Under the price list a product change is allowed after 12 months of continuous use. If you move from general to time-of-day or seasonal transfer, the new product therefore stays for at least a year, covering one heating season and one summer. That is why the choice is best judged on a full year’s consumption rather than one expensive winter month. The annual cost table on this page compares the products for three typical users.' },
        { q: 'Does KSS Verkko charge a power fee for a house?', a: `No. KSS Verkko’s household network fees consist only of a transfer fee and a fuse-based basic fee across three products. The company’s site lists power-based metering among its methods, but it is not part of this price list. Lowering your peak therefore does not cut the bill, while on time-of-day or seasonal transfer shifting use to the cheaper period does. Electricity tax and the security-of-supply fee, ${h.c(h.M.VERO_C, 4)} together, come on top.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>KSS Verkko’s network service fees</h2>
${hintaTaulukko(h, v.t)}
<p>KSS Verkko’s time-of-day and seasonal transfer share a single basic-fee table and the same lowest transfer rate. ${v.a ? `Even the day-time rate on time-of-day transfer (${h.c(v.a.energia.paiva!)}) is below general transfer’s ${h.c(v.y.energia.kaikki!)}, so almost all of the product’s cost sits in the basic fee. ` : ''}The price list also has a smallest 1 × 16 A general product for sites with a maximum permitted power of 500 watts.</p>
<h2>Annual cost in Kouvola and Iitti</h2>
${vuosiTaulukko(h, v.t)}
<p>In a flat and at low consumption general transfer stays cheapest, because time-of-day and seasonal transfer have no flat-rate basic fee in the price list. In a 3 × 25 A house their basic fee, ${h.eur(v.lisaVuosi, 0)} a year higher, only pays off when consumption is large and falls in the cheap period, as with storage electric heating.</p>
<h2>Summer time, spot electricity and timers</h2>
<p>The cheapest spot quarters often fall at night, but on KSS Verkko’s time-of-day transfer the night rate in summer starts only at ${v.ktEn.split('–')[1]} and ends at ${v.ktEn.split('–')[0]}. The calculator’s chart shows the transfer step at the right moment, and ${h.a('huomenna', 'tomorrow’s prices')} show which night quarter suits ${h.a('sahkoauton-lataus', 'charging an electric car')}. Elsewhere in Kymenlaakso, for example in Kotka and Hamina, the operator is ${h.a('siirto-ksoy', 'Kymenlaakson Sähköverkko')}, and to the west, in the city of Lahti, ${h.a('siirto-lahti', 'Lahti Energia')}; the postcode search tells you whose network your address is on. Other networks are in the ${h.a('siirtohinnat', 'transfer price comparison')}.</p>`;
    },
  },
});
