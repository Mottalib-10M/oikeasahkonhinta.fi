import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('lahti'); const y = t.yleis, a = t.aika!;
  return { t, y, a, p: h.M.perusKk(y, '3x25'), pa: h.M.perusKk(a, '3x25') };
};

export default defineGuide({
  id: 'siirto-lahti',
  group: 'verkko',
  order: 20,
  tool: 'tanaan',
  toolProps: { verkko: 'lahti', sulake: 1 },
  related: ['siirtohinnat', 'siirto-elenia', 'tehomaksu', 'pyykinpesu', 'porssi-vai-kiintea'],
  sources: ['lahti', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-lahti-energia',
    nav: 'Lahti Energia',
    card: 'Lahti Energian sähköverkon yleis- ja yösiirto sekä pörssisähkön kokonaishinta Lahdessa.',
    title: 'Lahti Energia siirtohinta 2026: pörssisähkö siirron kanssa',
    description: 'Lahti Energian sähköverkon siirtohinnat 2026: yleissiirto, yösiirto ja tehomaksulliset vaihtoehdot. Pörssisähkön kokonaishinta Lahdessa vartti vartilta.',
    h1: 'Lahti Energia: pörssisähkön hinta Lahdessa',
    intro: 'Lahdessa yleissiirron perusmaksu on sama sulakkeesta riippumatta. Laskuri lisää Lahden siirron ja verot jokaiseen varttiin.',
    resume: (h) => {
      const v = V(h);
      return `Lahti Energian sähköverkko siirtää sähkön Lahden kaupunkialueella. Verkkopalveluhinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen. Yleissiirrossa perusmaksu on ${h.eur(v.p)} kuukaudessa ja siirtomaksu ${h.c(v.y.energia.kaikki!)} arvonlisäveron kanssa. Yösiirrossa perusmaksu on ${h.eur(v.pa)}, päiväsiirto kello 7–22 maksaa ${h.c(v.a.energia.paiva!)} ja yösiirto kello 22–7 ${h.c(v.a.energia.yo!)}. Lahti Energia tarjoaa lisäksi yleis- ja yösiirron tehomaksullisina versioina, joissa siirtomaksu on halvempi mutta maksetaan edellisen 12 kuukauden suurimman tunnin tehon mukaan; niitä ei ole laskurissa, koska maksu riippuu oman vuoden huipusta. Omakotitalon 5 000 kilowattitunnin siirto on Lahdessa ${v.t.sija5}. edullisin laskurin ${v.t.n} verkosta. Pörssisähkön kokonaishinta yleissiirrolla on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} keskimäärin ${h.c(v.t.paiva.ka)}. Laskuri on asetettu Lahden yleissiirtoon; vaihda yösiirtoon nähdäksesi kello 22 jälkeisen hinnan. Lahden ympäristön maaseudulla verkkoyhtiö on usein Elenia, jonka hinnat ovat omalla sivullaan. Postinumerohaku varmistaa yhtiön.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miten Lahti Energian tehomaksu lasketaan?', a: 'Lahti Energian mukaan tehomaksu perustuu tehoon, joka on edellisen 12 kuukauden aikana mitattu suurin tunnin keskiteho. Tehomaksullisissa tuotteissa siirtomaksu on halvempi. Yhtiö suosittelee niitä erityisesti sähkölämmittäjille, joiden kulutus on suurta ja tehon tarve tasaista. Ennen vaihtoa kustannukset kannattaa laskea omilla kulutustiedoilla. Laskurissa nämä tuotteet eivät ole mukana.' },
        { q: 'Kannattaako Lahdessa yösiirto?', a: `Yösiirron perusmaksu ${h.eur(v.pa)} on kaksinkertainen yleissiirron ${h.eur(v.p)} verrattuna, ja päiväsiirto ${h.c(v.a.energia.paiva!)} on kalliimpi kuin yleissiirto. Yöllä siirto maksaa ${h.c(v.a.energia.yo!)}. Laskelmamme mukaan yösiirto kannattaa talvipainotteisella kulutuksella noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattitunnista alkaen. Varaavassa lämmityksessä raja on alempi, koska suurempi osa kulutuksesta osuu yöhön.` },
        { q: 'Riippuuko Lahden perusmaksu sulakkeesta?', a: `Yleissiirrossa ei: perusmaksu on ${h.eur(v.p)} kuukaudessa sekä kerrostaloasunnossa että omakotitalossa. Yösiirrossakaan perusmaksu ei vaihtele tavallisilla kotitalouksien sulakkeilla. Liittymän ylläpidon perusmaksu on erikseen niille, joiden sähkönkäyttö on keskeytetty. Siksi suuremman pääsulakkeen hankinta esimerkiksi sähköauton latausta varten ei Lahdessa nosta yleissiirron kuukausimaksua, toisin kuin monessa maaseutuverkossa.` },
        { q: 'Mistä Lahti Energian hinnat tulevat laskuriin?', a: 'Hinnat on luettu Lahti Energian sähköverkon verkkopalvelumaksujen sivulta, jossa ne on ilmoitettu sekä arvonlisäveron kanssa että ilman. Laskuri käyttää arvonlisäverollisia hintoja. Tarkistusohjelma lataa sivun säännöllisesti ja varmistaa, että jokainen laskurin hinta löytyy sieltä. Jos hinnat muuttuvat, laskuri päivitetään. Lähde näkyy sivun lähdeluettelossa.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Lahden siirtohinnat</h2>
${hintaTaulukko(h, v.t)}
<p>Lahti Energian hinnastossa yleissiirron ja yösiirron perusmaksu ei riipu siitä, onko kyse kerrostaloasunnosta vai omakotitalosta. Tehomaksullisten versioiden lisäksi yhtiöllä on pienjännitteelle ja keskijännitteelle tehosiirtotuotteet yrityksille.</p>
<h2>Vuosikustannus Lahdessa</h2>
${vuosiTaulukko(h, v.t)}
<p>Pienellä kulutuksella yleissiirto on selvästi halvin, koska sen perusmaksu on pieni. Sähkölämmitteisessä talossa yösiirto alkaa kannattaa vasta suurella kulutuksella, sillä myös päiväsiirto on yösiirtotuotteessa kalliimpi kuin yleissiirrossa. Tehomaksulliset tuotteet voivat kannattaa, jos huipputeho pysyy tasaisena.</p>
<h2>Pörssisähkö Päijät-Hämeessä</h2>
<p>Lahden ympäristön maaseutualueilla verkkoyhtiö on usein ${h.a('siirto-elenia', 'Elenia')}, jonka perusmaksut ovat selvästi suurempia. Lahdessa siirto on kohtuullinen, joten pörssisähkön ajoituksella on merkitystä. Esimerkiksi ${h.a('pyykinpesu', 'pyykinpesun')} siirtäminen halvalle tunnille näkyy suoraan kokonaishinnassa.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-lahti-energia',
    nav: 'Lahti Energia',
    card: 'Lahti Energia’s general and night transfer and the all-in spot electricity price in Lahti.',
    title: 'Lahti Energia Transfer Fee 2026: Spot Price With Transfer',
    description: 'Lahti Energia network transfer fees 2026: general and night transfer plus power-fee options. See the all-in spot electricity price in Lahti by quarter today.',
    h1: 'Lahti Energia: the spot electricity price in Lahti',
    intro: 'In Lahti the general transfer basic fee is the same whatever the fuse. The calculator adds Lahti’s transfer and taxes to every quarter hour.',
    resume: (h) => {
      const v = V(h);
      return `Lahti Energia’s network distributes electricity in the city of Lahti. Its price list applies from ${h.date(v.t.v.voimassa!)}. On general transfer the basic fee is ${h.eur(v.p)} a month and the transfer fee ${h.c(v.y.energia.kaikki!)} including VAT. On night transfer the basic fee is ${h.eur(v.pa)}, day transfer (07:00–22:00) costs ${h.c(v.a.energia.paiva!)} and night transfer (22:00–07:00) ${h.c(v.a.energia.yo!)}. Lahti Energia also offers both products in a power-fee version, with a cheaper transfer fee but a charge based on the highest hourly power of the previous 12 months; those are not in the calculator because the fee depends on your own annual peak. For a house using 5,000 kilowatt-hours, Lahti ranks ${v.t.sija5} of the calculator’s ${v.t.n} networks from cheapest. The all-in spot price on general transfer averages ${v.t.arvio ? `an estimated ${h.c(v.t.paiva.ka)}` : `${h.c(v.t.paiva.ka)} today`}. The calculator is preset to Lahti’s general transfer; switch to night transfer to see the price after 22:00.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'How is Lahti Energia’s power fee calculated?', a: 'According to Lahti Energia, the power fee is based on the highest hourly average power measured over the previous 12 months. Power-fee products have a cheaper transfer fee, and the company recommends them especially for electric heating with high and steady demand. Work out the cost with your own consumption data before switching.' },
        { q: 'Is night transfer worth it in Lahti?', a: `Night transfer’s basic fee of ${h.eur(v.pa)} is double general transfer’s ${h.eur(v.p)}, and its day rate of ${h.c(v.a.energia.paiva!)} is dearer than general transfer. At night it costs ${h.c(v.a.energia.yo!)}. By our calculation night transfer pays from about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours of winter-heavy use.` },
        { q: 'Does Lahti’s basic fee depend on the fuse?', a: `Not on general transfer: the basic fee is ${h.eur(v.p)} a month for a flat or a house alike. Night transfer’s basic fee does not vary across normal household fuses either. A separate maintenance basic fee applies to connections where use has been suspended.` },
        { q: 'Where do the calculator’s Lahti Energia prices come from?', a: 'They were read from Lahti Energia’s network service fee page, which lists them with and without VAT. The calculator uses the VAT-inclusive prices. A check script downloads the page regularly and confirms that every price used by the calculator appears on it.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Lahti’s transfer prices</h2>
${hintaTaulukko(h, v.t)}
<p>On Lahti Energia’s price list the general and night transfer basic fees do not depend on whether the home is a flat or a house. Besides the power-fee versions, the company has low- and medium-voltage power products for businesses.</p>
<h2>Annual cost in Lahti</h2>
${vuosiTaulukko(h, v.t)}
<p>At low consumption general transfer is clearly cheapest because its basic fee is small. In an electrically heated house night transfer only starts to pay at high consumption, since its day rate is also dearer than general transfer. Power-fee products can pay if the peak stays steady.</p>
<h2>Spot electricity in Päijät-Häme</h2>
<p>In the rural areas around Lahti the operator is often ${h.a('siirto-elenia', 'Elenia')}, whose basic fees are clearly higher. In Lahti transfer is moderate, so timing spot-priced use matters. Moving ${h.a('pyykinpesu', 'the washing')} to a cheap hour, for instance, shows directly in the all-in price.</p>`;
    },
  },
});
