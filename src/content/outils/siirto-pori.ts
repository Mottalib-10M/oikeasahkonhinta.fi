import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('pori'); const y = t.yleis, a = t.aika, k = t.kausi;
  const p25 = h.M.perusKk(y, '3x25');
  const a25 = a ? h.M.perusKk(a, '3x25') : null, k25 = k ? h.M.perusKk(k, '3x25') : null;
  /** Lisäperusmaksu vuodessa, kun 3 × 25 A talo vaihtaa yleissiirrosta aikasiirtoon. */
  const lisaA = a25 !== null ? (a25 - p25) * 12 : null;
  return { t, y, a, k, kt: h.M.perusKk(y, 'kt'), p25, a25, k25, lisaA };
};

export default defineGuide({
  id: 'siirto-pori',
  group: 'verkko',
  order: 27,
  tool: 'tanaan',
  toolProps: { verkko: 'pori', sulake: 1 },
  related: ['siirtohinnat', 'siirtomaksu', 'sahkoauton-lataus', 'huomenna', 'porssi-vai-kiintea'],
  sources: ['pori', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-pori-energia',
    nav: 'Pori Energia',
    card: 'Pori Energian yleis-, aika- ja kausisiirto ilman tehomaksua sekä pörssisähkön kokonaishinta Porissa.',
    title: 'Pori Energia siirtohinta 2026: aikasiirto ja kausisiirto',
    description: 'Pori Energian siirtohinnat 2026: yleissiirto, aikasiirto ja kausisiirto ilman tehomaksua. Aikasiirron päivähinta on sama kuin yleissiirron. Hinta tänään.',
    h1: 'Pori Energia: pörssisähkön hinta Porissa siirron ja veron kanssa',
    intro: 'Porissa siirtotuotteita on kolme eikä yhdessäkään ole tehomaksua. Laskuri lisää siirron ja verot pörssihintaan jokaisessa vartissa.',
    resume: (h) => {
      const v = V(h);
      return `Pori Energia Sähköverkot siirtää sähkön Porissa, ja yhtiön mukaan sähkönkäyttöpaikkoja on yli ${h.num(v.t.v.asiakkaat!.maara)}. Verkkopalveluhinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen, eikä siinä ole tehomaksua, joten lasku muodostuu vain perusmaksusta ja kilowattitunneista. Yleissiirto maksaa ${h.c(v.y.energia.kaikki!)} vuorokauden ja vuoden ympäri, ja perusmaksu on yksivaiheisessa liittymässä ${h.eur(v.kt)} ja 3 × 25 ampeerilla ${h.eur(v.p25)} kuukaudessa. Porin hinnaston erikoisuus on aikasiirto: sen päiväsiirto kello 7–22 maksaa saman ${h.c(v.a?.energia.paiva ?? 0)} kuin yleissiirto, mutta yöllä siirto on vain ${h.c(v.a?.energia.yo ?? 0)}. Ero tulee siis pelkästä perusmaksusta, joka on 3 × 25 ampeerilla ${v.a25 !== null ? h.eur(v.a25) : '–'} kuukaudessa. Kausisiirrossa talviarkipäivän ${h.c(v.k?.energia.talvipaiva ?? 0)} koskee marras–maaliskuuta maanantaista lauantaihin kello 7–22; muulloin siirto maksaa ${h.c(v.k?.energia.muu ?? 0)}. Omakotitalon 5 000 kilowattitunnin siirto on Porissa ${v.t.sija5}. edullisin laskurin ${v.t.n} verkosta. Laskuri on asetettu Porin yleissiirtoon; valitse oma tuotteesi ja sulakkeesi, niin näet jokaisen vartin kokonaishinnan.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miksi Porin aikasiirron päivähinta on sama kuin yleissiirron?', a: `Hinnaston mukaan kumpikin maksaa päivällä ${h.c(v.y.energia.kaikki!)}, joten aikasiirrossa ei menetä mitään päiväkulutuksessa. Yösiirto kello 22–7 maksaa ${h.c(v.a?.energia.yo ?? 0)}. Ainoa lisäkulu on perusmaksu: 3 × 25 ampeerilla aikasiirto maksaa vuodessa ${v.lisaA !== null ? h.eur(v.lisaA, 0) : '–'} enemmän kuin yleissiirto. Laskelmamme mukaan se kuittautuu noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattitunnin talvipainotteisella vuosikulutuksella.` },
        { q: 'Onko Pori Energian kausisiirto halvempi talven sunnuntaisin?', a: `Kyllä. Hinnaston mukaan talviarkipäivän hinta ${h.c(v.k?.energia.talvipaiva ?? 0)} on voimassa 1.11.–31.3. maanantaista lauantaihin kello 7–22. Sunnuntaisin, öisin ja koko kesäkauden siirto maksaa ${h.c(v.k?.energia.muu ?? 0)}. Yhtiö kuvaa tuotteen sopivan asiakkaalle, joka voi täydentää sähkölämmitystä talvella muilla tavoilla. Perusmaksu on sama kuin aikasiirrossa, ${v.k25 !== null ? h.eur(v.k25) : '–'} kuukaudessa 3 × 25 ampeerilla.` },
        { q: 'Milloin Pori Energian siirtotuotteen voi vaihtaa?', a: 'Hinnaston mukaan yleis-, aika- ja kausisiirto ovat vapaasti valittavissa käyttöpaikoille, joiden sulake on enintään 3 × 125 ampeeria. Valitun tuotteen voi vaihtaa toiseen vasta 12 kuukauden yhtäjaksoisen käytön jälkeen. Siksi tuote kannattaa valita koko vuoden kulutuksen perusteella eikä yhden kylmän kuukauden laskun mukaan. Vertaa ensin tämän sivun vuosikustannustaulukkoa omaan kulutukseesi.' },
        { q: 'Onko Pori Energian verkossa tehomaksua?', a: `Ei. Pori Energian hinnastossa ei ole tehomaksua missään tuotteessa, joten sähköauton lataus tai sauna samaan aikaan ei nosta siirtolaskua kilowattitunteja enempää. Vaikutus on vain kulutuksen ajoituksessa: aika- ja kausisiirrossa ratkaisee kellonaika, ei teho. Sähköveron ${h.c(h.M.VERO_C, 4)} yhtiö laskuttaa siirron yhteydessä veroluokassa I.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Porin siirtohinnat</h2>
${hintaTaulukko(h, v.t)}
<p>Hinnastossa aika- ja kausisiirron perusmaksut alkavat 3 × 25 ampeerista, joten yksivaiheisessa liittymässä vaihtoehto on yleissiirto. Aika- ja kausisiirrolla on sama perusmaksu, ja ne eroavat vain siinä, milloin halvempi siirtohinta on voimassa: aikasiirrossa joka yö, kausisiirrossa koko kesäkauden sekä talven öinä ja sunnuntaisin.</p>
<h2>Vuosikustannus Porissa</h2>
${vuosiTaulukko(h, v.t)}
<p>Koska aikasiirron päivähinta ei ole yleissiirtoa kalliimpi, jokainen yöhön siirretty kilowattitunti pienentää laskua ${h.c(v.y.energia.kaikki! - (v.a?.energia.yo ?? 0))}. Kausisiirrossa talviarkipäivä maksaa ${h.c(v.k?.energia.talvipaiva ?? 0)}, selvästi yleissiirron yläpuolella, joten se sopii vain, jos talvipäivien kulutusta voi korvata muulla lämmönlähteellä.</p>
<h2>Pörssisähkö ja Porin aikasiirto</h2>
<p>Pörssisähkön halvat tunnit osuvat usein yöhön, ja aikasiirrossa myös siirto halpenee kello 22. Ilman tehomaksua ${h.a('sahkoauton-lataus', 'sähköauton lataus')} ja lämminvesivaraaja voidaan ajastaa yöhön samanaikaisesti. ${h.a('huomenna', 'Huomisen hinnat')} näkyvät iltapäivällä, ja ${h.a('siirtohinnat', 'siirtohintojen vertailu')} näyttää, miten Pori asettuu muihin verkkoihin nähden.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-pori-energia',
    nav: 'Pori Energia',
    card: 'Pori Energia’s general, time-of-day and seasonal transfer with no power fee, and the all-in spot price in Pori.',
    title: 'Pori Energia Transfer Fee 2026: Time and Seasonal Rates',
    description: 'Pori Energia transfer fees 2026: general, time-of-day and seasonal transfer with no power fee. Time-of-day costs the same as general by day. All-in price today.',
    h1: 'Pori Energia: the spot electricity price in Pori with transfer and tax',
    intro: 'Pori has three transfer products and none carries a power fee. The calculator adds transfer and taxes to the spot price in every quarter hour.',
    resume: (h) => {
      const v = V(h);
      return `Pori Energia Sähköverkot distributes electricity in Pori and, according to the company, serves more than ${h.num(v.t.v.asiakkaat!.maara)} metering points. Its network price list applies from ${h.date(v.t.v.voimassa!)} and has no power fee, so the bill is just a basic fee plus kilowatt-hours. General transfer costs ${h.c(v.y.energia.kaikki!)} around the clock and all year, with a basic fee of ${h.eur(v.kt)} for a single-phase connection and ${h.eur(v.p25)} for 3 × 25 A, per month. What sets Pori apart is time-of-day transfer: its day rate from 07:00 to 22:00 is the same ${h.c(v.a?.energia.paiva ?? 0)} as general transfer, while night transfer is only ${h.c(v.a?.energia.yo ?? 0)}. The only difference is the basic fee, ${v.a25 !== null ? h.eur(v.a25) : '–'} a month on 3 × 25 A. On seasonal transfer the winter weekday rate of ${h.c(v.k?.energia.talvipaiva ?? 0)} applies from November to March, Monday to Saturday 07:00–22:00; at other times transfer costs ${h.c(v.k?.energia.muu ?? 0)}. For a house using 5,000 kilowatt-hours, Pori ranks ${v.t.sija5} of the calculator’s ${v.t.n} networks from cheapest. The calculator is preset to Pori’s general transfer; pick your own product and fuse to see every quarter hour’s all-in price.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Why does Pori’s time-of-day transfer cost the same as general by day?', a: `According to the price list both charge ${h.c(v.y.energia.kaikki!)} by day, so time-of-day loses nothing on daytime use. Night transfer from 22:00 to 07:00 costs ${h.c(v.a?.energia.yo ?? 0)}. The only extra is the basic fee: on 3 × 25 A time-of-day costs ${v.lisaA !== null ? h.eur(v.lisaA, 0) : '–'} a year more than general transfer. By our calculation that pays back at about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours of winter-heavy annual use.` },
        { q: 'Is Pori Energia’s seasonal transfer cheaper on winter Sundays?', a: `Yes. According to the price list the winter weekday rate of ${h.c(v.k?.energia.talvipaiva ?? 0)} applies from 1 November to 31 March, Monday to Saturday 07:00–22:00. On Sundays, at night and throughout the summer season transfer costs ${h.c(v.k?.energia.muu ?? 0)}. The company describes it as suited to customers who can supplement electric heating by other means in winter. The basic fee matches time-of-day, ${v.k25 !== null ? h.eur(v.k25) : '–'} a month on 3 × 25 A.` },
        { q: 'When can I change my Pori Energia transfer product?', a: 'According to the price list general, time-of-day and seasonal transfer can be chosen freely for sites with a fuse of up to 3 × 125 A. The chosen product can only be changed after 12 months of continuous use. So it is worth choosing on a whole year’s consumption rather than one cold month’s bill. Compare the annual cost table on this page with your own use first.' },
        { q: 'Is there a power fee on Pori Energia’s network?', a: `No. Pori Energia’s price list has no power fee on any product, so charging a car while the sauna is on adds nothing beyond the kilowatt-hours. Only timing matters: on time-of-day and seasonal transfer it is the hour that counts, not the power. The company bills electricity tax of ${h.c(h.M.VERO_C, 4)} with transfer in tax class I.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Pori’s transfer prices</h2>
${hintaTaulukko(h, v.t)}
<p>In the price list the basic fees for time-of-day and seasonal transfer start at 3 × 25 A, so a single-phase connection uses general transfer. Time-of-day and seasonal share the same basic fee and differ only in when the cheaper rate applies: every night on time-of-day; on seasonal, all summer season plus winter nights and Sundays.</p>
<h2>Annual cost in Pori</h2>
${vuosiTaulukko(h, v.t)}
<p>Because time-of-day’s day rate is no dearer than general transfer, every kilowatt-hour moved to the night cuts the bill by ${h.c(v.y.energia.kaikki! - (v.a?.energia.yo ?? 0))}. Seasonal transfer’s winter weekday rate of ${h.c(v.k?.energia.talvipaiva ?? 0)} is well above general transfer, so it only suits a home that can cover winter daytime use with another heat source.</p>
<h2>Spot electricity and Pori’s time-of-day transfer</h2>
<p>The cheapest spot hours often fall at night, and on time-of-day transfer the transfer fee drops at 22:00 too. With no power fee, ${h.a('sahkoauton-lataus', 'car charging')} and the water heater can be timed for the night at the same time. ${h.a('huomenna', 'Tomorrow’s prices')} appear in the afternoon, and the ${h.a('siirtohinnat', 'transfer fee comparison')} shows where Pori stands against other networks.</p>`;
    },
  },
});
