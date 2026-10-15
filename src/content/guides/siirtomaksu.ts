import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { jarjestys } from '../../lib/arvot';

const V = (h: Helpers) => {
  const { M } = h;
  const yleis = M.VERKOT.map((v) => v.tuotteet[0].energia.kaikki!);
  const min = Math.min(...yleis), max = Math.max(...yleis);
  const o = jarjestys(5000, '3x25');
  const perus = M.VERKOT.map((v) => M.perusKk(v.tuotteet[0], '3x25'));
  return { min, max, o, pmin: Math.min(...perus), pmax: Math.max(...perus), n: M.VERKOT.length };
};

export default defineGuide({
  id: 'siirtomaksu',
  group: 'opas',
  order: 20,
  mini: 'siirtomaksu',
  miniHref: undefined,
  related: ['siirtohinnat', 'tehomaksu', 'sahkovero', 'siirto-caruna', 'siirto-elenia'],
  sources: ['motivaSiirto', 'caruna', 'elenia', 'helen', 'evPostinumerot'],
  fi: {
    slug: 'siirtomaksu',
    nav: 'Siirtomaksu',
    card: 'Mikä sähkön siirtomaksu on, mistä se muodostuu ja miksi se vaihtelee verkoittain.',
    title: 'Siirtomaksu 2026: mitä sähkön siirto maksaa ja miksi',
    description: 'Sähkön siirtomaksu 2026: mistä siirtomaksu ja perusmaksu muodostuvat, miksi hinta vaihtelee verkkoyhtiöittäin ja miten valitset yleis-, aika- tai kausisiirron.',
    h1: 'Siirtomaksu: mitä sähkön siirrosta maksetaan',
    intro: 'Siirtomaksu on usein yhtä suuri osa sähkölaskua kuin itse energia. Sitä ei voi kilpailuttaa, mutta siirtotuotteen voi valita.',
    resume: (h) => {
      const v = V(h);
      return `Sähkön siirtomaksu, nykyiseltä nimeltään verkkopalvelumaksu, on korvaus sähkön kuljettamisesta kantaverkosta kotiisi. Sen laskuttaa paikallinen verkkoyhtiö, joka määräytyy osoitteen mukaan. Maksu koostuu tavallisesti kuukausittaisesta perusmaksusta, joka riippuu pääsulakkeen koosta, ja kulutukseen perustuvasta siirtomaksusta senttiä kilowattitunnilta. Laskurin ${h.num(v.n)} verkkoyhtiön yleissiirron siirtomaksu vaihtelee ${h.c(v.min)} ja ${h.c(v.max)} välillä arvonlisäveron kanssa, ja 3 × 25 ampeerin perusmaksu ${h.eur(v.pmin)} ja ${h.eur(v.pmax)} välillä kuukaudessa. Omakotitalossa, joka kuluttaa 5 000 kilowattituntia vuodessa, siirto maksaa halvimmassa verkossa ${h.eur(v.o[0].paras.e, 0)} ja kalleimmassa ${h.eur(v.o.at(-1)!.paras.e, 0)} vuodessa. Verkkoyhtiötä ei voi vaihtaa, mutta siirtotuotteen eli yleis-, aika- tai kausisiirron voi yleensä vaihtaa kerran vuodessa maksutta. Oikea tuote voi säästää sähkölämmitteisessä talossa satoja euroja vuodessa. Alla olevalla laskurilla näet oman verkkoyhtiösi yleissiirron vuosikustannuksen omalla kulutuksellasi, ja jokaisen verkon omalla sivulla on vertailu kaikista sen tuotteista.`;
    },
    faqs: (h) => [
      { q: 'Mitä siirtomaksulla maksetaan?', a: 'Motivan mukaan verkkopalvelumaksu kattaa sähkön siirron kantaverkosta käyttöpaikalle, sähkön mittauksen, asiakaspalvelun, vikapäivystyksen ja vikojen korjauksen sekä sähköverkon ylläpidon, uudistamisen ja rakentamisen. Verkkoyhtiöiden on myös parannettava verkkojen säävarmuutta, mikä on viime vuosina nostanut erityisesti maaseutuverkkojen kustannuksia. Myös mittarien vaihto ja etäluenta rahoitetaan verkkopalvelumaksulla.' },
      { q: 'Miksi siirtomaksu on maaseudulla kalliimpi?', a: 'Koska verkon kustannukset jaetaan yhtiön omille asiakkaille. Maaseudulla johtoa on paljon asiakasta kohti, ja säävarman maakaapeliverkon rakentaminen on kallista. Kaupungeissa sama verkko palvelee tiheästi asuvia asiakkaita. Energiavirasto valvoo, ettei yhtiöiden tuotto ylitä kohtuullista tasoa, mutta kustannuserot jäävät. Siirtohintojen vertailu näyttää erot euroina.' },
      { q: 'Voinko kilpailuttaa siirtomaksun?', a: 'Et voi. Jakeluverkko on alueellinen monopoli, eikä samaan osoitteeseen voi ostaa siirtoa toiselta yhtiöltä. Voit kuitenkin valita yhtiön tuotevalikoimasta sopivimman siirtotuotteen, joskus pienentää pääsulaketta ja ajoittaa kulutusta, jos tuotteessa on yöhinta tai tehomaksu. Sähkönmyyjän voit vaihtaa vapaasti. Siirtotuotteen vaihto on usein maksuton kerran vuodessa.' },
      { q: 'Mikä on perusmaksun ja siirtomaksun ero?', a: 'Perusmaksu on kiinteä kuukausimaksu, joka riippuu yleensä pääsulakkeen koosta eikä kulutuksesta. Siirtomaksu maksetaan jokaisesta siirretystä kilowattitunnista. Pienellä kulutuksella perusmaksu on suurempi osa siirtolaskua, suurella kulutuksella siirtomaksu. Siksi pienen kulutuksen koti hyötyy pienestä perusmaksusta. Laskurin kuukausimaksurivi näyttää perusmaksut erikseen. Molemmat ovat samalla verkkoyhtiön laskulla.' },
      { q: 'Paljonko verkkoyhtiö saa nostaa hintoja?', a: 'Sähkömarkkinalaki rajoittaa verkkopalvelumaksujen korotuksia, ja Energiavirasto valvoo hinnoittelun kohtuullisuutta valvontajaksoittain. Yhtiön on ilmoitettava hinnanmuutoksista asiakkaille etukäteen. Jos hinnat muuttuvat, tämän sivuston tarkistusohjelma huomaa eron yhtiön hinnastoon, ja laskurin hinnat päivitetään. Hinnankorotukset kirjataan laskuriin, kun ne tulevat voimaan. Sivun päivämäärä kertoo tarkistuksen ajankohdan.' },
      { q: 'Voiko pääsulaketta pienentää siirtomaksun takia?', a: 'Joissakin verkoissa perusmaksu riippuu pääsulakkeen koosta, ja sulakkeen pienentäminen voi laskea perusmaksua. Muutos on kuitenkin liittymän muutostyö, josta voidaan periä maksu, ja liian pieni sulake voi laueta, kun useita suuria laitteita on päällä samaan aikaan. Kysy verkkoyhtiöltä ennen muutosta. Tarkista ensin, riittääkö pienempi sulake.' },
    ],
    body: (h) => {
      const v = V(h);
      return `<h2>Kolme siirtotuotetta</h2>
<p>Lähes kaikilla verkkoyhtiöillä on kotitalouksille kolme perustuotetta. Nimet vaihtelevat yhtiöittäin, mutta periaate on sama.</p>
<ul>
<li><strong>Yleissiirto</strong> (yleissähkö, yksiaikainen): sama siirtomaksu ympäri vuorokauden ja vuoden. Pienin perusmaksu. Sopii kerrostaloasuntoihin ja koteihin, joissa ei ole sähkölämmitystä.</li>
<li><strong>Aikasiirto</strong> (yösiirto, kaksiaikainen, päivä-yö): halvempi siirtomaksu yöllä, tavallisesti kello 22–7, ja kalliimpi päivällä. Suurempi perusmaksu. Sopii varaavaan sähkölämmitykseen ja sähköauton yölataukseen.</li>
<li><strong>Kausisiirto</strong> (vuodenaikasiirto): kallis talviarkipäivinä, 1.11.–31.3. maanantaista lauantaihin kello 7–22, ja halpa muulloin. Sopii suoraan sähkölämmitykseen, jos talvipäivinä voi käyttää muuta lämmitystä.</li>
</ul>
<p>Varo nimiä: esimerkiksi Savon Voiman aikasähkö on hinnoiteltu talviarkipäivän mukaan, ei päivän ja yön. Helenin ja Kuopion aikasiirrossa on lisäksi ${h.a('tehomaksu', 'tehomaksu')}.</p>
<h2>Siirtomaksu laskurin verkoissa</h2>
${h.table(['Verkkoyhtiö', 'Yleissiirto c/kWh', 'Perusmaksu 3 × 25 A', 'Siirto vuodessa, 5 000 kWh'], v.o.map((r) => [h.a(`siirto-${r.v.id}`, r.v.lyhyt), h.c(r.v.tuotteet[0].energia.kaikki!), h.eur(h.M.perusKk(r.v.tuotteet[0], '3x25')), h.eur(r.paras.e, 0)]), 'Hinnat sis. alv 25,5 %, ilman sähköveroa. Vuosikustannus edullisimmalla tuotteella.', ['l', 'r', 'r', 'r'])}
<p>Taulukko on järjestetty omakotitalon vuosikustannuksen mukaan. Huomaa, että pienin siirtomaksu ei aina tarkoita halvinta kokonaisuutta, koska perusmaksu voi olla suuri, ja päinvastoin.</p>
<h2>Miten valitset oikean tuotteen</h2>
<p>Valinta riippuu kulutuksen määrästä ja ajoittumisesta. Kerrostaloasunnossa yleissiirto on lähes aina halvin. Omakotitalossa ilman sähkölämmitystä yleissiirto on yleensä myös paras. Sähkölämmitteisessä talossa aika- tai kausisiirto alkaa kannattaa tietyn kulutuksen jälkeen, ja raja on sitä alempi, mitä suurempi osa kulutuksesta osuu yöhön tai muulle halvalle ajalle.</p>
<p>Jokaisen verkkoyhtiön omalla sivulla on laskelma, jolla kulutuksella yösiirto tai kausisiirto ohittaa yleissiirron, sekä tuotteiden vuosikustannus kolmelle tyypilliselle kodille. Tarkemman vertailun omilla luvuillasi saat ${h.a('siirtohinnat', 'siirtohintojen vertailulaskurilla')}. Monella verkkoyhtiöllä on myös oma siirtotuotelaskurinsa.</p>
<h2>Siirtomaksu ja pörssisähkö</h2>
<p>Pörssisähkön käyttäjälle siirtotuote vaikuttaa siihen, mikä tunti on kokonaishinnaltaan halvin. Yleissiirrossa halvin tunti on aina se, jonka pörssihinta on halvin. Aikasiirrossa yön halpa siirto voi tehdä yötunnista halvimman, vaikka pörssihinta olisi päivällä vähän matalampi. Etusivun laskuri ottaa tämän huomioon jokaisessa vartissa.</p>
<h2>Mistä tiedän oman verkkoyhtiöni</h2>
<p>Verkkoyhtiön nimi on siirtolaskussa. Laskurin postinumerokenttä hakee alueesi verkkoyhtiön ${h.src('evPostinumerot', 'Energiaviraston postinumeroluettelosta')}. Samalla postinumerolla voi toimia useampi yhtiö, joten tarkista lopuksi laskusta. ${h.src('motivaSiirto', 'Motivan sivulla')} kerrotaan lisää siirtomaksun muodostumisesta ja siitä, miten omaan siirtolaskuun voi vaikuttaa.</p>
<h2>Esimerkki: oikea tuote sähkölämmitystaloon</h2>
<p>Sähkölämmitteinen omakotitalo kuluttaa tyypillisesti kymmeniä tuhansia kilowattitunteja vuodessa, ja suuri osa kulutuksesta osuu talveen. Jos talossa on varaava lämmitys, joka ottaa sähköä pääosin yöllä, yösiirto on lähes aina yleissiirtoa edullisempi, koska yön siirtomaksu on monessa verkossa vain noin puolet päivän hinnasta. Suorassa sähkölämmityksessä kulutus jakautuu tasaisemmin, ja kausisiirto voi olla parempi, jos talvipäivinä voi lämmittää takalla tai ilmalämpöpumpulla.</p>
<p>Verkkoyhtiön palvelusta näet kulutuksesi tunneittain. Laske, kuinka suuri osa kulutuksesta osuu kello 22–7 väliselle ajalle ja kuinka suuri osa talviarkipäiviin. Kun nämä osuudet tunnetaan, tuotteiden vertailu on helppo, ja jokaisen verkon omalla sivullamme näet tuotteiden vuosikustannuksen.</p>
<h2>Siirtomaksu ja sähköverkon uudistaminen</h2>
<p>Verkkoyhtiöt ovat viime vuosina uusineet verkkojaan säävarmoiksi, koska lain mukaan myrsky tai lumikuorma ei saa aiheuttaa pitkiä sähkökatkoja. Maakaapelointi on kallista erityisesti harvaan asutuilla alueilla, ja sen kustannukset näkyvät siirtohinnoissa. Kaupunkiverkoissa johdot ovat jo pitkään olleet maan alla, joten niiden kustannukset ovat pienempiä. Siirtohinta kertoo siis paljolti alueen maantieteestä ja verkon rakenteesta. Energiavirasto valvoo, että verkkoyhtiöiden tuotto pysyy kohtuullisena, mutta alueiden väliset kustannuserot jäävät asiakkaiden maksettaviksi.</p>
<p>Tämän sivuston laskurit käyttävät samoja virallisia lähteitä: pörssihinnat Suomen tarjousalueelta, siirtohinnat verkkoyhtiöiden omista hinnastoista ja verot Verohallinnon taulukosta. Kaikki laskenta tapahtuu selaimessasi, eikä syöttämiäsi tietoja lähetetä minnekään. Hinnat päivittyvät joka päivä automaattisesti, ja jos päivän pörssihintoja ei ole saatavilla, laskuri näyttää selvästi merkityn keskihinta-arvion. Lisätietoa laskentatavasta, lähteistä ja rajoituksista on menetelmäsivulla.</p>`;
    },
  },
  en: {
    slug: 'electricity-transfer-fee-explained',
    nav: 'Transfer fee explained',
    card: 'What the Finnish electricity transfer fee is, what it is made of and why it varies by network.',
    title: 'Electricity Transfer Fee Finland 2026: What It Pays For',
    description: 'Finnish electricity transfer fee 2026: what transfer and basic fees are made of, why prices vary by operator, and how to pick general, night or seasonal.',
    h1: 'The transfer fee: what you pay for distribution',
    intro: 'The transfer fee is often as large a part of the bill as the energy itself. You cannot switch provider, but you can choose the product.',
    resume: (h) => {
      const v = V(h);
      return `The electricity transfer fee, now officially the network service fee, pays for carrying power from the national grid to your home. It is billed by the local network operator, which is set by your address. It usually has a monthly basic fee that depends on the main fuse and a consumption-based transfer fee in cents per kilowatt-hour. Across the calculator’s ${h.num(v.n)} operators, general transfer ranges from ${h.c(v.min)} to ${h.c(v.max)} including VAT, and the 3 × 25 A basic fee from ${h.eur(v.pmin)} to ${h.eur(v.pmax)} a month. For a house using 5,000 kilowatt-hours a year, transfer costs ${h.eur(v.o[0].paras.e, 0)} a year in the cheapest network and ${h.eur(v.o.at(-1)!.paras.e, 0)} in the dearest. You cannot change operator, but you can usually switch transfer product, general, time-of-day or seasonal, once a year free of charge. The right product can save an electrically heated house hundreds of euros a year.`;
    },
    faqs: (h) => [
      { q: 'What does the transfer fee pay for?', a: 'According to Motiva, the network fee covers carrying power from the national grid to your site, metering, customer service, fault duty and repairs, and maintaining, renewing and building the network. Operators must also make networks weatherproof, which has raised costs especially in rural networks in recent years.' },
      { q: 'Why is transfer more expensive in the countryside?', a: 'Because network costs are shared among the operator’s own customers. In rural areas there is a lot of line per customer, and building weatherproof underground cable is expensive. In towns the same network serves densely settled customers. The Energy Authority caps returns, but cost differences remain.' },
      { q: 'Can I shop around for transfer?', a: 'No. Distribution is a regional monopoly and you cannot buy transfer to your address from another company. You can choose the best product from your operator’s range, sometimes reduce the main fuse, and time your use if the product has a night rate or power fee. Retailers you can switch freely.' },
      { q: 'What is the difference between the basic fee and the transfer fee?', a: 'The basic fee is a fixed monthly charge that usually depends on the main fuse, not on use. The transfer fee is paid on every kilowatt-hour delivered. At low use the basic fee is the larger part of the bill, at high use the transfer fee, so a low-use home benefits from a small basic fee.' },
      { q: 'How much may an operator raise prices?', a: 'The Electricity Market Act limits increases in network fees, and the Energy Authority supervises reasonableness over regulatory periods. Operators must announce price changes to customers in advance. If prices change, this site’s check script spots the difference from the operator’s price list and the calculator is updated.' },
    ],
    body: (h) => {
      const v = V(h);
      return `<h2>Three transfer products</h2>
<p>Almost every operator offers households three basic products. Names vary by company, but the principle is the same.</p>
<ul>
<li><strong>General transfer</strong>: the same fee day and night, all year. The lowest basic fee. Suits flats and homes without electric heating.</li>
<li><strong>Time-of-day transfer</strong> (night, two-rate, day-night): cheaper at night, usually 22:00–07:00, dearer by day. A higher basic fee. Suits storage heating and overnight car charging.</li>
<li><strong>Seasonal transfer</strong>: expensive on winter weekdays, 1 Nov to 31 Mar, Monday to Saturday 07:00–22:00, cheap otherwise. Suits direct electric heating if you can use other heating on winter days.</li>
</ul>
<p>Watch the names: Savon Voima’s “aikasähkö”, for example, is priced by winter weekdays, not day and night. Helen’s and Kuopio’s time-of-day products also carry a ${h.a('tehomaksu', 'power fee')}.</p>
<h2>Transfer fees in the calculator’s networks</h2>
${h.table(['Operator', 'General transfer c/kWh', 'Basic fee 3 × 25 A', 'Transfer per year, 5,000 kWh'], v.o.map((r) => [h.a(`siirto-${r.v.id}`, r.v.lyhyt), h.c(r.v.tuotteet[0].energia.kaikki!), h.eur(h.M.perusKk(r.v.tuotteet[0], '3x25')), h.eur(r.paras.e, 0)]), 'Prices incl. 25.5% VAT, excluding electricity tax. Annual cost on the cheapest product.', ['l', 'r', 'r', 'r'])}
<p>The table is sorted by a house’s annual cost. Note that the lowest transfer fee does not always mean the cheapest total, since the basic fee may be large, and vice versa.</p>
<h2>How to choose the right product</h2>
<p>The choice depends on how much you use and when. In a flat general transfer is almost always cheapest, and usually also in a house without electric heating. In an electrically heated house time-of-day or seasonal transfer starts to pay beyond a certain consumption, and the threshold falls the more of your use lands at night or other cheap times.</p>
<p>Each operator’s page shows the consumption at which night or seasonal transfer overtakes general transfer, and the products’ annual cost for three typical homes. For a comparison with your own figures use the ${h.a('siirtohinnat', 'transfer fee comparison calculator')}. Many operators also have their own product calculator.</p>
<h2>Transfer fees and spot electricity</h2>
<p>For a spot customer the transfer product affects which hour is cheapest all-in. On general transfer the cheapest hour is always the one with the cheapest spot price. On time-of-day transfer cheap night transfer can make a night hour cheapest even if spot is slightly lower in daytime. The home page calculator accounts for this in every quarter hour.</p>
<h2>How do I know my operator?</h2>
<p>The operator’s name is on your transfer bill. The calculator’s postcode field looks up your area’s operator in the ${h.src('evPostinumerot', 'Energy Authority postcode list')}. Several operators can share a postcode, so check the bill to be sure. ${h.src('motivaSiirto', 'Motiva')} explains more about how the transfer fee is made up and how you can influence your own transfer bill.</p>`;
    },
  },
});
