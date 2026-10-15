import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('elenia'); const y = t.yleis, a = t.aika!, k = t.kausi!;
  return { t, y, a, k, kt: h.M.perusKk(y, 'kt'), p25: h.M.perusKk(y, '3x25'), p35: h.M.perusKk(y, '3x35'), a25: h.M.perusKk(a, '3x25'), k25: h.M.perusKk(k, '3x25') };
};

export default defineGuide({
  id: 'siirto-elenia',
  group: 'verkko',
  order: 12,
  tool: 'tanaan',
  toolProps: { verkko: 'elenia', sulake: 1 },
  related: ['siirtohinnat', 'siirto-tampere', 'huomenna', 'porssi-vai-kiintea', 'sahkovero'],
  sources: ['elenia', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-elenia',
    nav: 'Elenia',
    card: 'Elenian yleissiirto, yösiirto ja vuodenaikasiirto sekä pörssisähkön kokonaishinta Elenian verkossa.',
    title: 'Elenia siirtohinta 2026: pörssisähkö siirron ja veron kanssa',
    description: 'Elenian siirtohinnat 2026: yleissiirto, yösiirto ja vuodenaikasiirto sekä perusmaksut sulakkeen mukaan. Näe pörssisähkön kokonaishinta Elenian alueella tänään.',
    h1: 'Elenia: siirtohinta ja pörssisähkön todellinen hinta',
    intro: 'Elenian verkossa siirron hinta riippuu paljon siitä, minkä kolmesta tuotteesta valitset ja kuinka suuri pääsulake on.',
    resume: (h) => {
      const v = V(h);
      return `Elenia on Suomen toiseksi suurin sähkönjakeluyhtiö, jonka verkko kattaa suuren osan Pirkanmaata, Kanta- ja Päijät-Hämettä, Keski-Suomea, Pohjois-Pohjanmaata, Kainuuta ja Lappia. Pienasiakkaiden verkkopalveluhinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen. Yleissiirron siirtomaksu on ${h.c(v.y.energia.kaikki!)} arvonlisäveron kanssa, ja perusmaksu kasvaa jyrkästi sulakkeen mukana: kerrostalossa ${h.eur(v.kt)}, 3 × 25 ampeerin talossa ${h.eur(v.p25)} ja 3 × 35 ampeerin talossa ${h.eur(v.p35)} kuukaudessa. Yösiirrossa ja vuodenaikasiirrossa perusmaksu on vielä suurempi, mutta yön ja kesän siirto on halvempaa. Pörssisähkön kokonaishinta Elenian yleissiirrolla on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} keskimäärin ${h.c(v.t.paiva.ka)}${v.t.paivaAika ? ` ja yösiirrolla ${h.c(v.t.paivaAika.ka)}` : ''}. Laskuri on asetettu Elenian yleissiirtoon omakotitalossa; vaihda oma tuotteesi, sulakkeesi ja sopimuksesi, niin näet jokaisen vartin kokonaishinnan, päivän halvimman jakson ja kuukausittaiset perusmaksut yhdellä silmäyksellä. Elenian alueella moni talo lämmittää sähköllä, joten tuotteen valinnalla on merkitystä.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Mikä Elenian siirtotuotteista on halvin?', a: `Se riippuu kulutuksesta. Pienellä kulutuksella yleissiirto on halvin, koska sen perusmaksu on pienin. Sähkölämmitteisessä talossa yösiirto tai vuodenaikasiirto voi tulla halvemmaksi: yösiirto ohittaa yleissiirron laskelmamme mukaan noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} ja vuodenaikasiirto noin ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowattitunnin vuosikulutuksella, kun kulutus painottuu talveen. Tarkka raja riippuu siitä, kuinka suuri osa kulutuksesta osuu yöhön.` },
        { q: 'Miten Elenian vuodenaikasiirto toimii?', a: `Vuodenaikasiirrossa siirtomaksu on ${h.c(v.k.energia.talvipaiva!)} talviarkipäivinä, eli 1.11.–31.3. maanantaista lauantaihin kello 7–22, ja ${h.c(v.k.energia.muu!)} muulloin. Tuote sopii suoralle sähkölämmitykselle, jos talvipäivinä voi lämmittää myös puulla tai ilmalämpöpumpulla. Perusmaksu 3 × 25 ampeerilla on ${h.eur(v.k25)} kuukaudessa, eli enemmän kuin yleissiirrossa, joten tuote kannattaa vain suurella kulutuksella.` },
        { q: 'Voiko Elenian siirtotuotteen vaihtaa?', a: 'Hinnaston mukaan valitun tuotteen voi vaihtaa toiseen kerran vuodessa, ja tuotteen vaihto kuuluu maksuttomiin palveluihin. Kannattaa laskea ensin, mikä tuote sopii omaan kulutukseen, esimerkiksi tämän sivun taulukon tai siirtohintojen vertailun avulla, ja tehdä vaihto Elenian asiointipalvelussa. Väärä tuote voi maksaa sähkölämmitteisessä talossa satoja euroja vuodessa.' },
        { q: 'Laskuttaako Elenia myös sähköveron?', a: `Kyllä. Elenia laskuttaa verkkopalvelumaksun yhteydessä sähköveron ja huoltovarmuusmaksun, jotka se tilittää valtiolle. Veroluokassa I ne ovat yhteensä ${h.c(h.M.VERO_C, 4)} arvonlisäveron kanssa. Elenian hinnastossa on myös valmiiksi laskettu sähköverollinen siirtohinta kullekin tuotteelle, joten voit verrata sitä suoraan laskuriin. Vero on sama riippumatta sähkösopimuksesta.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Elenian pienasiakashinnasto</h2>
${hintaTaulukko(h, v.t)}
<p>Elenian hinnasto erottuu muista siinä, että perusmaksu nousee voimakkaasti sulakekoon mukana kaikissa kolmessa tuotteessa. Yleissiirrossa 3 × 35 ampeerin perusmaksu on lähes kaksinkertainen 3 × 25 ampeeriin verrattuna. Yksivaiheisille kerros- ja rivitalokäyttöpaikoille on oma, edullisempi perusmaksu, jos liittymän takana on vähintään kolme käyttöpaikkaa.</p>
<h2>Vuosikustannus kolmella käyttäjällä</h2>
${vuosiTaulukko(h, v.t)}
<p>Yösiirron ${h.c(v.a.energia.yo!)} yöhinta on selvästi yleissiirron ${h.c(v.y.energia.kaikki!)} alapuolella, mutta perusmaksu on 3 × 25 ampeerilla ${h.eur(v.a25)} yleissiirron ${h.eur(v.p25)} sijaan. Ero kuittautuu vasta, kun yöllä kulutetaan paljon, esimerkiksi varaavassa sähkölämmityksessä tai sähköauton yölatauksessa.</p>
<h2>Pörssisähkö ja Elenian yösiirto yhdessä</h2>
<p>Pörssisähkön halvimmat tunnit osuvat usein yöhön, ja yösiirrossa myös siirtomaksu on silloin halvempi. Kun molemmat yhdistyvät, yövartin kokonaishinta voi olla useita senttejä päivää halvempi, vaikka pörssihinta olisi tasainen. Laskuri näyttää tämän hyppäyksen kello 22 ja 7. ${h.a('huomenna', 'Huomisen hinnat')} kannattaa tarkistaa iltapäivällä, jos aikoo ajastaa suuren kulutuksen yöhön. Elenian alueella moni omakotitalo lämmittää sähköllä, joten oikea siirtotuote ja kulutuksen ajoitus vaikuttavat laskuun enemmän kuin pelkkä sähkösopimuksen vaihto. Vertaa Eleniaa muihin verkkoihin ${h.a('siirtohinnat', 'siirtohintojen vertailussa')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-elenia',
    nav: 'Elenia',
    card: 'Elenia’s general, night and seasonal transfer and the all-in spot price on Elenia’s network.',
    title: 'Elenia Transfer Fee 2026: Spot Electricity With Transfer',
    description: 'Elenia transfer fees 2026: general, night and seasonal transfer and basic fees by fuse size. See the all-in spot electricity price in Elenia’s area today.',
    h1: 'Elenia: transfer fee and the real spot electricity price',
    intro: 'On Elenia’s network the cost of transfer depends heavily on which of the three products you choose and on your main fuse.',
    resume: (h) => {
      const v = V(h);
      return `Elenia is Finland’s second-largest distribution company, covering much of Pirkanmaa, Kanta- and Päijät-Häme, Central Finland, Northern Ostrobothnia, Kainuu and Lapland. Its small-customer price list applies from ${h.date(v.t.v.voimassa!)}. The general transfer fee is ${h.c(v.y.energia.kaikki!)} including VAT, and the basic fee climbs steeply with the fuse: ${h.eur(v.kt)} for a flat, ${h.eur(v.p25)} for a 3 × 25 A house and ${h.eur(v.p35)} for 3 × 35 A, per month. Night and seasonal transfer have higher basic fees still, but cheaper transfer at night or in summer. The all-in spot price on Elenia’s general transfer averages ${v.t.arvio ? `an estimated ${h.c(v.t.paiva.ka)}` : `${h.c(v.t.paiva.ka)} today`}${v.t.paivaAika ? `, and ${h.c(v.t.paivaAika.ka)} on night transfer` : ''}. The calculator is preset to Elenia’s general transfer for a house; switch to your own product, fuse and contract to see every quarter hour’s all-in price.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Which Elenia transfer product is cheapest?', a: `It depends on consumption. At low use general transfer is cheapest because its basic fee is lowest. In an electrically heated house night or seasonal transfer can win: by our calculation night transfer overtakes general transfer at about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} and seasonal at about ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowatt-hours a year with winter-heavy use.` },
        { q: 'How does Elenia’s seasonal transfer work?', a: `Seasonal transfer costs ${h.c(v.k.energia.talvipaiva!)} on winter weekdays, 1 Nov to 31 Mar, Monday to Saturday 07:00–22:00, and ${h.c(v.k.energia.muu!)} at other times. It suits direct electric heating if you can also heat with wood or an air heat pump on winter days. The 3 × 25 A basic fee is ${h.eur(v.k25)} a month.` },
        { q: 'Can I change my Elenia transfer product?', a: 'According to the price list you can switch product once a year, and the switch is among the free services. Work out first which product suits your consumption, using the table on this page or the transfer fee comparison, and make the change in Elenia’s online service.' },
        { q: 'Does Elenia also bill electricity tax?', a: `Yes. Elenia bills electricity tax and the security-of-supply fee with the network fee and passes them to the state. In tax class I they total ${h.c(h.M.VERO_C, 4)} including VAT. Elenia’s price list also shows a ready-made tax-inclusive transfer price for each product.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Elenia’s small-customer price list</h2>
${hintaTaulukko(h, v.t)}
<p>Elenia’s price list stands out because the basic fee rises sharply with fuse size on all three products. On general transfer the 3 × 35 A basic fee is almost double the 3 × 25 A one. Single-phase sites in blocks of flats and terraced houses have their own lower basic fee when at least three sites share the connection.</p>
<h2>Annual cost for three users</h2>
${vuosiTaulukko(h, v.t)}
<p>Night transfer’s night rate of ${h.c(v.a.energia.yo!)} is well below general transfer’s ${h.c(v.y.energia.kaikki!)}, but the 3 × 25 A basic fee is ${h.eur(v.a25)} instead of ${h.eur(v.p25)}. The gap only pays back with heavy night use, such as storage heating or overnight car charging.</p>
<h2>Spot electricity and Elenia’s night transfer together</h2>
<p>The cheapest spot hours often fall at night, and on night transfer the transfer fee is lower then too. Combined, a night quarter’s all-in price can be several cents below the day even if the exchange price is flat. The calculator shows the step at 22:00 and 07:00. Check ${h.a('huomenna', 'tomorrow’s prices')} in the afternoon if you plan to schedule a large load overnight.</p>`;
    },
  },
});
