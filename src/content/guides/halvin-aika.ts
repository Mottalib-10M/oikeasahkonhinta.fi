import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { tuntiProfiili, tunti, paivaVerkossa } from '../../lib/arvot';

const V = (h: Helpers) => {
  const arki = tuntiProfiili('arki'), vkl = tuntiProfiili('vkl');
  const he = paivaVerkossa('helen');
  const el = paivaVerkossa('elenia', 'aika');
  const eur = (x: number) => h.M.spotC(x); // €/MWh d'écart → c/kWh TVA comprise
  return { arki, vkl, he, el, eur };
};

export default defineGuide({
  id: 'halvin-aika',
  group: 'opas',
  order: 70,
  mini: 'halvinAika',
  related: ['huomenna', 'varttihinta', 'sahkoauton-lataus', 'pyykinpesu', 'negatiivinen-hinta'],
  sources: ['nordpool', 'motivaJousto', 'helen', 'elenia'],
  fi: {
    slug: 'halvin-aika-kayttaa-sahkoa',
    nav: 'Halvin aika käyttää sähköä',
    card: 'Mihin vuorokauden aikaan pörssisähkö on tyypillisesti halvinta ja miten halvin jakso löytyy.',
    title: 'Halvin aika käyttää sähköä 2026: pörssisähkön halvat tunnit',
    description: 'Halvin aika käyttää sähköä 2026: pörssisähkön tyypillisesti halvimmat ja kalleimmat tunnit arkena ja viikonloppuna sekä tämän päivän halvin jakso kotiin.',
    h1: 'Milloin sähkö on halvinta?',
    intro: 'Pörssisähkön hinta noudattaa vuorokausirytmiä, mutta tuuli sekoittaa sen usein. Tässä tyypilliset halvat tunnit ja tämän päivän halvin jakso.',
    resume: (h) => {
      const v = V(h);
      const a = v.arki, w = v.vkl;
      return `${a ? `Toteutuneiden varttihintojen perusteella (${h.num(a.paivia)} arkipäivää) pörssisähkö on arkisin ollut keskimäärin halvinta tunneilla ${a.halvimmat.map(tunti).join(', ')}. Kalleinta se on ollut tunneilla ${a.kalleimmat.map(tunti).join(', ')}.` : ''} ${w ? `Viikonloppuisin (${h.num(w.paivia)} päivää) halvimmat tunnit ovat olleet ${w.halvimmat.map(tunti).join(', ')}.` : ''} Rytmi johtuu kulutuksesta: aamulla ja alkuillalla kysyntä on suurimmillaan, yöllä pienimmillään. Tuulivoima voi kuitenkin tehdä keskipäivästä halvemman kuin yöstä, joten päivän todellinen halvin jakso kannattaa aina tarkistaa. Sivun päivityspäivänä Helsingin yleissiirrolla halvin kahden tunnin jakso alkoi kello ${v.he.kello(v.he.ik2.i)}, ja sen kokonaishinta oli ${h.c(v.he.ik2.ka)}, kun päivän keskihinta oli ${h.c(v.he.st.ka)}. Yösiirrolla, kuten Elenian, siirtomaksu on lisäksi kello 22–7 halvempi, mikä siirtää halvimman ajan vielä selvemmin yöhön. Alla oleva laskuri kertoo tämän päivän halvimman jakson valitsemallesi kestolle. Laskurin tulos päivittyy joka päivä uusilla hinnoilla, ja huomisen halvimman jakson näet iltapäivällä huomisen hintasivulta, kun pörssi on julkaissut seuraavan vuorokauden hinnat.`;
    },
    faqs: (h) => [
      { q: 'Onko yö aina halvinta aikaa?', a: 'Ei aina. Yö on tavallisesti halpa, koska kulutus on pientä, mutta tuulisena päivänä halvin aika voi olla keskipäivä tai iltapäivä, ja tyynellä pakkasyöllä yöhintakin voi olla korkea. Siksi päivän todelliset hinnat kannattaa tarkistaa laskurista tai huomisen sivulta ennen suuren kulutuksen ajastamista.' },
      { q: 'Miksi aamut ja alkuillat ovat kalliita?', a: 'Silloin kotitalouksien ja palvelujen kulutus on suurimmillaan: herätään, lähdetään töihin, tullaan kotiin, laitetaan ruokaa ja saunotaan. Kun kysyntä kasvaa, hinnan määrää kalliimpi tuotanto tai tuonti. Talvella lämmitys korostaa huippuja entisestään, ja pakkasjaksoina hinnat voivat nousta hyvin korkeiksi. Viikonloppuisin aamuhuippu on yleensä loivempi.' },
      { q: 'Vaikuttaako siirtotuote halvimpaan aikaan?', a: 'Vaikuttaa. Yleissiirrossa siirtomaksu on sama joka tunti, joten halvin aika määräytyy pelkästä pörssihinnasta. Yö- tai aikasiirrossa yön siirto on halvempaa, mikä tekee yötunneista kokonaishinnaltaan houkuttelevampia. Kausisiirrossa talviarkipäivät ovat kalliita. Laskuri ottaa siirtotuotteen huomioon jokaisessa vartissa. Valitse laskuriin oma siirtotuotteesi, niin tulos vastaa laskuasi.' },
      { q: 'Miten halvimman ajan saa hyödynnettyä käytännössä?', a: 'Ajastamalla laitteet. Sähköautoissa, latausasemissa, pesukoneissa ja astianpesukoneissa on ajastin, ja lämminvesivaraajan voi ohjata verkkoyhtiön ohjauksella tai kodin automaatiolla. Motivan mukaan kulutusjousto auttaa myös sähköjärjestelmää. Pörssisopimus kannattaa, jos ajoittaminen onnistuu säännöllisesti. Kun ajastus on kerran asetettu, säästö kertyy ilman päivittäistä vaivaa. Tarkista silti huomisen hinnat iltapäivällä.' },
      { q: 'Paljonko ajoittamalla voi säästää vuodessa?', a: 'Se riippuu siirrettävän kulutuksen määrästä ja hintojen vaihtelusta. Jos siirrät viikossa kaksikymmentä kilowattituntia kalliilta tunneilta halvoille ja hintaero on keskimäärin viisi senttiä, säästö on vuodessa noin viisikymmentä euroa. Sähkölämmitteisessä talossa, jossa varaava lämmitys siirtyy yöhön, säästö voi olla moninkertainen, varsinkin yösiirrolla.' },
    ],
    body: (h) => {
      const v = V(h);
      const rows = v.arki ? v.arki.tunnit.map((x, i) => [tunti(i), `${x >= 0 ? '+' : ''}${h.num(v.eur(x), 2)}`, v.vkl ? `${v.vkl.tunnit[i] >= 0 ? '+' : ''}${h.num(v.eur(v.vkl.tunnit[i]), 2)}` : '–']) : [];
      return `<h2>Tyypillinen vuorokausirytmi</h2>
${rows.length ? h.table(['Tunti', 'Arki: ero päivän keskiarvoon', 'Viikonloppu: ero päivän keskiarvoon'], rows, `Pörssihinnan keskimääräinen poikkeama päivän keskiarvosta, c/kWh sis. alv. Arkistomme toteutuneet varttihinnat (${h.num(v.arki!.paivia)} arkipäivää, ${v.vkl ? h.num(v.vkl.paivia) : 0} viikonloppupäivää).`, ['l', 'r', 'r']) : ''}
<p>Taulukko kertoo, kuinka paljon kunkin tunnin pörssihinta on keskimäärin poikennut saman päivän keskihinnasta. Miinusmerkkiset tunnit ovat olleet keskimäärin halvempia, plusmerkkiset kalliimpia. Profiili lasketaan arkistomme toteutuneista hinnoista, ja se päivittyy joka päivä, kun arkisto kasvaa. Sama profiili on myös keskihinta-arvion pohjana silloin, kun päivän hintoja ei ole vielä julkaistu.</p>
<h2>Tämän päivän halvin jakso</h2>
<p>Keskimääräinen rytmi on hyvä nyrkkisääntö, mutta päivän todelliset hinnat voivat poiketa siitä paljon. Etusivun laskuri etsii valitsemallesi kestolle halvimman yhtenäisen jakson oman verkkoyhtiösi siirrolla. Elenian yösiirrolla sivun päivityspäivän halvin kahden tunnin jakso alkoi kello ${v.el.kello(v.el.ik2.i)}, ja sen kokonaishinta oli ${h.c(v.el.ik2.ka)}. Huomisen halvin jakso selviää ${h.a('huomenna', 'huomisen hintasivulta')} iltapäivällä.</p>
<h2>Mitä kannattaa ajoittaa</h2>
<ul>
<li>${h.a('sahkoauton-lataus', 'Sähköauton lataus')}: suurin joustava kuorma, usein kymmeniä kilowattitunteja.</li>
<li>Lämminvesivaraaja: lämpenee tavallisesti yöllä, ja ohjauksen voi ajastaa halvimpaan jaksoon.</li>
<li>${h.a('pyykinpesu', 'Pyykinpesu')} ja ${h.a('kuivausrumpu', 'kuivausrumpu')}: pieni säästö kerralla, mutta helppo ajastaa.</li>
<li>Varaava lämmitys: varaaja tai lattialämmitys voi ladata lämpöä halvoilla tunneilla.</li>
</ul>
<p>Muista ${h.a('tehomaksu', 'tehomaksu')}, jos tuotteessasi on sellainen: kaikkien kuormien ajaminen samaan aikaan voi nostaa huippua. ${h.src('motivaJousto', 'Motiva')} kertoo kulutusjouston keinoista ja automaatiosta.</p>
<h2>Varttihinta ja halvin aika</h2>
<p>Kun hinta määräytyy varteittain, halvin jakso voi alkaa myös kesken tunnin. Jos sopimuksesi on varttihintainen, ajastus vartin tarkkuudella hyödyttää eniten. Tuntihintaisessa sopimuksessa riittää tunnin tarkkuus. Lue lisää ${h.a('varttihinta', 'varttihinnoittelusta')} ja ${h.a('negatiivinen-hinta', 'negatiivisista hinnoista')}, jotka osuvat usein tuulisiin öihin.</p>
<h2>Vuodenajat muuttavat rytmiä</h2>
<p>Vuorokausirytmi ei ole sama ympäri vuoden. Talvella kulutus on suurimmillaan aamuisin ja alkuillasta, kun ihmiset heräävät, tulevat töistä ja lämmitys käy täysillä. Silloin hintaero yön ja illan välillä on usein suurin, ja yöhön ajoitetusta kulutuksesta saa eniten hyötyä. Kesällä kulutus on pienempää, ja aurinkosähkö painaa keskipäivän hintoja alas aurinkoisina päivinä. Kevään tulva-aikana vesivoimaa on runsaasti, mikä voi pitää hinnat matalina koko vuorokauden.</p>
<p>Tämän vuoksi yllä oleva profiili kuvaa viime viikkojen tilannetta, ja se muuttuu vuodenaikojen mukana. Arkistomme kasvaa joka päivä, joten profiili kattaa ajan myötä kaikki vuodenajat. Kun arkistossa on riittävästi saman kuukauden päiviä, myös keskihinta-arvio lasketaan suoraan saman kuukauden toteutuneista hinnoista.</p>
<h2>Tuulivoima sekoittaa järjestyksen</h2>
<p>Suomen tuulivoimakapasiteetti on kasvanut nopeasti, ja tuulisuus vaikuttaa nyt pörssihintaan enemmän kuin kellonaika. Tuulisena päivänä keskipäivän hinta voi olla lähellä nollaa tai negatiivinen, ja tyynenä pakkasyönä yöhinta voi olla korkea. Siksi pelkän nyrkkisäännön, kuten "yö on halvin", noudattaminen voi joinakin päivinä tulla kalliiksi. Huomisen tarkat hinnat julkaistaan iltapäivällä, ja niiden perusteella laitteet kannattaa ajastaa.</p>
<p>Myös ydinvoimaloiden vuosihuollot ja siirtoyhteyksien rajoitukset vaikuttavat hintoihin. Kun suuri voimalaitos on huollossa tai yhteys Ruotsiin on rajoitettu, Suomen hinta voi nousta selvästi naapurimaita korkeammaksi. Nämä tekijät näkyvät hinnoissa jo päivähuutokaupassa.</p>
<h2>Esimerkki: viikon kulutuksen ajoittaminen</h2>
<p>Oletetaan, että kotitalous lataa sähköautoa kaksi kertaa viikossa, lämmittää lämminvesivaraajan joka yö ja pesee pyykkiä neljä kertaa viikossa. Jos kaikki tämä ajoitetaan päivän halvimpiin jaksoihin, säästö syntyy pörssihinnan erosta ja yösiirrossa myös siirtomaksun erosta. Säästön suuruus riippuu siitä, kuinka paljon hinnat vaihtelevat: hintavaihtelultaan tasaisena päivänä säästö on pieni, voimakkaasti vaihtelevana päivänä suuri. Laitekohtaiset laskurit näyttävät tämän päivän säästön euroina kullekin laitteelle.</p>
<p>Ajoittamisen ei tarvitse olla työlästä. Monessa sähköautossa, latausasemassa ja kodin automaatiojärjestelmässä on pörssihintaohjaus, joka valitsee halvimmat tunnit automaattisesti. Lämminvesivaraajan ohjaus voi perustua verkkoyhtiön ohjaukseen tai omaan ajastimeen. Kun ajastus on kerran asetettu, säästö kertyy ilman päivittäistä vaivaa.</p>
<h2>Halvin aika ja oma kulutusprofiili</h2>
<p>Verkkoyhtiön palvelussa näet oman kulutuksesi tunneittain tai varteittain. Vertaa sitä tämän sivun profiiliin: jos suuri osa kulutuksestasi osuu aamun ja alkuillan kalleimpiin tunteihin, ajoittamisesta on sinulle eniten hyötyä. Jos kulutus on jo valmiiksi painottunut yöhön, esimerkiksi varaavan lämmityksen vuoksi, pörssisopimuksen keskihintasi on todennäköisesti kuukauden keskihintaa matalampi. Kulutuksen seuraaminen kuukauden ajan antaa hyvän kuvan siitä, mitkä laitteet kannattaa ajastaa ensimmäisenä.</p>
<p>Tämän sivuston laskurit käyttävät samoja virallisia lähteitä: pörssihinnat Suomen tarjousalueelta, siirtohinnat verkkoyhtiöiden omista hinnastoista ja verot Verohallinnon taulukosta. Kaikki laskenta tapahtuu selaimessasi, eikä syöttämiäsi tietoja lähetetä minnekään. Hinnat päivittyvät joka päivä automaattisesti, ja jos päivän pörssihintoja ei ole saatavilla, laskuri näyttää selvästi merkityn keskihinta-arvion. Lisätietoa laskentatavasta, lähteistä ja rajoituksista on menetelmäsivulla.</p>`;
    },
  },
  en: {
    slug: 'cheapest-time-to-use-electricity',
    nav: 'Cheapest time to use power',
    card: 'When Finnish spot electricity is typically cheapest and how to find the cheapest window.',
    title: 'Cheapest Time to Use Electricity Finland 2026: Cheap Hours',
    description: 'Cheapest time to use electricity in Finland, 2026: the typically cheapest and dearest spot hours on weekdays and weekends, and today’s cheapest window.',
    h1: 'When is electricity cheapest?',
    intro: 'The spot price follows a daily rhythm, but wind often reshuffles it. Here are the typical cheap hours and today’s cheapest window.',
    resume: (h) => {
      const v = V(h);
      const a = v.arki, w = v.vkl;
      return `${a ? `Based on actual quarter-hour prices for ${h.num(a.paivia)} weekdays in our archive, spot electricity has on weekdays been cheapest on average in the hours ${a.halvimmat.map(tunti).join(', ')} and dearest in ${a.kalleimmat.map(tunti).join(', ')}.` : ''} ${w ? `At weekends (${h.num(w.paivia)} days) the cheapest hours have been ${w.halvimmat.map(tunti).join(', ')}.` : ''} The rhythm follows demand: it peaks in the morning and early evening and is lowest at night. Wind power can make midday cheaper than night, though, so always check the day’s real cheapest window. On the page’s update day, Helsinki’s general transfer had its cheapest two-hour window starting at ${v.he.kello(v.he.ik2.i)}, at an all-in ${h.c(v.he.ik2.ka)} against a day average of ${h.c(v.he.st.ka)}. On night transfer, such as Elenia’s, the transfer fee is also lower from 22:00 to 07:00, pushing the cheapest time further into the night. The calculator below shows today’s cheapest window for the length you choose.`;
    },
    faqs: (h) => [
      { q: 'Is night always the cheapest time?', a: 'Not always. Night is usually cheap because demand is low, but on a windy day the cheapest time may be midday or afternoon, and on a still, frosty night prices can be high. Check the day’s real prices in the calculator or on the tomorrow page before scheduling a large load.' },
      { q: 'Why are mornings and early evenings expensive?', a: 'That is when household and service demand peaks: people get up, leave for work, come home, cook and use the sauna. As demand rises, dearer generation or imports set the price. In winter heating sharpens the peaks, and in cold spells prices can climb very high.' },
      { q: 'Does my transfer product change the cheapest time?', a: 'Yes. On general transfer the fee is the same every hour, so the cheapest time follows the spot price alone. On night or time-of-day transfer night transfer is cheaper, making night hours more attractive all-in. On seasonal transfer winter weekdays are dear. The calculator accounts for your product in every quarter.' },
      { q: 'How do I make use of the cheapest time in practice?', a: 'By setting timers. Electric cars, chargers, washing machines and dishwashers have timers, and a water heater can be controlled by the operator’s switching or home automation. Motiva says demand flexibility also helps the power system. A spot contract pays if you manage to time use regularly.' },
      { q: 'How much can timing save in a year?', a: 'It depends on how much use you shift and how much prices swing. Shifting twenty kilowatt-hours a week from expensive to cheap hours at an average gap of five cents saves about fifty euros a year. In an electrically heated house moving storage heating to the night can save several times that, especially on night transfer.' },
    ],
    body: (h) => {
      const v = V(h);
      const rows = v.arki ? v.arki.tunnit.map((x, i) => [tunti(i), `${x >= 0 ? '+' : ''}${h.num(v.eur(x), 2)}`, v.vkl ? `${v.vkl.tunnit[i] >= 0 ? '+' : ''}${h.num(v.eur(v.vkl.tunnit[i]), 2)}` : '–']) : [];
      return `<h2>The typical daily rhythm</h2>
${rows.length ? h.table(['Hour', 'Weekday: gap to day average', 'Weekend: gap to day average'], rows, `Average deviation of the spot price from the day’s mean, c/kWh incl. VAT. Actual quarter-hour prices from our archive (${h.num(v.arki!.paivia)} weekdays, ${v.vkl ? h.num(v.vkl.paivia) : 0} weekend days).`, ['l', 'r', 'r']) : ''}
<p>The table shows how far each hour’s spot price has on average deviated from the same day’s mean. Negative hours have been cheaper on average, positive ones dearer. The profile is computed from actual prices in our archive and refreshes daily as the archive grows. The same profile underpins the average-price estimate when the day’s prices are not yet published.</p>
<h2>Today’s cheapest window</h2>
<p>The average rhythm is a good rule of thumb, but the day’s real prices can differ a lot. The home page calculator finds the cheapest continuous window for the length you choose on your own operator’s transfer. On Elenia’s night transfer the update day’s cheapest two-hour window started at ${v.el.kello(v.el.ik2.i)}, at an all-in ${h.c(v.el.ik2.ka)}. Tomorrow’s cheapest window appears on the ${h.a('huomenna', 'tomorrow page')} in the afternoon.</p>
<h2>What to time</h2>
<ul>
<li>${h.a('sahkoauton-lataus', 'Car charging')}: the largest flexible load, often tens of kilowatt-hours.</li>
<li>Water heater: usually heats at night, and its control can be set to the cheapest window.</li>
<li>${h.a('pyykinpesu', 'Washing')} and ${h.a('kuivausrumpu', 'drying')}: a small saving each time, but easy to time.</li>
<li>Storage heating: a heat store or underfloor heating can charge up in cheap hours.</li>
</ul>
<p>Remember the ${h.a('tehomaksu', 'power fee')} if your product has one: running every load at once can raise the peak. ${h.src('motivaJousto', 'Motiva')} explains demand flexibility and automation.</p>
<h2>Quarter-hour prices and the cheapest time</h2>
<p>With prices set per quarter, the cheapest window can start mid-hour. On a quarter-hour contract, timing to the quarter helps most; on an hourly contract, the hour is enough. Read more about ${h.a('varttihinta', 'quarter-hour pricing')} and ${h.a('negatiivinen-hinta', 'negative prices')}, which often fall on windy nights.</p>
<h2>Seasons change the rhythm</h2>
<p>The daily rhythm is not the same all year. In winter demand peaks in the morning and early evening, when people wake up, come home and heating runs flat out, so the gap between night and evening is often widest and night-time use pays most. In summer demand is lower and solar power pulls midday prices down on sunny days. During the spring flood plentiful hydro can keep prices low around the clock.</p>
<p>The profile above therefore describes recent weeks and shifts with the seasons. Our archive grows every day, so over time the profile covers every season, and once there are enough days of the same month the average-price estimate is also built directly from that month’s actual prices.</p>
<h2>Wind reshuffles the order</h2>
<p>Finland’s wind capacity has grown fast, and windiness now moves the spot price more than the clock. On a windy day midday can be near zero or negative, while on a still, frosty night prices can be high. Following a rule of thumb such as “night is cheapest” can therefore cost money on some days. Tomorrow’s exact prices come out in the afternoon, and they are the basis for setting timers. Nuclear outages and limits on links to Sweden also lift the Finnish price above its neighbours at times.</p>`;
    },
  },
});
