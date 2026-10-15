import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

const V = (h: Helpers) => {
  const { P, M } = h;
  const ennen = P.vero.aiempi_I_yhteensa_c * (1 + P.vero.alv);
  const nyt = M.VERO_C;
  const ero = nyt - ennen;
  const k = [2000, 5000, 18000].map((kwh) => ({ kwh, nyt: (kwh * nyt) / 100, ennen: (kwh * ennen) / 100 }));
  const ii = P.vero.sahkovero_II_c + P.vero.huoltovarmuus_c;
  return { ennen, nyt, ero, k, ii, iiAlv: ii * (1 + P.vero.alv) };
};

export default defineGuide({
  id: 'sahkovero',
  group: 'opas',
  order: 10,
  mini: 'sahkovero',
  related: ['siirtomaksu', 'sahkolasku', 'siirtohinnat', 'negatiivinen-hinta', 'porssi-vai-kiintea'],
  sources: ['veroTaulukko', 'veroSahko', 'veroAlv', 'finlexSahkovero'],
  fi: {
    slug: 'sahkovero',
    nav: 'Sähkövero',
    card: 'Sähkövero ja huoltovarmuusmaksu 2026, veroluokat ja paljonko veroa maksat vuodessa.',
    title: 'Sähkövero 2026: snt/kWh, veroluokat ja huoltovarmuusmaksu',
    description: 'Sähkövero 2026: veroluokka I 2,24 snt ja huoltovarmuusmaksu 0,085 snt kWh:lta ilman alv:tä 1.4.2026 alkaen. Laske, paljonko maksat sähköveroa vuodessa.',
    h1: 'Sähkövero 2026: paljonko maksat ja miksi',
    intro: 'Sähkövero on jokaisessa kilowattitunnissa sopimuksesta riippumatta. Huhtikuun 2026 alusta se nousi, kun huoltovarmuusmaksu kasvoi.',
    resume: (h) => {
      const v = V(h);
      return `Sähkövero on valmistevero, jonka verkkoyhtiö laskuttaa jokaisesta siirretystä kilowattitunnista ja tilittää valtiolle. Verohallinnon verotaulukon mukaan kotitalouksien veroluokassa I sähkövero on ${h.date(h.P.vero.voimassa)} alkaen ${h.num(h.P.vero.sahkovero_I_c, 2)} senttiä ja huoltovarmuusmaksu ${h.num(h.P.vero.huoltovarmuus_c, 3)} senttiä kilowattitunnilta ilman arvonlisäveroa, yhteensä ${h.num(h.M.VERO_VEROTON, 3)} senttiä. Arvonlisäveron 25,5 prosentin kanssa kuluttaja maksaa ${h.c(v.nyt, 4)} jokaisesta kilowattitunnista. Ennen huhtikuuta huoltovarmuusmaksu oli ${h.num(h.P.vero.aiempi_huoltovarmuus_c, 3)} senttiä, joten vero nousi ${h.c(v.ero, 3)} kilowattitunnilta. Kerrostaloasunnossa, joka kuluttaa 2 000 kilowattituntia vuodessa, sähkövero on noin ${h.eur(v.k[0].nyt, 0)} vuodessa, ja sähkölämmitteisessä 18 000 kilowattitunnin talossa ${h.eur(v.k[2].nyt, 0)}. Vero on sama pörssi- ja kiinteähintaisessa sopimuksessa sekä kaikkina vuorokauden aikoina, joten kulutuksen ajoittaminen ei vaikuta siihen. Alla olevalla laskurilla näet, paljonko sähköveroa kertyy omalla vuosikulutuksellasi, ja toisella laskurilla, paljonko siirto maksaa omassa verkossasi. Molemmat käyttävät samoja virallisia lukuja kuin sivuston muut laskurit, ja ne päivittyvät, kun verotaulukko muuttuu.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Kuka laskuttaa sähköveron?', a: 'Sähköveron laskuttaa verkkoyhtiö, joka siirtää sähkön käyttöpaikalle, ja se tilittää veron valtiolle. Siksi sähkövero näkyy siirtolaskulla eikä sähkönmyyjän laskulla. Jos sinulla on yhteislasku, myyjä laskuttaa myös verkkopalvelun ja veron verkkoyhtiön puolesta, mutta veron määrä on sama. Veron määrä ei riipu siitä, kumpi yhtiö laskun lähettää.' },
        { q: 'Miksi sähkövero nousi huhtikuussa 2026?', a: `Verohallinnon taulukon mukaan huoltovarmuusmaksu nousi ${h.date(h.P.vero.voimassa)} alkaen ${h.num(h.P.vero.aiempi_huoltovarmuus_c, 3)} sentistä ${h.num(h.P.vero.huoltovarmuus_c, 3)} senttiin kilowattitunnilta, kun taas varsinainen sähkövero pysyi ${h.num(h.P.vero.sahkovero_I_c, 2)} sentissä. Huoltovarmuusmaksulla rahoitetaan Suomen huoltovarmuutta poikkeusolojen varalle. Muutos näkyy jokaisessa kilowattitunnissa, ja se laskutetaan verkkoyhtiön laskulla. Kotitaloudelle muutos on vuodessa muutamia euroja.` },
        { q: 'Kuka voi maksaa sähköveroa alemman veroluokan mukaan?', a: `Veroluokka II on Verohallinnon mukaan tarkoitettu muun muassa teollisuudelle, ammattimaiselle kasvihuoneviljelylle sekä lämpöpumpuille, sähkökattiloille ja geotermisten lämpölaitosten kiertovesipumpuille. Datakeskukset kuuluvat luokkaan I ${h.date(h.P.vero.datakeskukset_I_alkaen)} alkaen. Kotitaloudet maksavat aina luokan I veroa, ${h.c(v.nyt, 4)} kilowattitunnilta. Luokkaan II kuuluminen edellyttää kirjallista vakuutusta verkkoyhtiölle.` },
        { q: 'Maksetaanko sähköverosta arvonlisäveroa?', a: `Kyllä. Arvonlisävero 25,5 prosenttia lasketaan myös sähköveron ja huoltovarmuusmaksun päälle. Siksi ${h.num(h.M.VERO_VEROTON, 3)} sentin vero maksaa kuluttajalle ${h.c(v.nyt, 4)}. Verkkoyhtiöiden hinnastoissa näkyy usein molemmat luvut, ja osa yhtiöistä ilmoittaa myös siirtomaksun ja veron yhteenlasketun hinnan. Laskuri käyttää verollista lukua. Vero on sama kaikilla kuluttajilla.` },
        { q: 'Vaikuttaako sähkövero pörssisähkön halvimpaan tuntiin?', a: 'Ei. Sähkövero on sama jokaisena tuntina ja vartissa, joten se ei muuta sitä, mikä tunti on halvin. Se kuitenkin pienentää suhteellista eroa halvan ja kalliin tunnin välillä, koska kiinteä vero lisätään kaikkiin hintoihin. Negatiivisella pörssihinnalla vero pitää kokonaishinnan useimmiten plussalla.' },
      { q: 'Onko sähkövero sama koko Suomessa?', a: 'On. Sähkövero ja huoltovarmuusmaksu ovat samat kaikkialla Suomessa, eikä niihin vaikuta verkkoyhtiö, sähkösopimus tai kellonaika. Kotitalous maksaa aina veroluokan I mukaista veroa. Siirtomaksu sen sijaan vaihtelee verkkoyhtiöittäin, joten sähkölaskun loppusumma eroaa asuinpaikan mukaan, vaikka vero on sama. Vero näkyy siirtolaskulla.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Sähköveron määrä 2026</h2>
${h.table(['Veroluokka', 'Sähkövero', 'Huoltovarmuusmaksu', 'Yhteensä ilman alv:tä', 'Yhteensä alv:n kanssa'], [
        ['I (kotitaloudet, palvelut)', h.c(h.P.vero.sahkovero_I_c, 3), h.c(h.P.vero.huoltovarmuus_c, 3), h.c(h.M.VERO_VEROTON, 3), h.c(v.nyt, 4)],
        ['II (teollisuus ym.)', h.c(h.P.vero.sahkovero_II_c, 3), h.c(h.P.vero.huoltovarmuus_c, 3), h.c(v.ii, 3), h.c(v.iiAlv, 4)],
      ], `Verohallinto, verotaulukko ${h.date(h.P.vero.voimassa)}–${h.date(h.P.valid_to)}.`, ['l', 'r', 'r', 'r', 'r'])}
<p>Sähkövero muodostuu kahdesta osasta, varsinaisesta sähköverosta eli energiaverosta ja huoltovarmuusmaksusta. Molemmat määrätään ${h.src('finlexSahkovero', 'sähkön ja eräiden polttoaineiden valmisteverosta annetussa laissa')}, ja Verohallinto julkaisee voimassa olevat määrät ${h.src('veroTaulukko', 'verotaulukossaan')}. Arvonlisäveron yleinen verokanta on ${h.src('veroAlv', 'Verohallinnon mukaan')} 25,5 prosenttia.</p>
<h2>Paljonko veroa maksat vuodessa</h2>
${h.table(['Kulutus vuodessa', 'Ennen 1.4.2026', '1.4.2026 alkaen', 'Muutos'], v.k.map((x) => [`${h.num(x.kwh)} kWh`, h.eur(x.ennen, 2), h.eur(x.nyt, 2), h.eur(x.nyt - x.ennen, 2)]), 'Sähkövero ja huoltovarmuusmaksu alv:n kanssa koko vuoden kulutukselle.', ['l', 'r', 'r', 'r'])}
<p>Huhtikuun muutos on kotitaloudelle pieni: kerrostaloasunnossa se on muutama kymmenen senttiä vuodessa, sähkölämmitteisessä talossa joitakin euroja. Sähkövero on silti merkittävä osa laskua. Kun pörssihinta on matala, sähkövero voi olla suurempi kuin energian hinta.</p>
<!--mini:siirtomaksu-->
<h2>Sähkövero kokonaishinnassa</h2>
<p>Sähkön kokonaishinnassa on neljä osaa: energia, myyjän marginaali, siirtomaksu ja sähkövero. Vero on niistä ainoa, joka on kaikkialla Suomessa täsmälleen sama. Siirtomaksu vaihtelee verkkoyhtiöittäin ja energian hinta tunneittain, mutta veroluokan I kuluttaja maksaa veroa ${h.c(v.nyt, 4)} jokaisesta kilowattitunnista asuinpaikasta ja sopimuksesta riippumatta.</p>
<p>Esimerkiksi päivänä, jolloin pörssihinta on kaksi senttiä kilowattitunnilta, sähkövero on lähes puolitoistakertainen energian hintaan nähden. Kalliina talvipäivänä, kun pörssihinta on kymmeniä senttejä, veron osuus kokonaishinnasta on pieni. Etusivun laskuri näyttää veron erikseen jokaisessa vartissa.</p>
<h2>Miksi sähkövero on laskulla verkkoyhtiön kohdalla</h2>
<p>Laki määrää veron maksajaksi sähköverkonhaltijan, joka luovuttaa sähkön kulutukseen. Verkkoyhtiö tietää, paljonko sähköä kukin käyttöpaikka on käyttänyt, ja se laskuttaa veron siirron yhteydessä. Siksi sähkönmyyjän vaihtaminen ei vaikuta veroon, ja vero näkyy siirtolaskussa omana rivinään tai sisällytettynä sähköverolliseen siirtohintaan.</p>
<p>Jos verkkoyhtiösi hinnastossa on sähköverollinen siirtomaksu, se on siirtomaksun ja sähköveron summa. Esimerkiksi Elenian, Tampereen Sähköverkon ja Savon Voiman hinnastoissa tällainen yhdistetty hinta on valmiiksi laskettu. Sähkökatkot tai verkkoyhtiön vaihtuminen eivät vaikuta veron määrään.</p>
<h2>Sähkövero ja oma sähköntuotanto</h2>
<p>Verohallinnon mukaan verotonta on muun muassa sähkö, jonka pientuottaja tuottaa ja käyttää itse, kun tuotanto ei ylitä laissa säädettyä rajaa. Aurinkopaneeleilla tuotettu ja omassa taloudessa samalla hetkellä kulutettu sähkö ei siksi kulje verkon kautta, eikä siitä makseta sähköveroa eikä siirtomaksua. Verkkoon myyty ylijäämäsähkö ei myöskään ole kuluttajalle verotettavaa sähkönkäyttöä. Tämän vuoksi oman tuotannon arvo on suurempi kuin pelkkä pörssihinta.</p>
<h2>Muutokset tulevina vuosina</h2>
<p>Sähköveron määrä voi muuttua valtion talousarvion yhteydessä. Tarkista voimassa oleva määrä aina ${h.src('veroSahko', 'Verohallinnon sähköverosivulta')}. Tämä sivusto päivittää veron laskureihin heti, kun uusi verotaulukko on julkaistu, ja kaikki sivut käyttävät samaa arvoa. Laske koko sähkölaskusi ${h.a('sahkolasku', 'sähkölaskulaskurilla')} ja katso, miten vero suhteutuu ${h.a('siirtomaksu', 'siirtomaksuun')}.</p>
<h2>Esimerkki: veron osuus eri päivinä</h2>
<p>Sähköveron osuus kokonaishinnasta vaihtelee pörssihinnan mukaan. Jos pörssihinta on viisi senttiä kilowattitunnilta arvonlisäveron kanssa ja siirtomaksu neljä senttiä, kokonaishinta marginaaleineen on noin kaksitoista senttiä, josta vero on lähes neljännes. Kun pörssihinta nousee kolmeenkymmeneen senttiin, vero on enää alle kymmenesosa kokonaishinnasta. Siksi vero tuntuu laskussa suhteellisesti eniten kesällä ja halpoina päivinä, vaikka sen määrä kilowattitunnilta pysyy samana.</p>
<p>Vuoden laskussa veron osuus riippuu kulutuksesta ja siitä, mihin aikaan vuodesta sähköä käytetään. Sähkölämmitteinen talo kuluttaa suurimman osan sähköstään talvella, jolloin pörssihinnat ovat usein korkeampia, joten veron osuus koko vuoden laskusta on pienempi kuin kerrostaloasunnossa, jonka kulutus on tasaisempaa.</p>
<h2>Sähkövero ja sähkön hintatuki</h2>
<p>Sähkövero on kiinteä senttimäärä kilowattitunnilta, eikä se nouse pörssihinnan mukana. Arvonlisävero sen sijaan lasketaan prosentteina koko hinnasta, joten kalliina aikoina arvonlisäveron euromäärä kasvaa. Siksi sähkön hintaa on aiemmin tilapäisesti tuettu muun muassa alentamalla arvonlisäveroa. Tarkista ajankohtaiset tukitoimet aina viranomaisten sivuilta.</p>
<p>Tämän sivuston laskurit käyttävät samoja virallisia lähteitä: pörssihinnat Suomen tarjousalueelta, siirtohinnat verkkoyhtiöiden omista hinnastoista ja verot Verohallinnon taulukosta. Kaikki laskenta tapahtuu selaimessasi, eikä syöttämiäsi tietoja lähetetä minnekään. Hinnat päivittyvät joka päivä automaattisesti, ja jos päivän pörssihintoja ei ole saatavilla, laskuri näyttää selvästi merkityn keskihinta-arvion. Lisätietoa laskentatavasta, lähteistä ja rajoituksista on menetelmäsivulla.</p>`;
    },
  },
  en: {
    slug: 'electricity-tax-finland',
    nav: 'Electricity tax',
    card: 'Finland’s electricity tax and security-of-supply fee in 2026, tax classes and your annual tax.',
    title: 'Electricity Tax Finland 2026: c/kWh, Classes and Supply Fee',
    description: 'Finnish electricity tax 2026: class I 2.24 c and supply security fee 0.085 c per kWh before VAT from 1 April 2026. Work out the electricity tax you pay a year.',
    h1: 'Electricity tax in Finland 2026: what you pay and why',
    intro: 'Electricity tax is in every kilowatt-hour whatever your contract. From April 2026 it rose when the security-of-supply fee increased.',
    resume: (h) => {
      const v = V(h);
      return `Electricity tax is an excise duty that the network operator bills on every kilowatt-hour delivered and passes to the state. According to the Tax Administration’s table, from ${h.date(h.P.vero.voimassa)} household tax class I electricity tax is ${h.num(h.P.vero.sahkovero_I_c, 2)} cents and the security-of-supply fee ${h.num(h.P.vero.huoltovarmuus_c, 3)} cents per kilowatt-hour before VAT, ${h.num(h.M.VERO_VEROTON, 3)} cents in total. With 25.5% VAT a consumer pays ${h.c(v.nyt, 4)} on every kilowatt-hour. Before April the fee was ${h.num(h.P.vero.aiempi_huoltovarmuus_c, 3)} cents, so the tax rose by ${h.c(v.ero, 3)} per kilowatt-hour. A flat using 2,000 kilowatt-hours a year pays about ${h.eur(v.k[0].nyt, 0)} in electricity tax, and an electrically heated 18,000 kWh house ${h.eur(v.k[2].nyt, 0)}. The tax is the same on spot and fixed contracts and at every hour, so timing your use does not change it.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Who bills electricity tax in Finland?', a: 'The network operator that delivers the power bills the tax and passes it to the state. That is why it appears on the transfer bill, not the retailer’s. On a combined bill the retailer bills the network service and tax on the operator’s behalf, but the amount is the same.' },
        { q: 'Why did electricity tax rise in April 2026?', a: `According to the Tax Administration’s table, the security-of-supply fee rose from ${h.num(h.P.vero.aiempi_huoltovarmuus_c, 3)} to ${h.num(h.P.vero.huoltovarmuus_c, 3)} cents per kilowatt-hour from ${h.date(h.P.vero.voimassa)}, while the electricity tax itself stayed at ${h.num(h.P.vero.sahkovero_I_c, 2)} cents. The fee funds Finland’s security of supply for emergencies. It is billed with transfer.` },
        { q: 'Who can pay the lower tax class?', a: `The Tax Administration says class II covers industry, professional greenhouse growing, and heat pumps, electric boilers and geothermal circulation pumps, among others. Data centres have been in class I since ${h.date(h.P.vero.datakeskukset_I_alkaen)}. Households always pay class I, ${h.c(v.nyt, 4)} per kilowatt-hour.` },
        { q: 'Is VAT charged on electricity tax?', a: `Yes. VAT of 25.5% is also charged on the electricity tax and security-of-supply fee, so ${h.num(h.M.VERO_VEROTON, 3)} cents of tax costs a consumer ${h.c(v.nyt, 4)}. Operators’ price lists often show both figures, and some also show the combined transfer-plus-tax price. The calculators use the VAT-inclusive figure.` },
        { q: 'Does electricity tax change the cheapest spot hour?', a: 'No. The tax is the same every hour and quarter, so it does not change which hour is cheapest. It does shrink the relative gap between cheap and expensive hours, because a fixed tax is added to every price. At a negative spot price the tax usually keeps the all-in price positive.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Electricity tax rates 2026</h2>
${h.table(['Tax class', 'Electricity tax', 'Security-of-supply fee', 'Total before VAT', 'Total with VAT'], [
        ['I (households, services)', h.c(h.P.vero.sahkovero_I_c, 3), h.c(h.P.vero.huoltovarmuus_c, 3), h.c(h.M.VERO_VEROTON, 3), h.c(v.nyt, 4)],
        ['II (industry etc.)', h.c(h.P.vero.sahkovero_II_c, 3), h.c(h.P.vero.huoltovarmuus_c, 3), h.c(v.ii, 3), h.c(v.iiAlv, 4)],
      ], `Finnish Tax Administration, tax table ${h.date(h.P.vero.voimassa)}–${h.date(h.P.valid_to)}.`, ['l', 'r', 'r', 'r', 'r'])}
<p>Electricity tax has two parts: the electricity tax proper (energy tax) and the security-of-supply fee. Both are set in the ${h.src('finlexSahkovero', 'Act on excise duty on electricity and certain fuels')}, and the Tax Administration publishes the current rates in its ${h.src('veroTaulukko', 'tax table')}. The standard VAT rate is 25.5%, ${h.src('veroAlv', 'according to the Tax Administration')}.</p>
<h2>How much tax you pay a year</h2>
${h.table(['Annual consumption', 'Before 1 Apr 2026', 'From 1 Apr 2026', 'Change'], v.k.map((x) => [`${h.num(x.kwh)} kWh`, h.eur(x.ennen, 2), h.eur(x.nyt, 2), h.eur(x.nyt - x.ennen, 2)]), 'Electricity tax and security-of-supply fee with VAT for a full year’s consumption.', ['l', 'r', 'r', 'r'])}
<p>The April change is small for a household: a few tens of cents a year in a flat, a few euros in an electrically heated house. Electricity tax is still a significant part of the bill. When the spot price is low, the tax can exceed the price of the energy itself.</p>
<!--mini:siirtomaksu-->
<h2>Electricity tax in the all-in price</h2>
<p>The all-in electricity price has four parts: energy, retailer margin, transfer fee and electricity tax. The tax is the only one that is exactly the same everywhere in Finland. Transfer varies by operator and energy by the hour, but a class I consumer pays ${h.c(v.nyt, 4)} on every kilowatt-hour regardless of where they live or which contract they have.</p>
<p>On a day when the spot price is two cents per kilowatt-hour, electricity tax is almost one and a half times the energy price. On an expensive winter day, when spot reaches tens of cents, its share of the all-in price is small. The home page calculator shows the tax separately in every quarter hour.</p>
<h2>Why the tax is on the network bill</h2>
<p>The law makes the network operator that delivers electricity for consumption liable for the tax. The operator knows how much each site has used and bills the tax with transfer. Switching retailer therefore does not affect the tax, which appears on the transfer bill as its own line or within a tax-inclusive transfer price.</p>
<p>If your operator’s price list shows a tax-inclusive transfer fee, it is the sum of transfer fee and electricity tax. Elenia’s, Tampereen Sähköverkko’s and Savon Voima’s price lists, for instance, give this combined price ready-made. Outages or a change of operator do not affect the tax rate.</p>
<h2>Electricity tax and your own generation</h2>
<p>According to the Tax Administration, electricity that a small producer generates and uses itself is tax-free, among other cases, provided generation stays within the legal limit. Solar power produced and used in the same home at the same moment does not pass through the grid, so neither electricity tax nor transfer is paid on it. Surplus sold to the grid is not taxable consumption for the household either. That makes own generation worth more than the spot price alone.</p>
<h2>Changes in future years</h2>
<p>The tax rate can change with the state budget. Always check the current rate on the ${h.src('veroSahko', 'Tax Administration’s electricity tax page')}. This site updates the tax in its calculators as soon as a new table is published, and every page uses the same value. Work out your whole bill in the ${h.a('sahkolasku', 'electricity bill calculator')} and see how tax compares with the ${h.a('siirtomaksu', 'transfer fee')}.</p>`;
    },
  },
});
