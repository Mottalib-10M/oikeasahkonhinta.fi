import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { SARJA, paivaVerkossa } from '../../lib/arvot';

const V = (h: Helpers) => {
  const { M } = h;
  const sp = SARJA.hinnat.map((x) => M.spotC(x));
  // Écart maximal entre deux quarts d'une même heure, et moyenne de ces écarts.
  const erot: number[] = [];
  for (let i = 0; i + 4 <= sp.length; i += 4) { const s = sp.slice(i, i + 4); erot.push(Math.max(...s) - Math.min(...s)); }
  const maxEro = Math.max(...erot, 0), kaEro = erot.length ? erot.reduce((a, b) => a + b, 0) / erot.length : 0;
  const he = paivaVerkossa('helen');
  const tunnit = M.tunneittain(he.q.map((x) => x.yhteensa));
  const tMin = Math.min(...tunnit);
  return { maxEro, kaEro, he, tMin, arvio: SARJA.tila !== 'toteutunut', n: SARJA.hinnat.length };
};

export default defineGuide({
  id: 'varttihinta',
  group: 'opas',
  order: 30,
  mini: 'varttihinta',
  related: ['halvin-aika', 'huomenna', 'negatiivinen-hinta', 'sahkoauton-lataus', 'marginaali'],
  sources: ['nordpool', 'entsoe', 'motivaJousto', 'evHintavertailu'],
  fi: {
    slug: 'varttihinta',
    nav: 'Varttihinta',
    card: 'Sähkön varttihinta: 96 hintaa vuorokaudessa ja mitä se tarkoittaa pörssisopimukselle.',
    title: 'Varttihinta 2026: sähkön hinta 15 minuutin jaksoissa',
    description: 'Sähkön varttihinta 2026: pörssisähkön hinta määräytyy 15 minuutin jaksoissa, 96 hintaa vuorokaudessa. Mitä se tarkoittaa sähkölaskullesi ja ajoitukselle.',
    h1: 'Varttihinta: sähkön hinta vartti kerrallaan',
    intro: 'Pörssisähkön hinta määräytyy nykyään jokaiselle vartille erikseen. Se antaa uusia mahdollisuuksia säästää, mutta vain tietyillä sopimuksilla.',
    resume: (h) => {
      const v = V(h);
      return `Pohjoismaiset sähköpörssit siirtyivät ${h.date(h.P.markkina.vartti_alkaen)} vartin aikayksikköön. Siksi Suomen tarjousalueella on nyt jokaiselle 15 minuutin jaksolle oma hintansa, tavallisesti 96 hintaa vuorokaudessa. Aiemmin hinta määräytyi tunneittain. ${v.arvio ? 'Sivun päivityspäivän hinnat olivat arvioita, mutta toteutuneina päivinä' : `Sivun päivityspäivänä ${h.date(h.S.tanaan)}`} saman tunnin varttien pörssihinnat erosivat toisistaan keskimäärin ${h.c(v.kaEro)} ja enimmillään ${h.c(v.maxEro)} arvonlisäveron kanssa. Varttihinta näkyy laskussasi vain, jos sopimuksesi hinnoitellaan varteittain; tuntihintaisessa pörssisopimuksessa tunnin hinta on sen neljän vartin keskiarvo, ja kuukausihintaisessa tai kiinteässä sopimuksessa varteilla ei ole suoraa merkitystä. Varttihinnasta hyötyy eniten se, joka voi ajoittaa suuria kuormia, kuten sähköauton latauksen tai lämminvesivaraajan, tarkasti halvimpiin jaksoihin. Etusivun laskuri näyttää jokaisen vartin kokonaishinnan siirron ja verojen kanssa. Alla olevalla laskurilla voit laskea, paljonko kulutuksen siirtäminen kalliilta vartilta halvalle säästää vuodessa omilla luvuillasi. Laskurin oletuksena on kahdenkymmenen kilowattitunnin viikoittainen siirto ja viidenkymmenen euron megawattituntikohtainen hintaero, jonka voit vaihtaa omiin lukuihisi.`;
    },
    faqs: (h) => [
      { q: 'Muuttuiko sähkölaskuni varttihintaan siirryttäessä?', a: 'Se riippuu sopimuksesta. Kiinteähintaisessa sopimuksessa muutos ei näy. Pörssisopimuksessa myyjä voi hinnoitella kulutuksen varteittain tai tunneittain; tuntihintaisessa sopimuksessa tunnin hinta lasketaan sen varttien keskiarvona. Tarkista sopimusehdoista tai myyjältä, kumpi koskee sinua. Kulutuksen mittaus tapahtuu verkkoyhtiön mittarilla. Laskusta näet hinnoittelun aikajaon.' },
      { q: 'Tarvitaanko varttihintaan uusi sähkömittari?', a: 'Varttitason mittauksesta ja tietojen välittämisestä vastaa verkkoyhtiö. Suomessa sähkömittarit on uusittu niin, että kulutus voidaan mitata tarkemmalla aikajaolla, mutta käytännön toteutus vaihtelee yhtiöittäin. Kysy omalta verkkoyhtiöltäsi, millä tarkkuudella kulutuksesi mitataan ja välitetään myyjälle. Mittarin vaihdosta vastaa verkkoyhtiö eikä se maksa asiakkaalle erikseen.' },
      { q: 'Miksi saman tunnin vartit maksavat eri hinnan?', a: 'Kulutus ja tuotanto muuttuvat tunnin sisällä. Esimerkiksi aamulla kulutus kasvaa nopeasti, ja tunnin viimeinen vartti voi olla kalliimpi kuin ensimmäinen. Varttiaikayksikkö kuvaa näitä muutoksia tarkemmin kuin tunti. Suuret hyppäykset näkyvät usein tasatunneilla, kun suuret kuormat ja voimalaitosten ajojärjestys vaihtuvat. Kaavio näyttää erot.' },
      { q: 'Miten varttihinnasta hyötyy?', a: 'Ajoittamalla joustavat kuormat halvimpiin vartteihin. Sähköauton laturit, lämminvesivaraajien ohjaukset ja kodin automaatiojärjestelmät voivat käynnistyä ja pysähtyä varttien mukaan. Lyhyet kuormat, kuten astianpesukoneen lämmitysvaihe, voivat osua yhteen halvaan varttiin. Motiva kannustaa kulutusjoustoon, koska se tasaa myös sähköjärjestelmän kuormaa. Ohjaus kannattaa asettaa kerran ja antaa sen toimia itsestään.' },
      { q: 'Näyttävätkö muut hintasivut tuntihintoja vai varttihintoja?', a: 'Monet sivut näyttävät nykyään molemmat. Tämän sivuston laskuri näyttää kaaviossa jokaisen vartin ja taulukossa tuntikeskiarvot, molemmat siirron ja verojen kanssa. Tuntikeskiarvo vastaa tuntihintaista pörssisopimusta, ja varttihinnat varttipohjaista. Huomisen vartit julkaistaan iltapäivällä. Useimmat sivut eivät kuitenkaan lisää siirtoa ja veroa. Siksi niiden luku on pienempi kuin laskusi.' },
      { q: 'Onko varttihinta kalliimpi kuin tuntihinta?', a: 'Ei keskimäärin. Tunnin hinta on sen neljän vartin keskiarvo, joten tasaisella kulutuksella tuntihinta ja varttihinta johtavat samaan laskuun. Ero syntyy vain, jos kulutus painottuu tunnin sisällä kalliisiin tai halpoihin vartteihin. Joustavalla kulutuksella varttihinta voi olla edullisempi, joustamattomalla kulutuksella se voi olla hieman kalliimpi.' },
    ],
    body: (h) => {
      const v = V(h);
      return `<h2>Miksi siirryttiin varttihintaan</h2>
<p>Euroopan sähkömarkkinoita yhtenäistetään, ja tasehallinta eli sähkön tuotannon ja kulutuksen tasapainottaminen siirtyi Pohjoismaissa ensin 15 minuutin jaksoihin. Päivän edeltävän markkinan eli day-ahead-huutokaupan hinnat seurasivat ${h.date(h.P.markkina.vartti_alkaen)}. Lyhyempi aikayksikkö kuvaa paremmin vaihtelevaa tuuli- ja aurinkovoimaa sekä kulutuksen nopeita muutoksia, ja se antaa joustavalle kulutukselle tarkemman hintasignaalin.</p>
<p>Käytännössä day-ahead-huutokauppa pidetään edelleen kerran päivässä keskipäivällä Keski-Euroopan aikaa, ja tulokset julkaistaan Suomessa noin kello ${h.P.markkina.julkaisu_fi_klo}. Muutos koski hintojen tarkkuutta, ei julkaisuaikaa. Hinnat näkyvät ${h.src('nordpool', 'Nord Poolin sivulla')} ja ${h.src('entsoe', 'ENTSO-E:n läpinäkyvyysalustalla')}.</p>
<h2>Päivän vartit ja tunnit</h2>
<p>Sivun päivityspäivän ${v.n} varttihintaa ovat etusivun laskurin kaaviossa. Helsingin yleissiirrolla halvin vartti maksoi kokonaishintana ${h.c(v.he.st.min)} ja halvin tunti keskimäärin ${h.c(v.tMin)}. Ero halvimman vartin ja halvimman tunnin välillä kertoo, kuinka paljon varttihinnoittelu voi parhaimmillaan hyödyttää lyhyttä kuormaa.</p>
<!--mini:halvinAika-->
<h2>Mitä varttihinta tarkoittaa eri sopimuksille</h2>
<ul>
<li><strong>Varttihintainen pörssisopimus</strong>: jokaisen vartin kulutus hinnoitellaan sen vartin pörssihinnalla, plus marginaali. Tarkin hintasignaali ja suurin hyöty joustosta.</li>
<li><strong>Tuntihintainen pörssisopimus</strong>: tunnin hinta on sen neljän vartin keskiarvo. Ajoittaminen tunnin tarkkuudella riittää.</li>
<li><strong>Kuukauden keskihintaan perustuva sopimus</strong>: hinta on kuukauden keskiarvo, eikä ajoittamisella ole suoraa vaikutusta.</li>
<li><strong>Kiinteä hinta</strong>: energian hinta on sama joka hetki. Ajoittamisella on merkitystä vain, jos siirtotuote on aika- tai kausisiirto.</li>
</ul>
<p>${h.src('evHintavertailu', 'Energiaviraston hintavertailusta')} näet, millaisia pörssisopimuksia alueellasi tarjotaan. Vertaa myös ${h.a('marginaali', 'marginaaleja')}.</p>
<h2>Kuinka paljon ajoittaminen säästää</h2>
<p>Säästö on siirretty kulutus kertaa hintojen ero. Yleissiirrossa ero syntyy vain pörssihinnasta, koska siirtomaksu ja sähkövero ovat samat joka vartilla. Aikasiirrossa yön halvempi siirto kasvattaa eroa. Yllä oleva laskuri näyttää säästön sen mukaan, paljonko kulutusta siirrät viikossa ja kuinka suuri pörssihintojen ero on. Suurimmat säästöt syntyvät suurista kuormista: ${h.a('sahkoauton-lataus', 'sähköauton lataus')} ja lämminvesivaraaja kuluttavat moninkertaisesti pesukoneeseen verrattuna.</p>
<h2>Varo tehomaksua</h2>
<p>Jos siirtotuotteessasi on tehomaksu, kaikkien kuormien ajaminen samaan halvimpaan varttiin voi nostaa kuukauden huipputehoa ja tehomaksua. Silloin on usein parempi jakaa kuormat useammalle halvalle jaksolle. Lue lisää ${h.a('tehomaksu', 'tehomaksun oppaasta')} ja katso tyypilliset halvat tunnit ${h.a('halvin-aika', 'halvimman ajan oppaasta')}.</p>
<h2>Esimerkki: lämminvesivaraaja varttihinnalla</h2>
<p>Lämminvesivaraaja on hyvä esimerkki kuormasta, joka hyötyy varttihinnasta. Varaaja lämpenee tavallisesti yöllä muutaman tunnin ajan, ja sen voi ohjata käynnistymään juuri niinä vartteina, jotka ovat yön halvimpia. Tuntihinnalla ohjaus valitsi kokonaisia tunteja; varttihinnalla ohjaus voi ohittaa yksittäisen kalliin vartin ja jatkaa seuraavana halpana. Säästö yhdestä yöstä on pieni, mutta se kertyy joka yö koko vuoden ajan ilman vaivaa, kun ohjaus on kerran asetettu.</p>
<p>Sama periaate koskee sähköauton latausta, varaavaa lämmitystä ja kodin akkua. Mitä joustavampi kuorma on, sitä tarkemmin se voi seurata hintaa. Lyhyet ja joustamattomat kuormat, kuten ruoanlaitto tai valaistus, eivät hyödy varttihinnasta käytännössä lainkaan.</p>
<h2>Varttihinta ja mittaus</h2>
<p>Jotta varttihinnasta olisi hyötyä laskulla, kulutus on mitattava ja välitettävä myyjälle varteittain. Sähkön kulutustiedot kulkevat Suomessa kansallisen Datahub-järjestelmän kautta, josta myyjä saa ne laskutusta varten. Jos kulutuksesi mitataan vielä tunneittain, myyjä jakaa tunnin kulutuksen varteille sopimusehtojen mukaisesti. Tarkista verkkoyhtiöltäsi, millä tarkkuudella kulutustasi mitataan.</p>
<h2>Varttihinta ja tasesähkö</h2>
<p>Myyjän kannalta varttihinta tarkoittaa, että ennustevirheet hinnoitellaan tarkemmin. Kun asiakkaiden kulutus poikkeaa ennusteesta, myyjä maksaa erotuksesta tasesähkön hinnan. Tämä kustannus sisältyy marginaaliin, ja se on yksi syy siihen, miksi marginaalit vaihtelevat myyjittäin. Joustava ja ennustettava kulutus pienentää myyjän riskiä, ja pitkällä aikavälillä se näkyy myös hinnoissa.</p>
<h2>Varttihinta kerrostalossa</h2>
<p>Kerrostaloasunnossa joustavia kuormia on vähän: lämmitys ja lämmin vesi tulevat yleensä taloyhtiön kautta, ja asukkaan oma kulutus koostuu kodinkoneista, valaistuksesta ja mahdollisesta sähkösaunasta. Varttihinnasta voi silti hyötyä ajastamalla pesukoneen ja astianpesukoneen halvoille tunneille. Säästö on pieni, mutta ajastaminen ei maksa mitään.</p>
<p>Tämän sivuston laskurit käyttävät samoja virallisia lähteitä: pörssihinnat Suomen tarjousalueelta, siirtohinnat verkkoyhtiöiden omista hinnastoista ja verot Verohallinnon taulukosta. Kaikki laskenta tapahtuu selaimessasi, eikä syöttämiäsi tietoja lähetetä minnekään. Hinnat päivittyvät joka päivä automaattisesti, ja jos päivän pörssihintoja ei ole saatavilla, laskuri näyttää selvästi merkityn keskihinta-arvion. Lisätietoa laskentatavasta, lähteistä ja rajoituksista on menetelmäsivulla.</p>`;
    },
  },
  en: {
    slug: 'quarter-hour-electricity-price',
    nav: 'Quarter-hour price',
    card: 'The quarter-hour electricity price: 96 prices a day and what they mean for a spot contract.',
    title: 'Quarter-Hour Electricity Price Finland 2026: 15-Minute Spot',
    description: 'Finnish quarter-hour electricity price 2026: the spot price is set for every 15 minutes, 96 prices a day. What it means for your bill and when you use power.',
    h1: 'The quarter-hour price: electricity priced 15 minutes at a time',
    intro: 'The spot price is now set separately for every quarter hour. That opens new ways to save, but only on certain contracts.',
    resume: (h) => {
      const v = V(h);
      return `The Nordic power exchanges moved to a 15-minute time unit on ${h.date(h.P.markkina.vartti_alkaen)}, so the Finnish bidding zone now has a price for every quarter hour, normally 96 a day. Prices used to be hourly. ${v.arvio ? 'On the page’s update day prices were estimates, but on days with published prices' : `On the page’s update day, ${h.date(h.S.tanaan)},`} the quarters within an hour differed by ${h.c(v.kaEro)} on average and by up to ${h.c(v.maxEro)} including VAT. The quarter-hour price only shows on your bill if your contract is priced by quarter; on an hourly spot contract the hour’s price is the average of its four quarters, and on a monthly-average or fixed contract quarters have no direct effect. Those who can time large loads, such as car charging or a water heater, precisely into the cheapest quarters gain most. The home page calculator shows every quarter’s all-in price with transfer and taxes.`;
    },
    faqs: (h) => [
      { q: 'Did my bill change with quarter-hour pricing?', a: 'It depends on your contract. On a fixed contract nothing changes. On a spot contract the retailer may price use by quarter or by hour; on an hourly contract the hour’s price is the average of its quarters. Check your terms or ask the retailer which applies. Metering is done by the network operator’s meter.' },
      { q: 'Do I need a new meter for quarter-hour pricing?', a: 'Quarter-hour metering and data delivery are the network operator’s responsibility. Finnish meters have been renewed so that use can be measured at a finer resolution, but implementation varies by operator. Ask your operator at what resolution your consumption is measured and passed to the retailer.' },
      { q: 'Why do quarters in the same hour cost different amounts?', a: 'Demand and supply change within the hour. In the morning, for example, demand rises fast and the last quarter of an hour can be dearer than the first. The 15-minute unit captures these changes more precisely than the hour. Large jumps often appear on the hour, when big loads and plant dispatch change.' },
      { q: 'How do I benefit from quarter-hour prices?', a: 'By timing flexible loads into the cheapest quarters. Car chargers, water heater controls and home automation can start and stop by quarter. Short loads, such as a dishwasher’s heating phase, can fit into one cheap quarter. Motiva encourages demand flexibility because it also eases the load on the power system.' },
      { q: 'Do other price sites show hourly or quarter-hour prices?', a: 'Many now show both. This site’s calculator shows every quarter in the chart and hourly averages in the table, both with transfer and taxes. The hourly average matches an hourly spot contract, the quarters a quarter-based one. Tomorrow’s quarters are published in the afternoon.' },
    ],
    body: (h) => {
      const v = V(h);
      return `<h2>Why prices moved to quarter hours</h2>
<p>Europe’s electricity markets are being harmonised, and balancing, keeping generation and consumption in step, moved to 15-minute periods in the Nordics first. Day-ahead auction prices followed on ${h.date(h.P.markkina.vartti_alkaen)}. A shorter time unit better reflects variable wind and solar output and rapid changes in demand, and it gives flexible consumption a sharper price signal.</p>
<p>In practice the day-ahead auction is still held once a day at noon Central European time, and results appear in Finland at about ${h.P.markkina.julkaisu_fi_klo}. The change concerned the resolution of prices, not the publication time. Prices are shown on ${h.src('nordpool', 'Nord Pool’s site')} and the ${h.src('entsoe', 'ENTSO-E Transparency Platform')}.</p>
<h2>The day’s quarters and hours</h2>
<p>The update day’s ${v.n} quarter-hour prices are in the home page calculator’s chart. On Helsinki’s general transfer the cheapest quarter cost ${h.c(v.he.st.min)} all-in and the cheapest hour ${h.c(v.tMin)} on average. The gap between the cheapest quarter and the cheapest hour shows how much quarter-hour pricing can at best help a short load.</p>
<!--mini:halvinAika-->
<h2>What quarter-hour pricing means for each contract</h2>
<ul>
<li><strong>Quarter-hour spot contract</strong>: each quarter’s use is priced at that quarter’s spot price plus margin. The sharpest signal and the biggest gain from flexibility.</li>
<li><strong>Hourly spot contract</strong>: the hour’s price is the average of its four quarters. Timing to the hour is enough.</li>
<li><strong>Monthly-average contract</strong>: the price is the month’s average and timing has no direct effect.</li>
<li><strong>Fixed price</strong>: energy costs the same at every moment. Timing only matters on time-of-day or seasonal transfer.</li>
</ul>
<p>The ${h.src('evHintavertailu', 'Energy Authority’s comparison')} shows which spot contracts are offered in your area. Compare ${h.a('marginaali', 'margins')} too.</p>
<h2>How much timing saves</h2>
<p>The saving is the use you shift times the price gap. On general transfer the gap comes from spot alone, since transfer and tax are the same every quarter. On time-of-day transfer cheaper night transfer widens it. The calculator above shows the saving from the use you shift each week and the size of the spot gap. The biggest savings come from large loads: ${h.a('sahkoauton-lataus', 'car charging')} and a water heater use many times what a washing machine does.</p>
<h2>Watch the power fee</h2>
<p>If your transfer product has a power fee, running every load in the same cheapest quarter can lift the month’s peak and the fee. It is then often better to spread loads over several cheap windows. Read the ${h.a('tehomaksu', 'power fee guide')} and see typical cheap hours in the ${h.a('halvin-aika', 'cheapest time guide')}.</p>
<h2>Example: a water heater on quarter-hour prices</h2>
<p>A water heater usually heats for a few hours at night and can be set to run in exactly the cheapest quarters. On hourly prices the control picked whole hours; on quarter-hour prices it can skip one expensive quarter and resume in the next cheap one. One night’s saving is small, but it accrues every night all year once the control is set.</p>`;
    },
  },
});
