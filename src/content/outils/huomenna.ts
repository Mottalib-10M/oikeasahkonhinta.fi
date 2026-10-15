import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { MARG, porssi } from '../../lib/arvot';

/** Huomenna : prix de demain dès 13 h 45 ; avant publication, estimation affichée comme telle. */
const V = (h: Helpers) => {
  const { M, S } = h;
  const pv = M.lisaaPaivia(S.tanaan, 1);
  const s = M.sarja(S, pv);
  const tu = M.tuote(M.verkko('elenia')!, 'aika')!;
  const q = M.vartit(s, tu, porssi);
  const st = M.tilasto(q.map((x) => x.yhteensa));
  const spot = M.tilasto(q.map((x) => x.spot));
  const ik = M.halvinIkkuna(q.map((x) => x.yhteensa), 12);
  const julkaistu = s.tila === 'toteutunut';
  return { pv, s, q, st, spot, ik, julkaistu, tu, kl: (i: number) => (q[i] ? M.kello(q[i].t) : '') };
};

export default defineGuide({
  id: 'huomenna',
  group: 'hinta',
  order: 10,
  tool: 'huomenna',
  toolProps: { verkko: 'elenia', tuote: 1, sulake: 1 },
  related: ['varttihinta', 'halvin-aika', 'sahkoauton-lataus', 'negatiivinen-hinta', 'kuukausihinnat'],
  sources: ['nordpool', 'entsoe', 'elenia', 'veroTaulukko'],
  fi: {
    slug: 'porssisahko-huomenna',
    nav: 'Pörssisähkö huomenna',
    card: 'Huomisen 96 varttihintaa siirron ja verojen kanssa heti julkaisun jälkeen.',
    title: 'Pörssisähkö huomenna 2026: varttihinnat siirron kanssa',
    description: 'Pörssisähkön hinta huomenna 2026: huomisen varttihinnat julkaistaan noin klo 13:45. Näe kokonaishinta oman verkkoyhtiösi siirrolla ja huomisen halvin jakso.',
    h1: 'Pörssisähkö huomenna: huomisen hinnat kokonaisuudessaan',
    intro: 'Huomisen pörssihinnat ratkeavat keskipäivän huutokaupassa. Täällä ne muuttuvat hinnaksi, jonka oikeasti maksat.',
    resume: (h) => {
      const v = V(h);
      return v.julkaistu
        ? `Huomisen ${h.date(v.pv)} pörssihinnat on julkaistu. Suomen tarjousalueen keskihinta on ${h.c(v.spot.ka)} arvonlisäveron kanssa, halvin vartti ${h.c(v.spot.min)} ja kallein ${h.c(v.spot.max)}. Kun mukaan lasketaan ${h.c(MARG)} marginaali, sähkövero ja Elenian yösiirto, joka on päivällä ${h.c(v.tu.energia.paiva!)} ja yöllä ${h.c(v.tu.energia.yo!)}, huomisen kokonaishinta vaihtelee ${h.c(v.st.min)} ja ${h.c(v.st.max)} välillä ja on keskimäärin ${h.c(v.st.ka)}. Halvin kolmen tunnin jakso alkaa kello ${v.kl(v.ik.i)}. Valitse oma verkkoyhtiösi, siirtotuotteesi ja sopimuksesi, niin laskuri näyttää jokaisen vartin hinnan ja huomisen halvimman aloitusajan juuri sinun laskullesi. Hinnat eivät muutu enää julkaisun jälkeen, joten voit ajastaa sähköauton latauksen, lämminvesivaraajan tai pyykinpesun jo edellisenä iltana. Kokonaishinnassa ovat mukana myyjän marginaali, siirtomaksu, sähkövero ja huoltovarmuusmaksu sekä arvonlisävero 25,5 prosenttia, eli täsmälleen ne osat, joista oma sähkölaskusi koostuu.`
        : `Huomisen ${h.date(v.pv)} pörssihintoja ei ollut vielä julkaistu, kun tämä sivu päivittyi. Ne ratkeavat sähköpörssin päivähuutokaupassa keskipäivällä Keski-Euroopan aikaa ja ilmestyvät Suomessa tavallisesti noin kello ${h.P.markkina.julkaisu_fi_klo}, minkä jälkeen laskuri vaihtaa ne automaattisesti näkyviin. Sitä ennen luvut ovat keskihinta-arvioita: saman kuukauden ja viikonpäivätyypin toteutuneiden hintojen keskiarvo vartti kerrallaan, ja ne on merkitty laskurissa keltaisella. Arvion mukaan huomisen kokonaishinta Elenian yösiirrolla ja ${h.c(MARG)} marginaalilla olisi keskimäärin ${h.c(v.st.ka)}, vaihteluväli ${h.c(v.st.min)}–${h.c(v.st.max)}. Arvio kertoo tavallisen päivän rytmin, mutta ei tuulen tai voimalaitosten huollon vaikutusta, joten tarkista oikeat hinnat iltapäivällä ennen kuin ajastat sähköauton latauksen tai muun suuren kulutuksen. Laskuri on valmiiksi asetettu Elenian yösiirtoon, mutta voit vaihtaa siihen oman verkkoyhtiösi, siirtotuotteesi ja sopimuksesi, jolloin sekä arvio että myöhemmin julkaistavat oikeat hinnat lasketaan juuri sinun laskusi mukaan.`;
    },
    faqs: (h) => [
      { q: 'Mihin kellonaikaan huomisen sähkön hinta tulee?', a: `Huutokauppa suljetaan keskipäivällä Keski-Euroopan aikaa, eli kello 13 Suomen aikaa, ja tulokset julkaistaan yleensä noin kello ${h.P.markkina.julkaisu_fi_klo}. Joskus julkaisu viivästyy teknisen ongelman tai uusintalaskennan vuoksi. Sivu tarkistaa hinnat automaattisesti uudelleen tuntia myöhemmin, ja selaimesi hakee uusimman hintatiedoston aina, kun avaat sivun. Ennen julkaisua näet huomiselle keskihinta-arvion.` },
      { q: 'Voivatko huomisen hinnat vielä muuttua julkaisun jälkeen?', a: 'Päivähuutokaupan hinnat ovat lopullisia, kun ne on julkaistu. Harvinaisessa poikkeustilanteessa pörssi voi julkaista hinnat ensin alustavina ja vahvistaa ne myöhemmin; laskuri merkitsee alustavat hinnat. Myyjäsi laskuttaa pörssisopimuksessa juuri näillä hinnoilla, joihin lisätään sopimuksen marginaali ja arvonlisävero. Siirtomaksu ja sähkövero tulevat verkkoyhtiön laskulla.' },
      { q: 'Kannattaako sähköauto ladata huomenna yöllä?', a: 'Usein kannattaa, mutta ei aina. Yöt ovat tavallisesti halvimpia, koska kulutus on pientä, mutta tuulisena päivänä halvin jakso voi osua keskelle päivää. Aikasiirrolla yön siirtomaksu on lisäksi halvempi. Aseta laskuriin latauksen kesto, niin näet huomisen halvimman aloitusajan kokonaishinnalla. Sähköautolaskuri kertoo saman suoraan euroina.' },
      { q: 'Miksi huomisen hinta on näkyvissä arviona?', a: `Arvio näkyy ennen kuin oikeat hinnat on julkaistu, tavallisesti aamusta noin kello ${h.P.markkina.julkaisu_fi_klo} asti. Se lasketaan toteutuneista hinnoista saman kuukauden ja viikonpäivätyypin mukaan, ja se on merkitty keltaisella. Oikeat hinnat korvaavat sen automaattisesti, kun ne ovat saatavilla, eikä sivua tarvitse ladata uudelleen. Arviota ei kannata käyttää tarkkaan ajastukseen.` },
      { q: 'Paljonko kallein ja halvin vartti eroavat laskulla?', a: 'Ero on pörssihintojen ero arvonlisäveron kanssa, sillä marginaali ja sähkövero ovat jokaisena hetkenä samat. Yleissiirrossa siirtomaksu ei muutu, aikasiirrossa se on yöllä halvempi ja kasvattaa eroa. Siirtämällä kymmenen kilowattituntia kalleimmalta vartilta halvimmalle säästät eron kymmenkertaisena sentteinä. Laskuri näyttää päivän halvimman ja kalleimman vartin rinnakkain.' },
    ],
    body: (h) => {
      const v = V(h);
      return `<h2>Miten huomisen hinta muodostuu</h2>
<p>Pohjoismaisen sähköpörssin päivähuutokaupassa sähkön tuottajat ja ostajat jättävät tarjouksensa seuraavan vuorokauden jokaiselle vartille. Huutokauppa suljetaan keskipäivällä, ja algoritmi laskee jokaiselle tarjousalueelle hinnan, jolla kysyntä ja tarjonta kohtaavat siirtoyhteyksien rajoissa. Suomi on oma tarjousalueensa, joten Suomen hinta voi poiketa Ruotsin tai Viron hinnasta, kun yhteydet ovat täynnä. Huomisen hinnat ovat lopullisia, kun ne on julkaistu, ja ne ovat samat kaikille pörssisopimuksen asiakkaille, ennen marginaalia, siirtoa ja veroja.</p>
<h2>Huomisen hinnat oman verkkoyhtiösi mukaan</h2>
<p>Laskuri on valmiiksi asetettu Elenian yösiirtoon, koska se on yleinen valinta sähkölämmitteisissä omakotitaloissa. Yösiirrossa siirtomaksu vaihtuu kello 22 halvempaan yöhintaan ja kello 7 takaisin päivähintaan. Siksi yön vartit ovat kokonaishinnaltaan halvempia kuin pörssihinta yksin antaisi ymmärtää, ja kello 21:45 ja 22:00 alkavien varttien välillä voi olla selvä hyppäys, vaikka pörssihinta ei muuttuisi lainkaan. Vaihda verkkoyhtiö ja siirtotuote omiksesi; yleissiirrossa siirtomaksu on sama ympäri vuorokauden.</p>
<h2>Huomisen suunnittelu kolmessa vaiheessa</h2>
<ol>
<li>Avaa sivu iltapäivällä kello ${h.P.markkina.julkaisu_fi_klo} jälkeen ja tarkista, että hintatila kertoo julkaistuista hinnoista eikä arviosta.</li>
<li>Aseta halvimman jakson kesto: esimerkiksi kolme tuntia sähköauton lataukselle tai puolitoista tuntia saunalle. Laskuri näyttää jakson alkamisajan ja keskihinnan.</li>
<li>Ajasta laite. Monessa sähköautossa, latausasemassa, lämminvesivaraajan ohjauksessa ja pesukoneessa on ajastin, jolla aloitus osuu juuri oikeaan varttiin.</li>
</ol>
<p>Laitekohtaiset laskurit näyttävät suoraan, mitä ${h.a('sahkoauton-lataus', 'sähköauton lataus')}, ${h.a('saunan-hinta', 'saunan lämmitys')} tai ${h.a('pyykinpesu', 'pyykinpesu')} huomenna maksaa halvimmalla ja kalleimmalla aloitusajalla.</p>
<h2>Kun huominen näkyy arviona</h2>
<p>Aamulla ja aamupäivällä huomisen hintoja ei vielä ole. Silloin laskuri näyttää keskihinta-arvion ja kertoo sen keltaisella tekstillä. Arvio perustuu toteutuneisiin varttihintoihin saman kuukauden ja saman päivätyypin, arjen tai viikonlopun, päiviltä. Kun arkistossa ei vielä ole kuukaudesta riittävästi päiviä, arvio on kuukauden virallinen keskihinta, jonka päälle lisätään tyypillinen vuorokausirytmi. Arvio on hyvä yleiskuva siitä, ovatko yöt ja aamut tavallisesti halpoja, mutta se ei tiedä huomisesta tuulesta, lämpötilasta tai ydinvoimalan vuosihuollosta. Kun oikeat hinnat julkaistaan, laskuri vaihtaa ne näkyviin itsestään eikä sivua tarvitse ladata uudelleen.</p>
<h2>Huomisen hinnat ja sopimustyyppi</h2>
<p>Huomisen varttihinnat koskevat suoraan vain pörssisopimusta. Kiinteähintaisessa sopimuksessa energian hinta on sama joka hetki, ja kulutuksen ajoituksella on merkitystä vain, jos siirtotuotteesi on aika- tai kausisiirto. Silloinkin säästö syntyy vain siirtomaksun erosta. Pörssisopimuksessa ajoittaminen säästää sekä energiassa että mahdollisesti siirrossa. Vertaa sopimustyyppejä omalla kulutuksellasi ${h.a('porssi-vai-kiintea', 'pörssi vai kiinteä -laskurissa')} ja tutustu ${h.a('varttihinta', 'varttihinnoitteluun')}, jos sopimuksesi on vaihtunut tuntihinnasta varttihintaan.</p>`;
    },
  },
  en: {
    slug: 'spot-electricity-price-tomorrow',
    nav: 'Spot price tomorrow',
    card: 'Tomorrow’s 96 quarter-hour prices with transfer and tax as soon as they are out.',
    title: 'Electricity Price Tomorrow Finland 2026: All-in by Quarter',
    description: 'Finnish spot electricity price tomorrow, 2026: prices appear at about 13:45. See the all-in price with your network’s transfer fee and the cheapest window.',
    h1: 'Spot electricity tomorrow: tomorrow’s prices in full',
    intro: 'Tomorrow’s exchange prices are set in the noon auction. Here they become the price you actually pay.',
    resume: (h) => {
      const v = V(h);
      return v.julkaistu
        ? `Tomorrow’s exchange prices for ${h.date(v.pv)} have been published. The Finnish bidding-zone average is ${h.c(v.spot.ka)} including VAT, the cheapest quarter ${h.c(v.spot.min)} and the dearest ${h.c(v.spot.max)}. Adding a ${h.c(MARG)} margin, electricity tax and Elenia’s night transfer, which is ${h.c(v.tu.energia.paiva!)} by day and ${h.c(v.tu.energia.yo!)} at night, tomorrow’s all-in price ranges from ${h.c(v.st.min)} to ${h.c(v.st.max)} and averages ${h.c(v.st.ka)}. The cheapest three-hour window starts at ${v.kl(v.ik.i)}. Choose your own operator, transfer product and contract and the calculator shows the price of every quarter hour and tomorrow’s cheapest start time for your own bill. The prices do not change after publication.`
        : `Tomorrow’s exchange prices for ${h.date(v.pv)} had not been published when this page last updated. They are set in the power exchange’s day-ahead auction at noon Central European time and usually appear in Finland at about ${h.P.markkina.julkaisu_fi_klo}, after which the calculator switches to them automatically. Until then the figures are average-price estimates: the quarter-by-quarter average for the same month and type of day. On that estimate tomorrow’s all-in price on Elenia’s night transfer with a ${h.c(MARG)} margin would average ${h.c(v.st.ka)}, ranging from ${h.c(v.st.min)} to ${h.c(v.st.max)}. The estimate shows a normal day’s rhythm but not the effect of wind or plant maintenance, so check the real prices in the afternoon before scheduling car charging or another large load. The calculator is preset to Elenia’s night transfer; switch it to your own operator, product and contract and both the estimate and the real prices will be calculated for your own bill.`;
    },
    faqs: (h) => [
      { q: 'What time do tomorrow’s Finnish electricity prices come out?', a: `The auction closes at noon Central European time, 13:00 in Finland, and results are usually published at about ${h.P.markkina.julkaisu_fi_klo}. Occasionally publication is delayed by a technical issue or a recalculation. The page checks again automatically an hour later, and your browser loads the latest price file whenever you open the page.` },
      { q: 'Can tomorrow’s prices still change after publication?', a: 'Day-ahead prices are final once published. In a rare exception the exchange may publish preliminary prices and confirm them later; the calculator marks preliminary prices. On a spot contract your retailer bills exactly these prices, plus the contract margin and VAT, while transfer and tax come on the network bill.' },
      { q: 'Is it worth charging the car tomorrow night?', a: 'Often, but not always. Nights are usually cheapest because demand is low, but on a windy day the cheapest window can fall in the middle of the day. On time-of-day transfer the night fee is also lower. Set the charging length in the calculator to see tomorrow’s cheapest start at the all-in price.' },
      { q: 'Why is tomorrow shown as an estimate?', a: `The estimate shows before real prices are published, usually from the morning until about ${h.P.markkina.julkaisu_fi_klo}. It is built from actual prices for the same month and type of day and marked in amber. Real prices replace it automatically as soon as they are available.` },
      { q: 'How much do the dearest and cheapest quarters differ on the bill?', a: 'The difference is the gap between exchange prices with VAT, since the margin and electricity tax are the same at every moment. On general transfer the fee does not change; on time-of-day transfer it is lower at night and widens the gap. Moving ten kilowatt-hours from the dearest quarter to the cheapest saves ten times the gap in cents.' },
    ],
    body: (h) => `<h2>How tomorrow’s price is formed</h2>
<p>In the Nordic exchange’s day-ahead auction, producers and buyers submit bids for every quarter hour of the next day. The auction closes at noon and an algorithm finds, for each bidding zone, the price at which supply meets demand within the limits of the interconnectors. Finland is its own bidding zone, so its price can differ from Sweden’s or Estonia’s when the links are full. Tomorrow’s prices are final once published and the same for every spot customer, before margin, transfer and taxes.</p>
<h2>Tomorrow’s prices for your own network</h2>
<p>The calculator is preset to Elenia’s night transfer, a common choice in electrically heated houses. On night transfer the fee drops to the night rate at 22:00 and returns to the day rate at 07:00. That makes night quarters cheaper all-in than the exchange price alone suggests, and there can be a clear step between the quarters starting at 21:45 and 22:00 even if the exchange price does not move. Switch the operator and transfer product to your own; on general transfer the fee is the same around the clock.</p>
<h2>Planning tomorrow in three steps</h2>
<ol>
<li>Open the page after ${h.P.markkina.julkaisu_fi_klo} and check that the price status refers to published prices, not an estimate.</li>
<li>Set the length of the cheapest window: three hours for charging an electric car, say, or an hour and a half for the sauna. The calculator shows when the window starts and its average price.</li>
<li>Schedule the appliance. Many electric cars, chargers, water heater controls and washing machines have a timer that lets you start at exactly the right quarter.</li>
</ol>
<p>The appliance calculators show directly what ${h.a('sahkoauton-lataus', 'charging an electric car')}, ${h.a('saunan-hinta', 'heating the sauna')} or ${h.a('pyykinpesu', 'a wash')} costs tomorrow at the cheapest and dearest start.</p>
<h2>When tomorrow appears as an estimate</h2>
<p>In the morning tomorrow’s prices do not exist yet. The calculator then shows an average-price estimate and says so in amber. It is based on actual quarter-hour prices for days of the same month and type, weekday or weekend. While the archive does not yet hold enough days of that month, it uses the official monthly average with a typical daily rhythm on top. The estimate gives a fair picture of whether nights and mornings are usually cheap, but it knows nothing of tomorrow’s wind, temperature or a nuclear plant’s annual outage. When real prices are published the calculator switches to them on its own, with no need to reload.</p>
<h2>Tomorrow’s prices and your contract type</h2>
<p>Tomorrow’s quarter-hour prices apply directly only to a spot contract. On a fixed-price contract energy costs the same at every moment, and timing only matters if your transfer product is time-of-day or seasonal, where the saving comes from the transfer fee alone. On a spot contract timing saves on energy and possibly on transfer too. Compare contract types on your own consumption with the ${h.a('porssi-vai-kiintea', 'spot or fixed calculator')} and read about ${h.a('varttihinta', 'quarter-hour pricing')} if your contract has moved from hourly to quarter-hour prices.</p>`,
  },
});
