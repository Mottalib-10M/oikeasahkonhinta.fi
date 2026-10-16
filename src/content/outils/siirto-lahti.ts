import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('lahti'); const tt = t.v.tuotteet;
  const y = tt.find((x) => x.nimi === 'Yleissiirto')!, a = tt.find((x) => x.nimi === 'Yösiirto')!;
  const yt = tt.find((x) => x.nimi === 'Yleissiirto teho')!, at = tt.find((x) => x.nimi === 'Yösiirto teho')!;
  const teho = yt.teho!.eurKwKk;
  /** Tehomaksu, kun huippu on 5 kW tai 10 kW, €/vuosi. */
  const tehoVuosi = (kw: number) => teho * kw * 12;
  return { t, y, a, yt, at, teho, tehoVuosi, p: h.M.perusKk(y, 'kt'), pa: h.M.perusKk(a, 'kt'), pyt: h.M.perusKk(yt, '3x25'), pat: h.M.perusKk(at, '3x25'), tasapainoTeho: t.tasapaino(at, yt) };
};

export default defineGuide({
  id: 'siirto-lahti',
  group: 'verkko',
  order: 20,
  tool: 'tanaan',
  toolProps: { verkko: 'lahti', sulake: 1 },
  related: ['siirtohinnat', 'tehomaksu', 'siirto-elenia', 'pyykinpesu', 'porssi-vai-kiintea'],
  sources: ['lahti', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-lahti-energia',
    nav: 'Lahti Energia',
    card: 'Lahti Energian teho- ja tehomaksuttomat siirtotuotteet sekä pörssisähkön kokonaishinta Lahdessa.',
    title: 'Lahti Energia siirtohinta 2026: tehomaksu ja pörssisähkö',
    description: 'Lahti Energian siirtohinnat 2026: Yleissiirto teho ja Yösiirto teho omakotitaloille, tehomaksuttomat tuotteet kerrostaloille. Kokonaishinta vartti vartilta.',
    h1: 'Lahti Energia: pörssisähkön hinta Lahdessa tehomaksun kanssa',
    intro: 'Lahdessa omakotitalon siirtoon kuuluu tehomaksu, rivi- ja kerrostaloasunnossa ei. Laskuri lisää siirron, tehomaksun ja verot jokaiseen varttiin.',
    resume: (h) => {
      const v = V(h);
      return `Lahti Energia Sähköverkko siirtää sähkön Lahden kaupunkialueella, ja sen hinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen. Yhtiön mukaan tehomaksu on käytössä kaikilla liittymillä, joissa on yksi käyttöpaikka, eli tavallisesti omakotitaloissa. Rivi-, pari- ja kerrostaloasunnoissa tehomaksua ei ole, mutta ne voivat halutessaan valita tehotuotteen. Yleissiirto teho maksaa ${h.c(v.yt.energia.kaikki!)}, perusmaksu on ${h.eur(v.pyt)} kuukaudessa ja tehomaksu ${h.eur(v.teho)} kilowatilta kuukaudessa. Tehomaksu perustuu edellisen 12 kuukauden suurimpaan tunnin keskitehoon, joten 5 kilowatin huippu maksaa ${h.eur(v.tehoVuosi(5), 0)} ja 10 kilowatin huippu ${h.eur(v.tehoVuosi(10), 0)} vuodessa. Yösiirto teho maksaa päivällä kello 7–22 ${h.c(v.at.energia.paiva!)} ja yöllä ${h.c(v.at.energia.yo!)}. Kerrostalon tehomaksuton yleissiirto maksaa ${h.c(v.y.energia.kaikki!)} ja ${h.eur(v.p)} kuukaudessa. Omakotitalon 5 000 kilowattitunnin siirto on Lahdessa ${v.t.sija5}. edullisin laskurin ${v.t.n} verkosta, kun huippu on 5 kilowattia. Laskuri on asetettu omakotitalon Yleissiirto tehoon; syötä oma huippusi, niin tehomaksu lasketaan sen mukaan.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miten Lahti Energian tehomaksu lasketaan?', a: `Lahti Energian mukaan tehomaksu perustuu edellisen 12 kuukauden aikana mitattuun suurimpaan tunnin keskitehoon. Sama huippu ja sen mukainen maksu ovat voimassa seuraavat 12 kuukautta, ellei uusi huippu ylitä sitä. Maksu on ${h.eur(v.teho)} kilowatilta kuukaudessa arvonlisäveron kanssa. Kun pienennät huippua, muutos näkyy laskulla vasta vuoden kuluttua. Oman huippusi näet yhtiön OmaWatti-palvelusta.` },
        { q: 'Koskeeko tehomaksu kerrostaloasuntoa Lahdessa?', a: `Ei. Yhtiön mukaan tehomaksua ei ole rivitalo-, paritalo- tai kerrostaloasunnoissa, joten niissä voi käyttää tehomaksutonta yleissiirtoa (${h.c(v.y.energia.kaikki!)}, perusmaksu ${h.eur(v.p)}) tai yösiirtoa. Tehotuotteeseen voi halutessaan vaihtaa. Laskurissa tehomaksuttomat tuotteet näkyvät, kun valitset asunnoksi kerrostalon tai 1-vaiheisen liittymän. Omakotitalon valinnalla laskuri näyttää vain tehotuotteet, koska ne ovat hinnaston mukaan siellä käytössä.` },
        { q: 'Kannattaako Lahdessa Yösiirto teho?', a: `Yösiirto tehon perusmaksu ${h.eur(v.pat)} on suurempi kuin Yleissiirto tehon ${h.eur(v.pyt)}, mutta yösiirto maksaa vain ${h.c(v.at.energia.yo!)}. Laskelmamme mukaan se tulee talvipainotteisella kulutuksella edullisemmaksi noin ${v.tasapainoTeho ? h.num(v.tasapainoTeho) : '–'} kilowattitunnista alkaen. Tehomaksu on molemmissa sama, joten valinta riippuu siitä, kuinka suuri osa kulutuksesta osuu kello 22 ja 7 väliin.` },
        { q: 'Muuttuuko Lahden tehomaksu vuonna 2029?', a: 'Lahti Energian mukaan Energiaviraston uusi määräys sähkön jakelun hinnoitteluperusteiden yhtenäistämisestä tulee voimaan 1.1.2029, ja yhtiö selvittää tulevaa tuoterakennetta sen mukaisesti. Nykyinen käytäntö on yhtiön käsityksen mukaan voimassa olevien määräysten mukainen. Laskuri päivitetään, kun uusi hinnasto julkaistaan, ja tarkistusohjelma huomaa muutoksen, koska se vertaa jokaista laskurin hintaa yhtiön sivuun.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Lahden siirtohinnat</h2>
${hintaTaulukko(h, v.t)}
<p>Tehomaksuttomat Yleissiirto ja Yösiirto koskevat hinnaston mukaan rivi-, pari- ja kerrostaloasuntoja, siksi niiden omakotitalosarakkeissa on viiva. Omakotitalossa valittavana ovat tehotuotteet, joissa siirtomaksu on halvempi ja tehomaksu tulee lisäksi.</p>
<h2>Vuosikustannus Lahdessa</h2>
${vuosiTaulukko(h, v.t)}
<p>Taulukon tehomaksu on laskettu 5 kilowatin huipulla. Sähkölämmitteisessä talossa huippu on usein suurempi: 10 kilowatin huippu lisää vuosikustannukseen ${h.eur(v.tehoVuosi(10) - v.tehoVuosi(5), 0)}. Huippua voi pienentää porrastamalla esimerkiksi sähköauton latauksen, saunan ja lämminvesivaraajan käyttöä, jolloin ne eivät osu samaan tuntiin.</p>
<h2>Pörssisähkö ja tehomaksu yhdessä</h2>
<p>Pörssisähkössä halvat tunnit houkuttelevat käynnistämään monta laitetta yhtä aikaa. Lahdessa se voi nostaa tehohuippua ja koko seuraavan vuoden tehomaksua. Siksi ${h.a('pyykinpesu', 'pyykinpesu')} ja muut joustavat kuormat kannattaa ajoittaa halvoille varteille peräkkäin eikä päällekkäin. Lahden ympäristön maaseudulla verkkoyhtiö on usein ${h.a('siirto-elenia', 'Elenia')}; ${h.a('tehomaksu', 'tehomaksun opas')} kertoo, miten eri verkot tehon laskevat.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-lahti-energia',
    nav: 'Lahti Energia',
    card: 'Lahti Energia’s power-fee and flat-rate transfer products and the all-in spot price in Lahti.',
    title: 'Lahti Energia Transfer Fee 2026: Power Fee and Spot Price',
    description: 'Lahti Energia transfer fees 2026: power-fee general and night transfer for houses, flat-rate products for apartments. All-in spot price by quarter today.',
    h1: 'Lahti Energia: the spot electricity price in Lahti with the power fee',
    intro: 'In Lahti a house’s transfer includes a power fee; a flat or terraced home does not. The calculator adds transfer, power fee and taxes to every quarter hour.',
    resume: (h) => {
      const v = V(h);
      return `Lahti Energia Sähköverkko distributes electricity in the city of Lahti; its price list applies from ${h.date(v.t.v.voimassa!)}. According to the company, the power fee applies to every connection with a single metering point, which usually means a detached house. Terraced, semi-detached and apartment homes have no power fee but may opt for a power product. General transfer with power fee costs ${h.c(v.yt.energia.kaikki!)}, with a basic fee of ${h.eur(v.pyt)} a month and a power fee of ${h.eur(v.teho)} per kilowatt per month. The power fee is based on the highest hourly average power of the previous 12 months, so a 5 kW peak costs ${h.eur(v.tehoVuosi(5), 0)} and a 10 kW peak ${h.eur(v.tehoVuosi(10), 0)} a year. Night transfer with power fee costs ${h.c(v.at.energia.paiva!)} by day (07:00–22:00) and ${h.c(v.at.energia.yo!)} at night. The flat-rate general transfer for apartments costs ${h.c(v.y.energia.kaikki!)} and ${h.eur(v.p)} a month. For a house using 5,000 kilowatt-hours with a 5 kW peak, Lahti ranks ${v.t.sija5} of the calculator’s ${v.t.n} networks from cheapest. Enter your own peak and the calculator prices the power fee from it.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'How is Lahti Energia’s power fee calculated?', a: `According to Lahti Energia, the power fee is based on the highest hourly average power measured over the previous 12 months. That peak and its fee stay in force for the next 12 months unless a new peak exceeds it. The fee is ${h.eur(v.teho)} per kilowatt per month including VAT. A lower peak only shows on the bill a year later. Your peak is in the company’s OmaWatti service.` },
        { q: 'Does the power fee apply to a flat in Lahti?', a: `No. According to the company there is no power fee in terraced, semi-detached or apartment homes, which can use the flat-rate general transfer (${h.c(v.y.energia.kaikki!)}, basic fee ${h.eur(v.p)}) or night transfer. They may switch to a power product if they wish. In the calculator the flat-rate products appear when you choose a flat or single-phase connection.` },
        { q: 'Is night transfer with power fee worth it in Lahti?', a: `Its basic fee of ${h.eur(v.pat)} is higher than general transfer’s ${h.eur(v.pyt)}, but night-time transfer costs only ${h.c(v.at.energia.yo!)}. By our calculation it becomes cheaper from about ${v.tasapainoTeho ? h.num(v.tasapainoTeho) : '–'} kilowatt-hours of winter-heavy use. The power fee is the same on both, so the choice depends on how much of your use falls between 22:00 and 07:00.` },
        { q: 'Will Lahti’s power fee change in 2029?', a: 'According to Lahti Energia, the Energy Authority’s new regulation harmonising distribution pricing takes effect on 1 January 2029, and the company is designing its future products to match. In its view the current practice complies with the rules now in force. The calculator will be updated when a new price list is published.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Lahti’s transfer prices</h2>
${hintaTaulukko(h, v.t)}
<p>Under the price list the flat-rate general and night transfer are for terraced, semi-detached and apartment homes, hence the dashes in the house columns. A house chooses between the power products, which have a cheaper transfer fee plus the power fee.</p>
<h2>Annual cost in Lahti</h2>
${vuosiTaulukko(h, v.t)}
<p>The table prices the power fee at a 5 kW peak. An electrically heated house often peaks higher: a 10 kW peak adds ${h.eur(v.tehoVuosi(10) - v.tehoVuosi(5), 0)} a year. You can lower the peak by staggering the car charger, sauna and water heater so they do not run in the same hour.</p>
<h2>Spot electricity and the power fee together</h2>
<p>On a spot contract cheap hours tempt you to start several appliances at once. In Lahti that can raise your power peak and the whole next year’s power fee. Schedule ${h.a('pyykinpesu', 'the washing')} and other flexible loads on cheap quarters one after another rather than together. In the rural areas around Lahti the operator is often ${h.a('siirto-elenia', 'Elenia')}; the ${h.a('tehomaksu', 'power fee guide')} explains how different networks measure power.</p>`;
    },
  },
});
