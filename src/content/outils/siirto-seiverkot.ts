import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('seiverkot'); const y = t.yleis, a = t.aika!, k = t.kausi!;
  return { t, y, a, k, kt: h.M.perusKk(y, 'kt'), p25: h.M.perusKk(y, '3x25'), p35: h.M.perusKk(y, '3x35'), a25: h.M.perusKk(a, '3x25') };
};

export default defineGuide({
  id: 'siirto-seiverkot',
  group: 'verkko',
  order: 22,
  tool: 'tanaan',
  toolProps: { verkko: 'seiverkot', sulake: 1 },
  related: ['siirtohinnat', 'siirto-caruna', 'halvin-aika', 'kuivausrumpu', 'porssi-vai-kiintea'],
  sources: ['seiverkot', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-seiverkot',
    nav: 'Seiverkot',
    card: 'Seiverkkojen yksiaikainen, kaksiaikainen ja vuodenaikasiirto sekä pörssisähkön kokonaishinta Seinäjoella.',
    title: 'Seiverkot siirtohinta 2026: pörssisähkö Seinäjoella',
    description: 'Seiverkkojen siirtohinnat 2026 Seinäjoella: yksiaikainen, kaksiaikainen ja vuodenaika. Laskurin edullisimpia perusmaksuja ja pörssisähkön kokonaishinta tänään.',
    h1: 'Seiverkot: pörssisähkön hinta Seinäjoella',
    intro: 'Seinäjoen Seiverkkojen perusmaksut ovat laskurin pienimpiä. Laskuri lisää siirron ja verot jokaiseen varttiin.',
    resume: (h) => {
      const v = V(h);
      return `Seiverkot siirtää sähkön Seinäjoella ja sen lähialueilla Etelä-Pohjanmaalla. Yhtiön verkkopalveluhinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen, eikä sitä ole sen jälkeen muutettu. Perusmaksut ovat laskurin pienimpiä: yksiaikaisessa verkkopalvelussa 3 × 25 ampeerin liittymä maksaa ${h.eur(v.p25)}, 3 × 35 ampeerin ${h.eur(v.p35)} ja yksivaiheinen 35 ampeerin liittymä ${h.eur(v.kt)} kuukaudessa. Siirtomaksu on ${h.c(v.y.energia.kaikki!)} arvonlisäveron kanssa. Kaksiaikaisessa verkkopalvelussa päiväsiirto kello 7–22 on ${h.c(v.a.energia.paiva!)} ja yösiirto ${h.c(v.a.energia.yo!)}, ja vuodenaikapalvelussa talviarkipäivä ${h.c(v.k.energia.talvipaiva!)}. Omakotitalon 5 000 kilowattitunnin siirto on Seiverkoilla ${v.t.sija5}. edullisin laskurin ${v.t.n} verkosta. Pörssisähkön kokonaishinta yksiaikaisella siirrolla on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} keskimäärin ${h.c(v.t.paiva.ka)}. Laskuri on asetettu Seiverkkojen yksiaikaiseen palveluun omakotitalossa; vaihda tuote ja sopimus, niin näet jokaisen vartin kokonaishinnan. Pieni perusmaksu tekee siirrosta edullista erityisesti pienen kulutuksen kodeissa. Postinumerohaku varmistaa yhtiön.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miksi Seiverkkojen perusmaksu on niin pieni?', a: `Seiverkot perii suuren osan siirron kustannuksista kulutukseen perustuvana siirtomaksuna ja pitää kiinteän perusmaksun pienenä. 3 × 25 ampeerin liittymässä perusmaksu on vain ${h.eur(v.p25)} kuukaudessa. Pienen kulutuksen kodeissa, kuten kesämökeissä, tämä tekee siirrosta edullista, koska kiinteää maksua kertyy vähän. Suurella kulutuksella siirtomaksun merkitys kasvaa.` },
        { q: 'Kannattaako Seiverkoilla kaksiaikainen verkkopalvelu?', a: `Kaksiaikaisen palvelun perusmaksu on 3 × 25 ampeerilla ${h.eur(v.a25)} ja yösiirto ${h.c(v.a.energia.yo!)}, kun yksiaikainen maksaa ${h.c(v.y.energia.kaikki!)} koko ajan. Laskelmamme mukaan kaksiaikainen tulee halvemmaksi noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattitunnin talvipainotteisella vuosikulutuksella, ja raja on alempi, jos kulutusta on paljon yöllä. Vuosivertailun taulukko näyttää kolmen kodin luvut.` },
        { q: 'Mitkä ovat Seiverkkojen aikarajat?', a: 'Hinnaston mukaan kaksiaikaisen ja tehoverkkopalvelun yöaika on kello 22–07 ja päiväaika kello 07–22. Vuodenaikapalvelun talviarkipäiväaika on 1.11.–31.3. maanantaista lauantaihin kello 7–22. Laskuri käyttää näitä rajoja Suomen aikaa jokaisessa vartissa. Arkipyhiä laskuri ei erottele, joten pyhäpäivän talvihinta voi poiketa hieman todellisesta. Kesällä vuodenaikapalvelun koko vuorokausi on halvempaa aikaa.' },
        { q: 'Onko Seiverkkojen hinnasto muuttunut vuonna 2026?', a: `Laskuria tehtäessä Seiverkkojen sivulla oleva hinnasto oli voimassa ${h.date(v.t.v.voimassa!)} alkaen. Sähkövero muuttui ${h.date(h.P.vero.voimassa)}, mutta se ei kuulu siirtohinnastoon vaan laskutetaan erikseen. Tarkistusohjelma ilmoittaa, jos yhtiön sivun hinnat muuttuvat. Tällöin laskurin hinnat päivitetään ja sivun päivämäärä muuttuu.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Seiverkkojen hinnasto</h2>
${hintaTaulukko(h, v.t)}
<p>Seiverkkojen kaksiaikaisella ja vuodenaikapalvelulla on samat perusmaksut, ja molemmissa ne kasvavat maltillisesti sulakkeen mukana. Tilapäiselle käytölle, kuten rakennustyömaalle, on oma tuotteensa. Laskutuksen maksuaika on hinnaston mukaan 14 päivää.</p>
<h2>Vuosikustannus Seinäjoella</h2>
${vuosiTaulukko(h, v.t)}
<p>Pienen perusmaksun vuoksi Seiverkkojen siirto on erityisen edullista pienellä kulutuksella. Kun kulutus kasvaa, siirtomaksun osuus kasvaa, ja sähkölämmitteisessä talossa kaksiaikainen tai vuodenaikapalvelu voi tulla edullisemmaksi.</p>
<h2>Pörssisähkö ja edullinen siirto</h2>
<p>Seinäjoella siirto ja vero muodostavat kokonaishinnasta pienemmän osan kuin monessa muussa verkossa, joten pörssisähkön hinnanvaihtelu näkyy kokonaishinnassa voimakkaasti. Kulutuksen ajoittaminen ${h.a('halvin-aika', 'halvimmille tunneille')} kannattaa: esimerkiksi ${h.a('kuivausrumpu', 'kuivausrummun')} käyttö halvalla tunnilla säästää selvästi. Etelä-Pohjanmaan maaseudulla verkkoyhtiö voi olla myös ${h.a('siirto-caruna', 'Caruna')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-seiverkot',
    nav: 'Seiverkot',
    card: 'Seiverkot’s single-rate, two-rate and seasonal transfer and the all-in spot price in Seinäjoki.',
    title: 'Seiverkot Transfer Fee 2026: Spot Electricity in Seinäjoki',
    description: 'Seiverkot transfer fees 2026 in Seinäjoki: single-rate, two-rate and seasonal service. Among the calculator’s lowest basic fees, plus today’s all-in spot price.',
    h1: 'Seiverkot: the spot electricity price in Seinäjoki',
    intro: 'Seinäjoki’s Seiverkot has some of the lowest basic fees in the calculator. The calculator adds transfer and taxes to every quarter hour.',
    resume: (h) => {
      const v = V(h);
      return `Seiverkot distributes electricity in Seinäjoki and nearby areas of South Ostrobothnia. Its price list applies from ${h.date(v.t.v.voimassa!)} and has not changed since. Its basic fees are among the lowest in the calculator: on the single-rate service a 3 × 25 A connection costs ${h.eur(v.p25)}, 3 × 35 A ${h.eur(v.p35)} and a single-phase 35 A connection ${h.eur(v.kt)} a month. The transfer fee is ${h.c(v.y.energia.kaikki!)} including VAT. On the two-rate service day transfer (07:00–22:00) is ${h.c(v.a.energia.paiva!)} and night ${h.c(v.a.energia.yo!)}, and on the seasonal service a winter weekday costs ${h.c(v.k.energia.talvipaiva!)}. For a house using 5,000 kilowatt-hours, Seiverkot ranks ${v.t.sija5} of the calculator’s ${v.t.n} networks from cheapest. The all-in spot price on the single-rate service averages ${v.t.arvio ? `an estimated ${h.c(v.t.paiva.ka)}` : `${h.c(v.t.paiva.ka)} today`}. The calculator is preset to Seiverkot’s single-rate service for a house; change product and contract to see every quarter hour’s all-in price.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Why is Seiverkot’s basic fee so low?', a: `Seiverkot recovers much of its cost through the per-kWh transfer fee and keeps the fixed basic fee small: only ${h.eur(v.p25)} a month on 3 × 25 A. For low-use homes such as summer cottages this makes transfer cheap, because little fixed charge accrues.` },
        { q: 'Is Seiverkot’s two-rate service worth it?', a: `The two-rate service has a 3 × 25 A basic fee of ${h.eur(v.a25)} and a night rate of ${h.c(v.a.energia.yo!)}, while single-rate costs ${h.c(v.y.energia.kaikki!)} at all times. By our calculation two-rate becomes cheaper at about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours of winter-heavy annual use, lower with heavy night use.` },
        { q: 'What are Seiverkot’s time windows?', a: 'According to the price list, night on the two-rate and power services is 22:00–07:00 and day 07:00–22:00. The seasonal service’s winter weekday is 1 Nov to 31 Mar, Monday to Saturday 07:00–22:00. The calculator applies these windows in Finnish time to every quarter hour.' },
        { q: 'Has Seiverkot’s price list changed in 2026?', a: `When the calculator was built, the price list on Seiverkot’s site applied from ${h.date(v.t.v.voimassa!)}. Electricity tax changed on ${h.date(h.P.vero.voimassa)}, but it is not part of the transfer price list and is billed separately. The check script flags any change to the prices on the company’s page.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Seiverkot’s price list</h2>
${hintaTaulukko(h, v.t)}
<p>Seiverkot’s two-rate and seasonal services share the same basic fees, which rise only moderately with fuse size. Temporary use, such as a building site, has its own product. Invoices are due in 14 days, according to the price list.</p>
<h2>Annual cost in Seinäjoki</h2>
${vuosiTaulukko(h, v.t)}
<p>Because of the low basic fee, Seiverkot’s transfer is especially cheap at low consumption. As use grows the transfer fee’s share grows, and in an electrically heated house the two-rate or seasonal service can become cheaper.</p>
<h2>Spot electricity with cheap transfer</h2>
<p>In Seinäjoki transfer and tax make up a smaller share of the all-in price than in many networks, so spot price swings show strongly in the all-in price. Timing use for the ${h.a('halvin-aika', 'cheapest hours')} pays: running the ${h.a('kuivausrumpu', 'tumble dryer')} in a cheap hour saves noticeably. In rural South Ostrobothnia the operator may also be ${h.a('siirto-caruna', 'Caruna')}.</p>`;
    },
  },
});
