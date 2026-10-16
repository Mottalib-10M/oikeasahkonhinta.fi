import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('vaasa'); const y = t.yleis, a = t.aika, k = t.kausi;
  const p1 = h.M.perusKk(y, 'kt'), p25 = h.M.perusKk(y, '3x25'), p35 = h.M.perusKk(y, '3x35');
  const a25 = a ? h.M.perusKk(a, '3x25') : null, a35 = a ? h.M.perusKk(a, '3x35') : null;
  /** Perusmaksujen ero yösähkön ja yleissähkön välillä 3 × 25 A:lla, €/vuosi. */
  const lisaVuosi = a25 !== null ? (a25 - p25) * 12 : null;
  /** Yökulutus (kWh/v), jolla yösähkön halvempi yöhinta kattaa suuremman perusmaksun, jos kaikki kulutus osuisi yöhön. */
  const yoRaja = a && lisaVuosi !== null ? Math.round(lisaVuosi / ((y.energia.kaikki! - a.energia.yo!) / 100) / 100) * 100 : null;
  return { t, y, a, k, p1, p25, p35, a25, a35, lisaVuosi, yoRaja };
};

export default defineGuide({
  id: 'siirto-vaasa',
  group: 'verkko',
  order: 25,
  tool: 'tanaan',
  toolProps: { verkko: 'vaasa', sulake: 1 },
  related: ['siirtohinnat', 'siirtomaksu', 'siirto-herrfors', 'sahkoauton-lataus', 'huomenna'],
  sources: ['vaasa', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-vaasan-sahkoverkko',
    nav: 'Vaasan Sähköverkko',
    card: 'Vaasan Sähköverkon yleis-, yö- ja kausisähkö ilman tehomaksua sekä pörssisähkön kokonaishinta Vaasassa.',
    title: 'Vaasan Sähköverkko siirtohinta 2026: yösähkö ja kausisähkö',
    description: 'Vaasan Sähköverkon siirtohinnat 2026: yleissähkö, yösähkö ja kausisähkö ilman tehomaksua, perusmaksut sulakkeen mukaan. Pörssisähkön kokonaishinta Vaasassa.',
    h1: 'Vaasan Sähköverkko: pörssisähkön hinta siirron ja verojen kanssa',
    intro: 'Vaasassa kotitalouden siirrossa ei ole tehomaksua; hinta määräytyy siirtotuotteen ja pääsulakkeen mukaan. Laskuri lisää siirron ja verot jokaiseen varttiin.',
    resume: (h) => {
      const v = V(h);
      return `Vaasan Sähköverkko Oy kuuluu Vaasan Sähkö -konserniin, ja sen verkossa on ${h.num(v.t.v.asiakkaat!.maara)} käyttöpaikkaa (${v.t.v.asiakkaat!.vuosi}). Hinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen, eikä kotitalouksien tuotteissa ole tehomaksua: hinnaston tehosähkö koskee vasta yli 63 ampeerin pääsulakkeita. Yleissähkö maksaa ${h.c(v.y.energia.kaikki!)} kaikkina aikoina, ja perusmaksu on yksivaiheisella 1 × 25 ampeerin liittymällä ${h.eur(v.p1)}, 3 × 25 ampeerilla ${h.eur(v.p25)} ja 3 × 35 ampeerilla ${h.eur(v.p35)} kuukaudessa.${v.a && v.a25 !== null ? ` Yösähkö ja kausisähkö ovat tarjolla vain kolmivaiheisille liittymille, ja niiden perusmaksu on sama, ${h.eur(v.a25)} kuukaudessa 3 × 25 ampeerilla. Yösähkö maksaa kello 7–22 ${h.c(v.a.energia.paiva!)} ja kello 22–7 ${h.c(v.a.energia.yo!)}, joten sen päivähintakin alittaa yleissähkön.` : ''}${v.k ? ` Kausisähkössä talviarkipäivä 1.11.–31.3. maanantaista lauantaihin kello 7–22 maksaa ${h.c(v.k.energia.talvipaiva!)} ja muu aika ${h.c(v.k.energia.muu!)}.` : ''} Kerrostalon 2 000 kilowattitunnin siirto on Vaasassa ${v.t.sija2}. ja omakotitalon 5 000 kilowattitunnin siirto ${v.t.sija5}. edullisin laskurin ${v.t.n} verkosta. Laskuri on asetettu yleissähköön; vaihda tuote ja sulake omiksesi.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Onko Vaasan Sähköverkolla tehomaksua omakotitalossa?', a: `Ei. Hinnaston mukaan tehomaksu kuuluu vain tehosähkötuotteisiin, jotka on tarkoitettu yli 63 ampeerin pääsulakkeille sekä keski- ja suurjänniteasiakkaille. Omakotitalon ja kerrostaloasunnon siirtolasku koostuu siis perusmaksusta ja kilowattitunteihin perustuvasta siirtomaksusta. Siksi Vaasassa usean laitteen samanaikainen käyttö halvalla pörssivartilla ei nosta siirtolaskua, toisin kuin tehomaksullisissa verkoissa. Sähkövero tulee lisäksi.` },
        { q: 'Miksi Vaasan yösähkön päivähinta on yleissähköä halvempi?', a: `Hinnaston mukaan yösähkö maksaa kello 7–22 ${v.a ? h.c(v.a.energia.paiva!) : '–'} ja yleissähkö ${h.c(v.y.energia.kaikki!)}, mutta yösähkön perusmaksu on 3 × 25 ampeerilla ${v.a25 !== null ? h.eur(v.a25) : '–'} yleissähkön ${h.eur(v.p25)} sijaan. Ero on ${v.lisaVuosi !== null ? h.eur(v.lisaVuosi, 0) : '–'} vuodessa. Laskelmamme mukaan talvipainotteisella kulutuksella yösähkö tulee edullisemmaksi noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattitunnista alkaen.` },
        { q: 'Kenelle Vaasan kausisähkö sopii?', a: `Vaasan Sähköverkon mukaan kausisähkö soveltuu kohteisiin, joissa sähkönkäyttö on suurta ja painottuu kesäaikaan. Talviarkipäivinä 1.11.–31.3. maanantaista lauantaihin kello 7–22 siirto maksaa ${v.k ? h.c(v.k.energia.talvipaiva!) : '–'}, muulloin ${v.k ? h.c(v.k.energia.muu!) : '–'}. Perusmaksu on sama kuin yösähkössä. Laskelmamme mukaan talvipainotteisessa sähkölämmityksessä kausisähkö ohittaa yleissähkön noin ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowattitunnin kohdalla.` },
        { q: 'Miten siirtotuote vaihdetaan Vaasan Sähköverkossa?', a: 'Yhtiön mukaan siirtotuotteen voi vaihtaa enintään kerran vuodessa, ja vaihto on maksuton. Muutos tehdään 30 päivän kuluessa ilmoituksesta, eikä sitä tehdä takautuvasti. Tilaukseen tarvitaan sähkölaskulta löytyvä 18-numeroinen käyttöpaikkatunnus. Jos vaihtoon liittyy pääsulakkeen koon muutos, siitä sovitaan oman sähköurakoitsijan kanssa, koska yö- ja kausisähkö edellyttävät kolmivaiheista liittymää.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Vaasan Sähköverkon siirtohinnat</h2>
${hintaTaulukko(h, v.t)}
<p>Yösähkölle ja kausisähkölle hinnastossa ei ole yksivaiheista perusmaksua, koska ne on tarkoitettu kolmivaiheisille liittymille. Taulukon kerrostalosarakkeessa niille näkyy siksi lähimmän sulakkeen hinta. Yleissähkön perusmaksu nousee 3 × 35 ampeeriin siirryttäessä ${h.eur(v.p35 - v.p25)} kuukaudessa, yösähkössä ja kausisähkössä ${v.a35 !== null && v.a25 !== null ? h.eur(v.a35 - v.a25) : '–'}.</p>
<h2>Vuosikustannus Vaasassa</h2>
${vuosiTaulukko(h, v.t)}
<p>Yö- ja kausisähkön suurempi perusmaksu maksaa 3 × 25 ampeerilla ${v.lisaVuosi !== null ? h.eur(v.lisaVuosi, 0) : '–'} vuodessa enemmän kuin yleissähkö. Jos kaikki kulutus osuisi yöhön, yösähkön halvempi yöhinta kuittaisi eron noin ${v.yoRaja !== null ? h.num(v.yoRaja) : '–'} kilowattitunnin vuosikulutuksella; todellisuudessa osa kulutuksesta osuu päivään, joten raja on suurempi. Pienellä kulutuksella yleissähkö on siksi edullisin, kuten yhtiökin kerros- ja rivitaloasunnoille sekä vapaa-ajan asunnoille suosittelee. Siirtolaskun osat selitetään ${h.a('siirtomaksu', 'siirtomaksun oppaassa')}.</p>
<h2>Varaava lämmitys ja pörssisähkö Vaasassa</h2>
<p>Hinnaston mukaan varaava sähkölämmitys kytketään Fingridin suosituksesta päälle satunnaisesti kello 22–23 ja pois kello 6–7, mutta yösähkön hinta alkaa kaikilla kello 22 ja päättyy kello 7. Koska tehomaksua ei ole, ${h.a('sahkoauton-lataus', 'sähköauton lataus')}, varaaja ja muut suuret kuormat voi ajoittaa samalle halvalle yövartille. ${h.a('huomenna', 'Huomisen pörssihinnat')} näyttävät, mihin varttiin yön halvin hetki osuu. Vertaa Vaasaa muihin verkkoihin, kuten ${h.a('siirto-herrfors', 'Herrforsiin')}, ${h.a('siirtohinnat', 'siirtohintojen vertailussa')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-vaasan-sahkoverkko',
    nav: 'Vaasan Sähköverkko',
    card: 'Vaasan Sähköverkko’s general, night and seasonal transfer with no power fee, and the all-in spot price in Vaasa.',
    title: 'Vaasan Sähköverkko Transfer Fee 2026: Night and Seasonal',
    description: 'Vaasan Sähköverkko transfer fees 2026: general, night and seasonal transfer with no power fee, basic fees by fuse size, and the all-in spot price in Vaasa.',
    h1: 'Vaasan Sähköverkko: the spot electricity price with transfer and tax',
    intro: 'In Vaasa household transfer has no power fee; the price depends on the transfer product and the main fuse. The calculator adds transfer and taxes to every quarter hour.',
    resume: (h) => {
      const v = V(h);
      return `Vaasan Sähköverkko Oy belongs to the Vaasan Sähkö group and serves ${h.num(v.t.v.asiakkaat!.maara)} metering points (${v.t.v.asiakkaat!.vuosi}). Its price list applies from ${h.date(v.t.v.voimassa!)}, and household products carry no power fee: the price list’s power products only start above a 63 A main fuse. General transfer costs ${h.c(v.y.energia.kaikki!)} at all times, with a basic fee of ${h.eur(v.p1)} on a single-phase 1 × 25 A connection, ${h.eur(v.p25)} on 3 × 25 A and ${h.eur(v.p35)} on 3 × 35 A, per month.${v.a && v.a25 !== null ? ` Night and seasonal transfer are only for three-phase connections and share the same basic fee, ${h.eur(v.a25)} a month on 3 × 25 A. Night transfer costs ${h.c(v.a.energia.paiva!)} from 07:00 to 22:00 and ${h.c(v.a.energia.yo!)} from 22:00 to 07:00, so even its day rate is below general transfer.` : ''}${v.k ? ` On seasonal transfer a winter weekday, 1 Nov to 31 Mar, Monday to Saturday 07:00–22:00, costs ${h.c(v.k.energia.talvipaiva!)} and other times ${h.c(v.k.energia.muu!)}.` : ''} A flat using 2,000 kilowatt-hours ranks ${v.t.sija2} and a house using 5,000 kilowatt-hours ${v.t.sija5} of the calculator’s ${v.t.n} networks from cheapest. The calculator is preset to general transfer; switch to your own product and fuse.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Does Vaasan Sähköverkko charge a power fee for a house?', a: `No. Under the price list the power fee belongs only to the power products meant for main fuses above 63 A and for medium- and high-voltage customers. A house or flat therefore pays a basic fee plus a transfer fee per kilowatt-hour. In Vaasa running several appliances together on a cheap spot quarter does not raise the transfer bill, unlike on networks with a power fee. Electricity tax comes on top.` },
        { q: 'Why is Vaasa’s night transfer day rate below general transfer?', a: `Under the price list night transfer costs ${v.a ? h.c(v.a.energia.paiva!) : '–'} from 07:00 to 22:00 against ${h.c(v.y.energia.kaikki!)} for general transfer, but its 3 × 25 A basic fee is ${v.a25 !== null ? h.eur(v.a25) : '–'} instead of ${h.eur(v.p25)}. That is ${v.lisaVuosi !== null ? h.eur(v.lisaVuosi, 0) : '–'} more a year. By our calculation night transfer becomes cheaper from about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours of winter-heavy use.` },
        { q: 'Who is Vaasa’s seasonal transfer for?', a: `According to Vaasan Sähköverkko, seasonal transfer suits sites with high electricity use concentrated in summer. On winter weekdays, 1 Nov to 31 Mar, Monday to Saturday 07:00–22:00, transfer costs ${v.k ? h.c(v.k.energia.talvipaiva!) : '–'}, and ${v.k ? h.c(v.k.energia.muu!) : '–'} at other times. The basic fee is the same as night transfer. By our calculation, with winter-heavy electric heating, seasonal overtakes general transfer at about ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowatt-hours.` },
        { q: 'How do I change transfer product with Vaasan Sähköverkko?', a: 'According to the company you can change transfer product at most once a year, and the change is free. It is made within 30 days of notice and never backdated. The order needs the 18-digit metering point ID shown on your electricity bill. If the change involves a different main fuse size, arrange it with your own electrical contractor, as night and seasonal transfer require a three-phase connection.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Vaasan Sähköverkko’s transfer prices</h2>
${hintaTaulukko(h, v.t)}
<p>The price list has no single-phase basic fee for night or seasonal transfer, because both are for three-phase connections. The flat column therefore shows the nearest fuse size for them. Moving from 3 × 25 A to 3 × 35 A raises the general transfer basic fee by ${h.eur(v.p35 - v.p25)} a month, and night and seasonal by ${v.a35 !== null && v.a25 !== null ? h.eur(v.a35 - v.a25) : '–'}.</p>
<h2>Annual cost in Vaasa</h2>
${vuosiTaulukko(h, v.t)}
<p>On 3 × 25 A the higher basic fee of night and seasonal transfer costs ${v.lisaVuosi !== null ? h.eur(v.lisaVuosi, 0) : '–'} a year more than general transfer. If all use fell at night, the cheaper night rate would recover that at about ${v.yoRaja !== null ? h.num(v.yoRaja) : '–'} kilowatt-hours a year; in practice part of the use falls in the day, so the threshold is higher. At low use general transfer is therefore cheapest, as the company itself recommends for flats, terraced homes and holiday homes. The parts of the transfer bill are explained in the ${h.a('siirtomaksu', 'transfer fee guide')}.</p>
<h2>Storage heating and spot electricity in Vaasa</h2>
<p>Under the price list storage heating is switched on at random between 22:00 and 23:00 and off between 06:00 and 07:00, following Fingrid’s recommendation, but the night rate starts for everyone at 22:00 and ends at 07:00. With no power fee, ${h.a('sahkoauton-lataus', 'car charging')}, the water heater and other large loads can share the same cheap night quarter. ${h.a('huomenna', 'Tomorrow’s spot prices')} show which quarter is cheapest overnight. Compare Vaasa with other networks, such as ${h.a('siirto-herrfors', 'Herrfors')}, in the ${h.a('siirtohinnat', 'transfer fee comparison')}.</p>`;
    },
  },
});
