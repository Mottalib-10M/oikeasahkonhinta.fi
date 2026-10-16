import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('turku'); const y = t.yleis, a = t.aika, k = t.kausi;
  const p = h.M.perusKk(y, '3x25'), pkt = h.M.perusKk(y, 'kt'), p35 = h.M.perusKk(y, '3x35');
  const pa = a ? h.M.perusKk(a, '3x25') : null;
  /** Yösiirron perusmaksun lisähinta yleissiirtoon verrattuna, €/vuosi (1 × 10 A … 3 × 25 A). */
  const lisaPerus = pa !== null ? (pa - p) * 12 : null;
  return { t, y, a, k, p, pkt, p35, pa, lisaPerus };
};

export default defineGuide({
  id: 'siirto-turku',
  group: 'verkko',
  order: 24,
  tool: 'tanaan',
  toolProps: { verkko: 'turku', sulake: 1 },
  related: ['siirtohinnat', 'siirtomaksu', 'porssi-vai-kiintea', 'sahkoauton-lataus', 'siirto-helen'],
  sources: ['turku', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-turku-energia',
    nav: 'Turku Energia',
    card: 'Turku Energian yleis-, yö- ja kausisiirto ilman tehomaksua sekä pörssisähkön kokonaishinta Turussa.',
    title: 'Turku Energia siirtohinta 2026: yö- ja kausisiirto Turussa',
    description: 'Turku Energian siirtohinnat 2026: yleis-, yö- ja kausisiirto ilman tehomaksua, sama perusmaksu 3 × 25 A asti. Pörssisähkön kokonaishinta Turussa varteittain.',
    h1: 'Turku Energia: pörssisähkön hinta Turussa siirron kanssa',
    intro: 'Turussa kerrostalo ja 3 × 25 ampeerin omakotitalo maksavat saman perusmaksun, eikä kotitalouksien siirrossa ole tehomaksua. Laskuri lisää siirron ja verot jokaiseen varttiin.',
    resume: (h) => {
      const v = V(h);
      return `Turku Energia Sähköverkot jakaa sähkön Turussa Paattista lukuun ottamatta, ja sillä on yhtiön mukaan yli ${h.num(v.t.v.asiakkaat!.maara)} käyttöpaikkaa. Hinnasto on ollut voimassa ${h.date(v.t.v.voimassa!)} alkaen, eikä sitä ole sen jälkeen muutettu. Turun hinnoittelussa on kaksi erikoisuutta. Ensinnäkin perusmaksu on sama kaikille sulakkeille 1 × 10 ampeerista 3 × 25 ampeeriin: yleissiirrossa ${h.eur(v.p)} kuukaudessa, olipa kyse yksiöstä tai omakotitalosta. Vasta 3 × 35 ampeerin liittymässä se nousee ${h.eur(v.p35)}:oon. Toiseksi kotitalouksien yleis-, yö- ja kausisiirrossa ei ole tehomaksua, joten samanaikainen kulutus ei kasvata siirtolaskua. Yleissiirto maksaa ${h.c(v.y.energia.kaikki!)}.${v.a ? ` Yösiirrossa yöaika on kello 22–7, ja silloin siirto maksaa ${h.c(v.a.energia.yo!)}, päivällä ${h.c(v.a.energia.paiva!)}.` : ''}${v.k ? ` Kausisiirron talviarkipäivä maksaa ${h.c(v.k.energia.talvipaiva!)} ja muu aika ${h.c(v.k.energia.muu!)}; sen perusmaksu on sama kuin yösiirron.` : ''} Omakotitalon 5 000 kilowattitunnin siirto on Turussa ${v.t.sija5}. edullisin laskurin ${v.t.n} verkosta ja kerrostalon 2 000 kilowattituntia ${v.t.sija2}. edullisin. Laskuri on asetettu Turun yleissiirtoon; vaihda tuote, niin näet sen vaikutuksen jokaiseen varttiin.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miksi Turussa kerrostalo ja omakotitalo maksavat saman perusmaksun?', a: `Turku Energian hinnastossa perusmaksu on porrastettu sulakkeen mukaan vasta 3 × 25 ampeerin jälkeen. Kaikki liittymät 1 × 10 ampeerista 3 × 25 ampeeriin maksavat yleissiirrossa saman ${h.eur(v.p)} kuukaudessa, ja perusmaksu sisältää hinnaston mukaan myös mittarin ylläpidon. Pienessä kerrostaloasunnossa perusmaksun osuus siirtolaskusta on siksi suuri, omakotitalossa pienempi. Laskurissa sulakkeen vaihto 3 × 25 ampeeriin ei siksi muuta Turun perusmaksua lainkaan.` },
        { q: 'Onko Turku Energian kotitalousverkossa tehomaksua?', a: 'Ei. Hinnaston mukaan kotitalouksien Yleis-, Yö- ja Kausisiirto koostuvat vain perusmaksusta ja kilowattitunteihin perustuvasta siirtomaksusta. Pätötehomaksu on erillisessä Tehosiirto pj -tuotteessa sekä keskijännite- ja alueverkkosiirrossa, joissa laskutusteho on liukuvan 12 kuukauden kahden suurimman kuukausitehon keskiarvo. Turussa sähköauton latauksen ja saunan päällekkäisyys ei siis nosta siirtomaksua, vaikka se nostaisi hetkellistä tehoa.' },
        { q: 'Lasketaanko lauantai Turun kausisiirron talviarkipäiväksi?', a: `Kyllä. Hinnaston mukaan kausisiirron talviarkipäiviä ovat arkipäivät maanantaista lauantaihin 1.11.–31.3. kello 7–22. Silloin siirto maksaa ${v.k ? h.c(v.k.energia.talvipaiva!) : '–'}, muina aikoina ${v.k ? h.c(v.k.energia.muu!) : '–'}. Talven lauantaipäivä on siis kallis, ja vain sunnuntai sekä yöt ovat talvella edullisia. Laskelmamme mukaan kausisiirto ohittaa yleissiirron talvipainotteisella kulutuksella noin ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowattitunnista alkaen.` },
        { q: 'Kuinka usein Turku Energian siirtotuotteen voi vaihtaa?', a: 'Hinnaston myyntiehtojen mukaan valitun tuotteen voi vaihtaa aikaisintaan vuoden kuluttua. Vaihto edellyttää, että käyttöpaikalla on mittauslaitteet, jotka mittaavat uuden tuotteen laskutusperusteet. Jos mittareihin tarvitaan muutoksia, niistä peritään erillisen mittarointihinnaston mukainen maksu. Kannattaa siis laskea vuoden kulutus ennen vaihtoa, esimerkiksi tämän sivun vuosikustannustaulukosta.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Turun siirtohinnat</h2>
${hintaTaulukko(h, v.t)}
<p>Taulukossa kerrostalon ja 3 × 25 ampeerin perusmaksu on sama, koska Turku Energia ei porrasta pieniä sulakkeita. Kausisiirrolla ei ole omaa perusmaksua: hinnasto viittaa yösiirron perusmaksuun. Kaikkien kolmen tuotteen suurin sulake on hinnaston mukaan 3 × 160 A.</p>
<h2>Vuosikustannus Turussa</h2>
${vuosiTaulukko(h, v.t)}
<p>${v.lisaPerus !== null && v.a ? `Yösiirron perusmaksu on ${h.eur(v.pa!)} kuukaudessa, eli ${h.eur(v.lisaPerus, 0)} vuodessa enemmän kuin yleissiirron. Päiväsiirto (${h.c(v.a.energia.paiva!)}) on lähes yleissiirron hintainen, joten säästö syntyy vain yön ${h.c(v.a.energia.yo!)} kilowattitunneista. Laskelmamme mukaan yösiirto tulee edullisemmaksi noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattitunnin talvipainotteisella vuosikulutuksella.` : ''} Kerrostalossa yleissiirto on lähes aina edullisin.</p>
<h2>Pörssisähkö Turussa ilman tehomaksua</h2>
<p>Koska Turun kotitalouksien siirrossa ei ole tehomaksua, pörssisähkön halvimmille varteille voi ajoittaa useita laitteita samaan aikaan ilman, että siirtolasku kasvaa. Esimerkiksi ${h.a('sahkoauton-lataus', 'sähköauton lataus')} ja varaaja voivat käydä yhtä aikaa. Yösiirrossa yövartin hintaan lisätään halvempi siirtomaksu, ja hyppäys näkyy laskurissa kello 22 ja 7. Paattisten alueella verkkoyhtiö on eri, joten tarkista oma verkkosi ennen laskelmaa. Vertaa Turkua muihin verkkoihin ${h.a('siirtohinnat', 'siirtohintojen vertailussa')} tai ${h.a('kuukausihinnat', 'kuukausihinnoista')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-turku-energia',
    nav: 'Turku Energia',
    card: 'Turku Energia’s general, night and seasonal transfer without a power fee and the all-in spot price in Turku.',
    title: 'Turku Energia Transfer Fee 2026: Night and Seasonal Rates',
    description: 'Turku Energia transfer fees 2026: general, night and seasonal transfer with no power fee and one basic fee up to 3 × 25 A. All-in spot price in Turku today.',
    h1: 'Turku Energia: the spot electricity price in Turku with transfer',
    intro: 'In Turku a flat and a 3 × 25 A house pay the same basic fee, and household transfer has no power fee. The calculator adds transfer and taxes to every quarter hour.',
    resume: (h) => {
      const v = V(h);
      return `Turku Energia Sähköverkot distributes electricity in Turku except Paattinen and, according to the company, has more than ${h.num(v.t.v.asiakkaat!.maara)} metering points. Its price list has applied since ${h.date(v.t.v.voimassa!)} and has not changed since. Turku’s pricing has two distinctive features. First, the basic fee is the same for every fuse from 1 × 10 A to 3 × 25 A: ${h.eur(v.p)} a month on general transfer, whether for a studio flat or a detached house. Only a 3 × 35 A connection pays more, ${h.eur(v.p35)}. Second, household general, night and seasonal transfer carry no power fee, so running appliances at the same time does not raise the transfer bill. General transfer costs ${h.c(v.y.energia.kaikki!)}.${v.a ? ` On night transfer, night time is 22:00–07:00 and costs ${h.c(v.a.energia.yo!)}, with ${h.c(v.a.energia.paiva!)} by day.` : ''}${v.k ? ` Seasonal transfer costs ${h.c(v.k.energia.talvipaiva!)} on winter weekdays and ${h.c(v.k.energia.muu!)} at other times; its basic fee is that of night transfer.` : ''} For a house using 5,000 kilowatt-hours Turku ranks ${v.t.sija5} of the calculator’s ${v.t.n} networks from cheapest, and ${v.t.sija2} for a flat using 2,000. The calculator is set to Turku’s general transfer; switch product to see its effect on every quarter hour.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Why do a flat and a house pay the same basic fee in Turku?', a: `Turku Energia’s price list only steps the basic fee by fuse size above 3 × 25 A. Every connection from 1 × 10 A to 3 × 25 A pays the same ${h.eur(v.p)} a month on general transfer, and according to the price list the basic fee also covers meter upkeep. In a small flat the basic fee is therefore a large share of the transfer bill; in a house it is a smaller one.` },
        { q: 'Does Turku Energia’s household network have a power fee?', a: 'No. According to the price list, household General, Night and Seasonal transfer consist only of a basic fee and a per-kilowatt-hour transfer fee. An active power fee applies to the separate Tehosiirto pj product and to medium-voltage and regional transfer, where billed power is the mean of the two highest monthly peaks over a rolling 12 months. In Turku, charging a car while the sauna is on does not raise the transfer fee, even though it lifts instantaneous power.' },
        { q: 'Does Saturday count as a winter weekday on Turku’s seasonal transfer?', a: `Yes. According to the price list, winter weekdays on seasonal transfer are Monday to Saturday from 1 November to 31 March, 07:00–22:00. It then costs ${v.k ? h.c(v.k.energia.talvipaiva!) : '–'}, and ${v.k ? h.c(v.k.energia.muu!) : '–'} at other times. So in winter only Sundays and nights are cheap. By our calculation seasonal transfer beats general transfer from about ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowatt-hours of winter-heavy use.` },
        { q: 'How often can you change Turku Energia transfer product?', a: 'Under the price list’s terms of sale, a chosen product can be changed no sooner than one year later. A change requires metering equipment at the site that measures the new product’s billing quantities. If the meters need altering, a fee under the separate metering price list is charged. It is worth working out a year’s use before switching, for example from the annual cost table on this page.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Turku’s transfer prices</h2>
${hintaTaulukko(h, v.t)}
<p>The flat and 3 × 25 A basic fees in the table are identical because Turku Energia does not step small fuse sizes. Seasonal transfer has no basic fee of its own: the price list refers to the night transfer basic fee. Under the price list the largest fuse for all three products is 3 × 160 A.</p>
<h2>Annual cost in Turku</h2>
${vuosiTaulukko(h, v.t)}
<p>${v.lisaPerus !== null && v.a ? `Night transfer’s basic fee is ${h.eur(v.pa!)} a month, ${h.eur(v.lisaPerus, 0)} a year more than general transfer. Its daytime rate (${h.c(v.a.energia.paiva!)}) is almost the same as general transfer, so the saving comes only from night-time kilowatt-hours at ${h.c(v.a.energia.yo!)}. By our calculation night transfer becomes cheaper from about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours of winter-heavy annual use.` : ''} In a flat general transfer is almost always the cheapest.</p>
<h2>Spot electricity in Turku without a power fee</h2>
<p>Because household transfer in Turku has no power fee, you can schedule several appliances on the cheapest spot quarters at once without raising the transfer bill. ${h.a('sahkoauton-lataus', 'Car charging')} and a water heater can, for example, run together. On night transfer the night quarter also gets the cheaper transfer fee, and the step shows in the calculator at 22:00 and 07:00. Paattinen is served by a different operator, so check your own network before calculating. Compare Turku with other networks in the ${h.a('siirtohinnat', 'transfer fee comparison')} or the ${h.a('kuukausihinnat', 'monthly prices')}.</p>`;
    },
  },
});
