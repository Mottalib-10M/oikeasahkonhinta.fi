import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

const V = (h: Helpers) => {
  const helen = h.M.tuote(h.M.verkko('helen')!, 'aika')!, kuopio = h.M.tuote(h.M.verkko('kuopio')!, 'aika')!;
  const k = (t: typeof helen, kw: number) => t.teho!.eurKwKk * kw * 12;
  return { helen, kuopio, k };
};

export default defineGuide({
  id: 'tehomaksu',
  group: 'opas',
  order: 60,
  mini: 'tehomaksu',
  related: ['siirto-helen', 'siirto-kuopio', 'siirtomaksu', 'sahkoauton-lataus', 'saunan-hinta'],
  sources: ['helen', 'kuopio', 'lahti', 'motivaJousto', 'motivaSiirto'],
  fi: {
    slug: 'tehomaksu',
    nav: 'Tehomaksu',
    card: 'Mikä sähkön tehomaksu on, miten se lasketaan Helsingissä ja Kuopiossa ja miten sitä pienennetään.',
    title: 'Tehomaksu 2026: miten sähkön tehomaksu lasketaan kotona',
    description: 'Sähkön tehomaksu 2026: miten tehomaksu lasketaan huipputehon mukaan, mitä se maksaa Helenin ja Kuopion aikasiirrossa ja miten huippua pienennetään kotona.',
    h1: 'Tehomaksu: kun huipputeho maksaa',
    intro: 'Tehomaksu perustuu siihen, kuinka paljon sähköä käytät samaan aikaan. Se palkitsee kuormien porrastamisesta.',
    resume: (h) => {
      const v = V(h);
      return `Tehomaksu on verkkopalvelumaksun osa, joka määräytyy käyttöpaikan suurimman tehon eli samanaikaisen sähkönkäytön mukaan, ei pelkän kulutetun energian. Laskurin verkoista kotitalouksien tuotteissa tehomaksu on Helen Sähköverkon ja Kuopion Sähköverkon aikasiirrossa. Helenillä maksu on ${h.num(v.helen.teho!.eurKwKk, 2)} euroa kilowatilta kuukaudessa, ja sen peruste on kuukauden kolmanneksi suurin tunnin keskiteho; yöajan tehosta otetaan huomioon 80 prosenttia. Kuopiossa maksu on ${h.num(v.kuopio.teho!.eurKwKk, 2)} euroa kilowatilta kuukaudessa laskutuskuukauden korkeimman tunnin mukaan. Viiden kilowatin huipulla tehomaksu on Helenillä noin ${h.eur(v.k(v.helen, 5), 0)} ja Kuopiossa ${h.eur(v.k(v.kuopio, 5), 0)} vuodessa. Lahti Energian tehomaksullisissa tuotteissa peruste on edellisen 12 kuukauden suurin tunti. Huippua pienennetään porrastamalla suuret laitteet eri tunneille: sähköauton lataus, sähkökiuas, lämminvesivaraaja ja suora sähkölämmitys ovat tyypillisimmät huipun nostajat. Alla olevalla laskurilla näet, paljonko tehomaksu maksaa kuukaudessa ja vuodessa omalla huipputehollasi, ja kuinka paljon jokainen pienennetty kilowatti säästää vuodessa.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Mitä tunnin keskiteho tarkoittaa?', a: 'Tunnin keskiteho on tunnin aikana kulutettu energia kilowattitunteina jaettuna yhdellä tunnilla. Jos käytät tunnin aikana 6 kilowattituntia, keskiteho on 6 kilowattia. Lyhyt huippu, esimerkiksi vedenkeittimen käynnistys, vaikuttaa siis vain vähän, mutta tunnin kestävä suuri kuorma, kuten kiuas tai auton lataus, näkyy kokonaan.' },
        { q: 'Miksi Helen laskee kolmanneksi suurimman tunnin?', a: `Helenin aikasiirrossa peruste on kuukauden kolmanneksi suurin tunnin keskiteho, joten yksittäinen poikkeuksellinen tunti ei ratkaise maksua. Lisäksi yöllä mitatusta tehosta lasketaan 80 prosenttia, mikä kannustaa siirtämään suuria kuormia yöhön. Hinta on ${h.num(v.helen.teho!.eurKwKk, 2)} euroa kilowatilta kuukaudessa. Maksu lasketaan joka kuukausi uudelleen.` },
        { q: 'Onko minulla tehomaksu?', a: 'Tarkista verkkoyhtiösi hinnasto ja oma siirtotuotteesi. Laskurin verkoista kotitalouksien perustuotteissa tehomaksu on Helenin ja Kuopion aikasiirrossa sekä Lahti Energian erillisissä tehoversioissa. Yleissiirrossa ei näissä verkoissa ole tehomaksua. Suurempien kohteiden tehosiirtotuotteissa tehomaksu on käytössä lähes kaikissa verkoissa. Laskusta näet tehomaksun omana rivinään.' },
        { q: 'Kannattaako tehomaksullinen tuote?', a: 'Se voi kannattaa, jos kulutus on suurta mutta tasaista, koska tehomaksullisissa tuotteissa siirtomaksu tai perusmaksu on usein pienempi. Jos kotona käytetään usein monta suurta laitetta yhtä aikaa, tehomaksu voi nostaa kustannuksia. Laske molemmat vaihtoehdot omilla kulutustiedoillasi, jotka näet verkkoyhtiön palvelusta tunneittain.' },
      { q: 'Näkyykö tehomaksu sähkölaskussa?', a: 'Näkyy. Tehomaksu on verkkoyhtiön laskulla oma rivinsä, ja siinä kerrotaan laskutettu teho kilowatteina ja hinta kilowatilta. Verkkoyhtiön sähköisessä palvelussa näet tunnittaisen kulutuksesi, jonka perusteella voit tarkistaa, mikä tunti määräsi laskutetun tehon. Jos teho vaikuttaa liian suurelta, tunnin kulutustiedot kertovat syyn.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Tehomaksu laskurin verkoissa</h2>
${h.table(['Verkko ja tuote', 'Tehomaksu', 'Peruste', '5 kW vuodessa', '10 kW vuodessa'], [
        ['Helen, aikasiirto', `${h.num(v.helen.teho!.eurKwKk, 2)} €/kW/kk`, v.helen.teho!.fi, h.eur(v.k(v.helen, 5), 0), h.eur(v.k(v.helen, 10), 0)],
        ['Kuopion Sähköverkko, aikasiirto', `${h.num(v.kuopio.teho!.eurKwKk, 2)} €/kW/kk`, v.kuopio.teho!.fi, h.eur(v.k(v.kuopio, 5), 0), h.eur(v.k(v.kuopio, 10), 0)],
      ], 'Hinnat verkkoyhtiöiden hinnastoista, sis. alv 25,5 %.', ['l', 'r', 'l', 'r', 'r'])}
<p>Lahti Energialla on lisäksi yleis- ja yösiirron tehomaksulliset versiot, joissa ${h.src('lahti', 'yhtiön mukaan')} tehomaksu perustuu edellisen 12 kuukauden suurimpaan tunnin keskitehoon. Niitä ei ole laskurissa, koska maksu riippuu koko vuoden huipusta.</p>
<h2>Mikä nostaa huippua</h2>
<ul>
<li><strong>Sähkökiuas</strong>: 6–9 kilowatin kiuas nostaa tunnin keskitehoa lähes kiukaan tehon verran koko lämmityksen ajan. Ks. ${h.a('saunan-hinta', 'saunan hinta')}.</li>
<li><strong>Sähköauton lataus</strong>: kolmivaiheinen 16 ampeerin laturi lataa 11 kilowatin teholla. Ks. ${h.a('sahkoauton-lataus', 'sähköauton lataus')}.</li>
<li><strong>Lämminvesivaraaja</strong>: tyypillisesti muutama kilowatti, usein yöllä.</li>
<li><strong>Suora sähkölämmitys</strong>: pakkasella kaikki patterit voivat olla päällä samaan aikaan.</li>
</ul>
<p>Kun nämä osuvat samalle tunnille, huippu voi nousta yli 20 kilowattiin. Porrastamalla ne eri tunneille huippu voi pysyä alle puolessa.</p>
<h2>Miten huippua pienennetään</h2>
<ol>
<li>Lataa sähköautoa pienemmällä teholla pidempään tai käytä laturin kuormanhallintaa, joka pienentää latausta muiden laitteiden ollessa päällä.</li>
<li>Älä lämmitä saunaa samaan aikaan, kun auto latautuu tai lämminvesivaraaja lämpenee.</li>
<li>Siirrä suuria kuormia yöhön, jos tuotteessasi yötehosta lasketaan vain osa, kuten Helenillä.</li>
<li>Seuraa tunnittaista kulutustasi verkkoyhtiön palvelussa, niin näet, mitkä tunnit ratkaisevat maksun.</li>
</ol>
<p>${h.src('motivaJousto', 'Motivan kulutusjousto-ohje')} kertoo, miten kodin automaatio voi ohjata kuormia. Huomaa ristiriita pörssisähkön kanssa: halvimpaan varttiin keskitetty kulutus voi nostaa huippua. Paras ratkaisu jakaa kuorman useammalle halvalle tunnille.</p>
<h2>Miksi tehomaksuja käytetään</h2>
<p>Sähköverkko mitoitetaan suurimman samanaikaisen kulutuksen mukaan, ei vuoden energian. Tehomaksu kohdistaa verkon kustannuksia sinne, missä tehoa tarvitaan, ja kannustaa tasaamaan kulutusta. ${h.src('motivaSiirto', 'Motivan siirtomaksusivulla')} kerrotaan verkkopalvelumaksun rakenteesta. Vertaa verkkoja ${h.a('siirtohinnat', 'siirtohintojen vertailussa')}, jossa voit syöttää oman huipputehosi.</p>
<h2>Esimerkki: tavallinen talvi-ilta</h2>
<p>Ajatellaan sähkölämmitteistä omakotitaloa talvi-iltana. Patterit käyvät, sähköauto kytketään laturiin töistä tultua, ja illalla lämmitetään sauna. Jos nämä osuvat samalle tunnille, tunnin keskiteho voi nousta moninkertaiseksi tavalliseen tuntiin verrattuna. Tehomaksullisessa tuotteessa yksi tällainen ilta kuukaudessa ei välttämättä ratkaise maksua, jos peruste on kolmanneksi suurin tunti, mutta toistuvina se nostaa huipun pysyvästi.</p>
<p>Kun sähköauton lataus siirretään yöhön, sauna lämmitetään ennen kuin auto kytketään ja lämminvesivaraaja ajastetaan aamuyöhön, illan suurin tunti pienenee huomattavasti. Kuukauden huippu määräytyy silloin lämmityksen eikä usean laitteen yhteiskäytön mukaan. Tehomaksussa jokainen pienennetty kilowatti säästää vuodessa kaksitoista kertaa kuukausihinnan, joten muutaman kilowatin ero tuntuu vuoden laskussa.</p>
<h2>Kuormanhallinta automaattisesti</h2>
<p>Monessa sähköauton laturissa on kuormanhallinta, joka mittaa talon kokonaiskulutusta ja pienentää lataustehoa, kun muut laitteet kuluttavat paljon. Kodin automaatiojärjestelmä voi tehdä saman lämminvesivaraajalle ja lämmitykselle. Tällainen ohjaus pitää huipun pienenä ilman, että asukkaan tarvitsee muistaa porrastaa laitteita. Se on hyödyllinen myös sulakkeen kannalta, koska liian suuri samanaikainen kuorma voi laukaista pääsulakkeen.</p>
<h2>Tehomaksu ja pörssihinta yhdessä</h2>
<p>Pörssisähkön käyttäjä haluaa käyttää sähköä halvimpina tunteina, tehomaksun maksaja haluaa välttää suuria tunteja. Molemmat tavoitteet täyttyvät, kun suuri kulutus jaetaan useammalle halvalle tunnille sen sijaan, että kaikki ajetaan yhteen halvimpaan tuntiin. Esimerkiksi sähköauton voi ladata pienemmällä teholla koko yön ajan. Etusivun laskuri näyttää halvimman jakson valitsemallesi kestolle, joten voit valita pidemmän jakson ja pienemmän tehon.</p>
<h2>Tehomaksu tulevaisuudessa</h2>
<p>Sähköverkon kuormitus kasvaa, kun yhä useampi kotitalous lataa sähköautoa ja lämmittää lämpöpumpulla. Verkkoyhtiöt ovat ottaneet käyttöön tehoon perustuvia tuotteita, jotta verkon kustannukset kohdistuisivat niille, jotka tarvitsevat suurta tehoa, ja jotta kuormia tasattaisiin. Laskurin verkoista tehomaksu on vielä harvinainen kotitalouksien perustuotteissa, mutta tehomaksullisia vaihtoehtoja on jo usealla yhtiöllä.</p>
<p>Jos verkkoyhtiösi tarjoaa tehomaksullista tuotetta, laske sen kannattavuus omilla tunnittaisilla kulutustiedoillasi. Tasaisesti kuluttava talo voi hyötyä halvemmasta siirtomaksusta, mutta talo, jossa sauna, auto ja lämmitys käyvät usein yhtä aikaa, maksaa tehomaksussa enemmän. Kuormanhallinta ja kulutuksen porrastaminen ovat paras tapa pitää tehomaksu pienenä, ja ne pienentävät samalla riskiä pääsulakkeen laukeamisesta.</p>
<h2>Tehomaksu ja aurinkosähkö</h2>
<p>Aurinkopaneelit eivät yleensä pienennä tehomaksua talvella, koska talvi-iltojen huippukulutuksen aikaan paneelit eivät tuota. Kesällä oma tuotanto voi pienentää päiväajan tehoa, mutta tehomaksun peruste määräytyy usein kuukauden suurimmista tunneista, jotka osuvat iltaan. Akku voi tasata huippuja, jos sen ohjaus on asetettu purkamaan sähköä juuri suurimman kulutuksen aikaan.</p>
<p>Tämän sivuston laskurit käyttävät samoja virallisia lähteitä: pörssihinnat Suomen tarjousalueelta, siirtohinnat verkkoyhtiöiden omista hinnastoista ja verot Verohallinnon taulukosta. Kaikki laskenta tapahtuu selaimessasi, eikä syöttämiäsi tietoja lähetetä minnekään. Hinnat päivittyvät joka päivä automaattisesti, ja jos päivän pörssihintoja ei ole saatavilla, laskuri näyttää selvästi merkityn keskihinta-arvion. Lisätietoa laskentatavasta, lähteistä ja rajoituksista on menetelmäsivulla.</p>`;
    },
  },
  en: {
    slug: 'power-fee-finland',
    nav: 'Power fee',
    card: 'What the Finnish electricity power fee is, how Helsinki and Kuopio calculate it and how to cut it.',
    title: 'Electricity Power Fee Finland 2026: How It Is Calculated',
    description: 'Finnish electricity power fee 2026: how the fee follows your peak power, what it costs on Helen’s and Kuopio’s time-of-day transfer and how to lower your peak.',
    h1: 'The power fee: when your peak costs money',
    intro: 'A power fee is based on how much electricity you use at the same time. It rewards spreading loads out.',
    resume: (h) => {
      const v = V(h);
      return `A power fee is the part of the network fee set by a site’s highest power, meaning simultaneous use, not just the energy consumed. Among the calculator’s networks, household products with a power fee are Helen Sähköverkko’s and Kuopion Sähköverkko’s time-of-day transfer. Helen charges ${h.num(v.helen.teho!.eurKwKk, 2)} euros per kilowatt per month, based on the month’s third-highest hourly average power, with 80% of night-time power counted. Kuopio charges ${h.num(v.kuopio.teho!.eurKwKk, 2)} euros per kilowatt per month on the billing month’s highest hour. At a 5 kW peak the power fee is about ${h.eur(v.k(v.helen, 5), 0)} a year with Helen and ${h.eur(v.k(v.kuopio, 5), 0)} in Kuopio. Lahti Energia’s power-fee products use the highest hour of the previous 12 months. You lower the peak by staggering large appliances across hours: car charging, the sauna stove, the water heater and direct electric heating are the usual culprits.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'What does hourly average power mean?', a: 'Hourly average power is the energy used in an hour, in kilowatt-hours, divided by one hour. Use 6 kWh in an hour and the average is 6 kW. A brief spike, such as a kettle starting, barely matters, but an hour-long large load such as the sauna or car charging counts in full.' },
        { q: 'Why does Helen use the third-highest hour?', a: `On Helen’s time-of-day transfer the basis is the month’s third-highest hourly average power, so one exceptional hour does not decide the fee. Night-time power is also counted at 80%, encouraging large loads to move to the night. The rate is ${h.num(v.helen.teho!.eurKwKk, 2)} euros per kilowatt per month.` },
        { q: 'Do I have a power fee?', a: 'Check your operator’s price list and your transfer product. Among the calculator’s networks, household products with a power fee are Helen’s and Kuopio’s time-of-day transfer and Lahti Energia’s separate power versions. General transfer has no power fee in these networks. Power-based products for larger sites use one almost everywhere.' },
        { q: 'Is a power-fee product worth it?', a: 'It can be if use is high but steady, since power-fee products often have a lower transfer or basic fee. If several large appliances often run together at home, the power fee can raise costs. Work out both options with your own consumption data, available hour by hour from your operator.' },
      { q: 'Does the power fee show on my bill?', a: 'Yes. It is a separate line on the network bill, showing the billed power in kilowatts and the price per kilowatt. The operator’s online service shows your hourly use, so you can check which hour set the billed power. If it looks too high, the hourly data shows why.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Power fees in the calculator’s networks</h2>
${h.table(['Network and product', 'Power fee', 'Basis', '5 kW per year', '10 kW per year'], [
        ['Helen, time-of-day', `${h.num(v.helen.teho!.eurKwKk, 2)} €/kW/month`, v.helen.teho!.en, h.eur(v.k(v.helen, 5), 0), h.eur(v.k(v.helen, 10), 0)],
        ['Kuopion Sähköverkko, time-of-day', `${h.num(v.kuopio.teho!.eurKwKk, 2)} €/kW/month`, v.kuopio.teho!.en, h.eur(v.k(v.kuopio, 5), 0), h.eur(v.k(v.kuopio, 10), 0)],
      ], 'Prices from the operators’ price lists, incl. 25.5% VAT.', ['l', 'r', 'l', 'r', 'r'])}
<p>Lahti Energia also has power-fee versions of general and night transfer, where ${h.src('lahti', 'the company says')} the fee follows the highest hourly average power of the previous 12 months. They are not in the calculator because the fee depends on the whole year’s peak.</p>
<h2>What drives the peak up</h2>
<ul>
<li><strong>Sauna stove</strong>: a 6–9 kW stove lifts the hourly average almost by its full power while heating. See ${h.a('saunan-hinta', 'sauna cost')}.</li>
<li><strong>Car charging</strong>: a three-phase 16 A charger charges at 11 kW. See ${h.a('sahkoauton-lataus', 'EV charging')}.</li>
<li><strong>Water heater</strong>: typically a few kilowatts, often at night.</li>
<li><strong>Direct electric heating</strong>: in frost all radiators may be on at once.</li>
</ul>
<p>When these land in the same hour the peak can exceed 20 kW. Staggering them across hours can keep it under half that.</p>
<h2>How to lower the peak</h2>
<ol>
<li>Charge the car at lower power for longer, or use the charger’s load management, which cuts charging while other appliances run.</li>
<li>Do not heat the sauna while the car charges or the water heater warms up.</li>
<li>Move large loads to the night if your product counts only part of night-time power, as Helen’s does.</li>
<li>Follow your hourly use in the operator’s portal to see which hours set the fee.</li>
</ol>
<p>${h.src('motivaJousto', 'Motiva’s demand-flexibility guide')} explains how home automation can steer loads. Note the tension with spot pricing: concentrating use in the cheapest quarter can raise the peak. The best approach spreads the load over several cheap hours.</p>
<h2>Why power fees are used</h2>
<p>A grid is sized for the largest simultaneous demand, not the year’s energy. A power fee allocates network costs where power is needed and encourages smoothing use. ${h.src('motivaSiirto', 'Motiva’s transfer fee page')} explains the structure of network fees. Compare networks in the ${h.a('siirtohinnat', 'transfer fee comparison')}, where you can enter your own peak power.</p>
<h2>Example: an ordinary winter evening</h2>
<p>Picture an electrically heated house on a winter evening. Radiators run, the car goes on charge after work, and the sauna is heated later. If these land in the same hour, the hourly average can be several times a normal hour. With a third-highest-hour basis one such evening may not set the fee, but repeated evenings lift the peak for good. Charging overnight, heating the sauna before plugging in the car and timing the water heater for the early hours shrink the evening peak, and every kilowatt cut saves twelve times the monthly rate a year.</p>
<h2>Automatic load management</h2>
<p>Many car chargers measure the house’s total use and throttle charging when other appliances draw a lot; home automation can do the same for the water heater and heating. That keeps the peak down without anyone remembering to stagger appliances, and it also protects the main fuse from tripping.</p>
<p>Check your contract before switching to a power-fee product, and use the hourly data in your operator’s portal to estimate your typical monthly peak.</p>`;
    },
  },
});
