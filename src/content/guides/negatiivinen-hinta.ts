import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { MARG } from '../../lib/arvot';

const V = (h: Helpers) => {
  const { M, S } = h;
  // Jours archivés (≈ 60 derniers) : quarts à prix négatif.
  const paivat = Object.values(S.paivat);
  const pv = S.paivakeskiarvot;
  const negPaivat = pv.filter((d) => d[2] < 0);
  const min = pv.reduce((a, b) => (b[2] < a[2] ? b : a), pv[0]);
  const helen = M.tuote(M.verkko('helen')!, 'yleis')!.energia.kaikki!;
  const jse = M.tuote(M.verkko('jse')!, 'yleis')!.energia.kaikki!;
  const esim = M.kwhHinta(-10, helen, { tyyppi: 'porssi', marginaali: MARG, kiintea: 0 });
  const raja = -((helen + M.VERO_C + MARG) / (1 + M.ALV)) * 10; // €/MWh où le total s'annule
  const rajaJse = -((jse + M.VERO_C + MARG) / (1 + M.ALV)) * 10;
  void paivat;
  return { negPaivat, n: pv.length, min, helen, esim, raja, rajaJse };
};

export default defineGuide({
  id: 'negatiivinen-hinta',
  group: 'opas',
  order: 40,
  mini: 'negatiivinen',
  related: ['varttihinta', 'halvin-aika', 'sahkovero', 'kuukausihinnat', 'huomenna'],
  sources: ['nordpool', 'entsoe', 'veroTaulukko', 'motivaJousto'],
  fi: {
    slug: 'negatiivinen-sahkon-hinta',
    nav: 'Negatiivinen hinta',
    card: 'Miksi pörssisähkön hinta painuu joskus alle nollan ja mitä kuluttaja silloin maksaa.',
    title: 'Negatiivinen sähkön hinta 2026: mitä silloin oikeasti maksat',
    description: 'Negatiivinen sähkön hinta 2026: miksi pörssihinta painuu alle nollan, kuinka usein niin käy ja mitä kilowattitunti silloin maksaa siirron ja sähköveron kanssa.',
    h1: 'Negatiivinen sähkön hinta: saako sähköä ilmaiseksi?',
    intro: 'Pörssihinta voi olla negatiivinen, mutta kuluttajan kokonaishinta pysyy lähes aina plussalla. Laskuri kertoo, paljonko.',
    resume: (h) => {
      const v = V(h);
      return `Pörssisähkön hinta painuu Suomessa ajoittain alle nollan, kun tuulivoimaa on paljon ja kulutus pientä. Arkistomme viimeisten ${h.num(v.n)} päivän aikana negatiivisia hintoja oli ${h.num(v.negPaivat.length)} päivänä, ja alin vartti oli ${h.date(v.min[0])} ${h.num(v.min[2], 2)} euroa megawattitunnilta. Negatiivinen pörssihinta ei kuitenkaan tee sähköstä ilmaista. Siirtomaksu, sähkövero ja myyjän marginaali maksetaan aina. Esimerkiksi pörssihinnalla −10 euroa megawattitunnilta kilowattitunti maksaa Helsingissä Helenin yleissiirrolla kaikkineen ${h.c(v.esim.yhteensa)}. Jotta kokonaishinta menisi Helsingissä nollaan, pörssihinnan pitäisi olla noin ${h.num(v.raja, 0)} euroa megawattitunnilta, ja Järvi-Suomen Energian alueella noin ${h.num(v.rajaJse, 0)} euroa. Negatiivisesta hinnasta hyötyy vain pörssisopimuksen asiakas, ja eniten se, joka pystyy siirtämään kulutusta juuri niille tunneille. Negatiiviset tunnit osuvat tavallisesti tuulisiin öihin ja viikonloppuihin, ja ne näkyvät huomisen hinnoissa jo edellisenä iltapäivänä. Alla olevalla laskurilla voit kokeilla, mitä kilowattitunti maksaa eri negatiivisilla hinnoilla oman verkkoyhtiösi siirrolla.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miksi sähkön hinta voi olla negatiivinen?', a: 'Kun tuotantoa on enemmän kuin kysyntää ja siirtoyhteydet naapurimaihin ovat täynnä, osa tuottajista on valmis maksamaan siitä, että saa jatkaa tuotantoa. Tuulivoimaloiden tuet, voimalaitosten käynnistys- ja pysäytyskustannukset ja sopimukset voivat tehdä tuotannon jatkamisesta kannattavampaa kuin pysäyttämisen. Silloin markkinahinta laskee alle nollan.' },
        { q: 'Saako kuluttaja rahaa negatiivisella hinnalla?', a: `Harvoin. Pörssisopimuksessa energian osuus on negatiivinen, mutta siirtomaksu ja sähkövero, yhteensä Helsingissä ${h.c(v.helen + h.M.VERO_C)}, maksetaan silti. Siksi kokonaishinta pysyy plussalla, ellei pörssihinta ole erittäin syvällä miinuksella. Helsingissä raja on noin ${h.num(v.raja, 0)} euroa megawattitunnilta. Pienikin negatiivinen hinta laskee kuitenkin kokonaishintaa. Laskuri näyttää tarkan luvun omalle verkollesi.` },
        { q: 'Lasketaanko negatiivisesta hinnasta arvonlisävero?', a: 'Laskurimme laskee arvonlisäveron myös negatiiviselle pörssihinnalle, jolloin hyvitys kasvaa veron verran. Sähkönmyyjät voivat käsitellä negatiivisia tunteja eri tavoin, esimerkiksi lattiahinnan tai erillisen ehdon avulla. Tarkista oman sopimuksesi ehdot, sillä joissakin sopimuksissa energian hinta ei voi laskea alle nollan. Laskuri noudattaa tätä tapaa.' },
        { q: 'Mitä negatiivisilla tunneilla kannattaa tehdä?', a: 'Siirtää joustavaa kulutusta niille: ladata sähköauto, lämmittää lämminvesivaraaja, pestä ja kuivata pyykki tai lämmittää taloa varaavasti. Negatiiviset tunnit ovat usein yöllä tai viikonloppuna tuulisella säällä. Huomisen hinnat näet iltapäivällä, joten negatiivisiin tunteihin voi varautua ajastamalla laitteet. Myös varaava lämmitys hyötyy negatiivisista tunneista.' },
      { q: 'Onko negatiivinen hinta merkki sähkön ylitarjonnasta?', a: 'Kyllä, hetkellisesti. Negatiivinen hinta kertoo, että tuotantoa on enemmän kuin kysyntää eikä ylijäämää saada siirrettyä naapurimaihin. Se ei tarkoita, että sähköä olisi pysyvästi liikaa, vaan että joustava kulutus ja varastointi eivät vielä riitä tasaamaan tuotannon vaihtelua. Joustavan kulutuksen ja sähkövarastojen lisääntyessä negatiivisten tuntien määrä voi muuttua.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      const rajat = h.M.VERKOT.map((vk) => { const c = vk.tuotteet[0].energia.kaikki!; return [h.a(`siirto-${vk.id}`, vk.lyhyt), h.c(c), `${h.num(-((c + h.M.VERO_C + MARG) / (1 + h.M.ALV)) * 10, 0)} €/MWh`]; });
      return `<h2>Kuinka usein hinta on negatiivinen</h2>
<p>Negatiiviset hinnat ovat Suomessa yleistyneet tuulivoiman lisääntyessä. Ne osuvat tavallisesti tuulisiin öihin, viikonloppuihin ja kevään tulva-aikaan, jolloin myös vesivoimaa on paljon. Arkistomme kattaa varttihinnat noin kahden kuukauden ajalta, ja se kasvaa joka päivä. ${v.negPaivat.length ? `Viimeisten ${h.num(v.n)} päivän aikana negatiivinen vartti esiintyi ${h.num(v.negPaivat.length)} päivänä.` : 'Viimeisten päivien aikana negatiivisia vartteja ei esiintynyt.'} Päivittäiset hinnat näet ${h.a('kuukausihinnat', 'kuukausihintojen sivulta')} ja pörssin omasta ${h.src('nordpool', 'hintapalvelusta')}.</p>
<h2>Missä pörssihinnassa kokonaishinta on nolla</h2>
${h.table(['Verkkoyhtiö', 'Yleissiirto', 'Kokonaishinta 0, kun pörssihinta on'], rajat, `Laskettu yleissiirrolla, sähkövero ${h.c(h.M.VERO_C, 4)} ja marginaali ${h.c(MARG)} mukana, alv myös negatiiviselle pörssihinnalle.`, ['l', 'r', 'r'])}
<p>Taulukko näyttää, kuinka syvälle pörssihinnan pitäisi painua, jotta kuluttajan kokonaishinta menisi nollaan. Mitä kalliimpi siirto, sitä syvemmälle. Tällaiset hinnat ovat harvinaisia, joten negatiivinen pörssihinta tarkoittaa kuluttajalle käytännössä tavallista halvempaa sähköä, ei ilmaista.</p>
<h2>Sähkövero ei jousta</h2>
<p>Sähkövero ja huoltovarmuusmaksu, ${h.c(h.M.VERO_C, 4)} kilowattitunnilta, ${h.src('veroTaulukko', 'Verohallinnon taulukon')} mukaan, peritään jokaisesta kilowattitunnista pörssihinnasta riippumatta. Samoin siirtomaksu. Siksi negatiivisen hinnan hyöty on kuluttajalle pienempi kuin pörssihinnasta voisi päätellä.</p>
<h2>Negatiivinen hinta ja oma aurinkosähkö</h2>
<p>Aurinkosähkön tuottajalle negatiivinen hinta on huono uutinen: verkkoon myydystä sähköstä voi joutua maksamaan, jos myyntisopimus seuraa pörssihintaa. Moni sopimus ja invertteri mahdollistaa syötön rajoittamisen negatiivisilla tunneilla. Silloin oman tuotannon käyttäminen itse, esimerkiksi lämminvesivaraajan lämmittämiseen, on parempi vaihtoehto. ${h.src('motivaJousto', 'Motiva')} kertoo kulutusjouston keinoista.</p>
<h2>Miten negatiivisiin tunteihin varaudutaan</h2>
<p>Huomisen hinnat julkaistaan iltapäivällä, joten negatiiviset tunnit näkyvät ${h.a('huomenna', 'huomisen hintasivulla')} edellisenä päivänä. Ajasta sähköauton lataus, pyykinpesu ja lämminvesivaraaja niille. ${h.a('halvin-aika', 'Halvimman ajan opas')} kertoo, milloin halvat tunnit tyypillisesti ovat.</p>
<h2>Miksi tuottajat maksavat tuotannostaan</h2>
<p>Negatiivinen hinta kuulostaa oudolta, mutta sillä on selvä logiikka. Osa voimalaitoksista ei voi pysähtyä ja käynnistyä nopeasti tai edullisesti, joten niiden on kannattavampaa jatkaa tuotantoa lyhyen negatiivisen jakson yli kuin pysäyttää laitos. Osa tuulivoimasta on myyty pitkillä sopimuksilla, joissa tuottaja saa tulonsa tuotetusta määrästä, ja tuotannon jatkaminen voi siksi kannattaa vielä hieman negatiivisella pörssihinnalla. Kun tarjontaa on enemmän kuin kysyntää eikä ylijäämää saada siirrettyä naapurimaihin, hinta painuu alle nollan.</p>
<p>Tilanne korjaantuu usein itsestään: kun hinta on negatiivinen, joustava kulutus kasvaa ja osa tuotannosta pysähtyy. Sähkövarastot, kuten akut ja sähkökattilat, ostavat sähköä juuri tällaisina hetkinä. Tuulivoiman ja joustavan kulutuksen lisääntyessä negatiivisten tuntien määrä voi vaihdella vuodesta toiseen paljon.</p>
<h2>Esimerkki: sähköauton lataus negatiivisella hinnalla</h2>
<p>Jos sähköauto ladataan neljäkymmentä kilowattituntia kolmen tunnin jaksona, jolloin pörssihinta on keskimäärin hieman negatiivinen, energian osuus latauksesta on pieni hyvitys. Siirtomaksu ja sähkövero maksetaan silti kaikesta ladatusta sähköstä. Helsingin yleissiirrolla ne ovat kilowattitunnilta selvästi enemmän kuin negatiivinen pörssihinta on miinuksella, joten lataus maksaa edelleen useita euroja. Säästö tavalliseen päivään verrattuna on kuitenkin selvä, koska energian hinta on nolla tai alle. Sähköauton laskurista näet tämän päivän latauksen hinnan halvimmalla ajalla.</p>
<h2>Sopimuksen ehdot ratkaisevat</h2>
<p>Kaikki pörssisopimukset eivät välitä negatiivista hintaa asiakkaalle sellaisenaan. Joissakin sopimuksissa energian hinta on rajattu nollaan, ja joissakin myyjän marginaali peritään aina. Tarkista oman sopimuksesi ehdot, jos haluat hyödyntää negatiivisia tunteja. Kiinteähintaisessa sopimuksessa negatiivinen pörssihinta ei näy lainkaan.</p>
<h2>Negatiivinen hinta ja siirtotuote</h2>
<p>Siirtotuote vaikuttaa siihen, kuinka paljon negatiivisesta hinnasta jää käteen. Yleissiirrossa siirtomaksu on sama kaikkina tunteina, joten negatiivisen tunnin etu on pelkkä pörssihinnan ero. Yösiirrossa yön siirtomaksu on halvempi, ja koska negatiiviset tunnit osuvat usein yöhön, kokonaishinta jää silloin erityisen matalaksi. Kausisiirrossa talviarkipäivien kallis siirto voi syödä osan hyödystä, jos negatiivinen tunti osuu talvella päiväaikaan. Laskuri näyttää oman verkkosi ja siirtotuotteesi kokonaishinnan jokaiselle vartille, myös negatiivisille.</p>
<p>Kiinteähintaisen sopimuksen asiakas ei hyödy negatiivisesta pörssihinnasta, mutta hän ei myöskään kärsi korkeista hinnoista. Valinta näiden välillä on riskin ja joustomahdollisuuksien punnintaa, ei pelkästään negatiivisten tuntien laskemista.</p>
<p>Tämän sivuston laskurit käyttävät samoja virallisia lähteitä: pörssihinnat Suomen tarjousalueelta, siirtohinnat verkkoyhtiöiden omista hinnastoista ja verot Verohallinnon taulukosta. Kaikki laskenta tapahtuu selaimessasi, eikä syöttämiäsi tietoja lähetetä minnekään. Hinnat päivittyvät joka päivä automaattisesti, ja jos päivän pörssihintoja ei ole saatavilla, laskuri näyttää selvästi merkityn keskihinta-arvion. Lisätietoa laskentatavasta, lähteistä ja rajoituksista on menetelmäsivulla.</p>`;
    },
  },
  en: {
    slug: 'negative-electricity-price',
    nav: 'Negative price',
    card: 'Why the Finnish spot price sometimes drops below zero and what a consumer then pays.',
    title: 'Negative Electricity Price Finland 2026: What You Really Pay',
    description: 'Negative electricity prices in Finland, 2026: why the spot price drops below zero, how often it happens and what a kWh then costs with transfer and tax.',
    h1: 'Negative electricity prices: is power ever free?',
    intro: 'The spot price can go negative, but a consumer’s all-in price almost always stays positive. The calculator shows by how much.',
    resume: (h) => {
      const v = V(h);
      return `The Finnish spot price occasionally drops below zero when wind output is high and demand low. Over the last ${h.num(v.n)} days in our archive negative prices occurred on ${h.num(v.negPaivat.length)} days, and the lowest quarter was ${h.num(v.min[2], 2)} euros per megawatt-hour on ${h.date(v.min[0])}. A negative spot price does not make electricity free, though. Transfer, electricity tax and the retailer’s margin are always paid. At −10 euros per megawatt-hour, for example, a kilowatt-hour costs ${h.c(v.esim.yhteensa)} all-in in Helsinki on Helen’s general transfer. For the all-in price to reach zero in Helsinki the spot price would have to be about ${h.num(v.raja, 0)} euros per megawatt-hour, and about ${h.num(v.rajaJse, 0)} euros in Järvi-Suomen Energia’s area. Only spot customers benefit from negative prices, and most those who can shift use into exactly those hours.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Why can the electricity price be negative?', a: 'When generation exceeds demand and links to neighbouring countries are full, some producers will pay to keep running. Wind subsidies, start-up and shut-down costs and contracts can make continuing cheaper than stopping. The market price then drops below zero. It is usually short-lived.' },
        { q: 'Does a consumer get paid at a negative price?', a: `Rarely. On a spot contract the energy part is negative, but transfer and electricity tax, together ${h.c(v.helen + h.M.VERO_C)} in Helsinki, are still paid. The all-in price therefore stays positive unless the spot price is very deeply negative. In Helsinki the threshold is about ${h.num(v.raja, 0)} euros per megawatt-hour.` },
        { q: 'Is VAT applied to a negative price?', a: 'Our calculator applies VAT to a negative spot price too, so the credit grows by the VAT. Retailers may treat negative hours differently, for example with a price floor or a separate term. Check your contract, since on some contracts the energy price cannot fall below zero.' },
        { q: 'What should I do in negative hours?', a: 'Shift flexible use into them: charge the car, heat the water heater, wash and dry laundry, or use storage heating. Negative hours often fall at night or at weekends in windy weather. Tomorrow’s prices are out in the afternoon, so you can prepare by setting timers.' },
      { q: 'Is a negative price a sign of oversupply?', a: 'Yes, briefly. A negative price means generation exceeds demand and the surplus cannot be exported. It does not mean there is permanently too much power, only that flexible demand and storage are not yet enough to absorb output swings. As flexible demand and storage grow, the number of negative hours may change.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      const rajat = h.M.VERKOT.map((vk) => { const c = vk.tuotteet[0].energia.kaikki!; return [h.a(`siirto-${vk.id}`, vk.lyhyt), h.c(c), `${h.num(-((c + h.M.VERO_C + MARG) / (1 + h.M.ALV)) * 10, 0)} €/MWh`]; });
      return `<h2>How often prices go negative</h2>
<p>Negative prices have become more common in Finland as wind power grows. They usually fall on windy nights, weekends and the spring flood season, when hydro output is high too. Our archive covers about two months of quarter-hour prices and grows daily. ${v.negPaivat.length ? `Over the last ${h.num(v.n)} days a negative quarter occurred on ${h.num(v.negPaivat.length)} days.` : 'No negative quarters occurred in recent days.'} Daily prices are on the ${h.a('kuukausihinnat', 'monthly prices page')} and the exchange’s own ${h.src('nordpool', 'price service')}.</p>
<h2>At what spot price the all-in price hits zero</h2>
${h.table(['Operator', 'General transfer', 'All-in price 0 when spot is'], rajat, `On general transfer, with electricity tax of ${h.c(h.M.VERO_C, 4)} and a margin of ${h.c(MARG)}, VAT applied to negative spot too.`, ['l', 'r', 'r'])}
<p>The table shows how deep the spot price would need to fall for a consumer’s all-in price to reach zero. The dearer the transfer, the deeper. Such prices are rare, so for a consumer a negative spot price in practice means cheaper than usual electricity, not free.</p>
<h2>Electricity tax does not flex</h2>
<p>Electricity tax and the security-of-supply fee, ${h.c(h.M.VERO_C, 4)} per kilowatt-hour according to the ${h.src('veroTaulukko', 'Tax Administration’s table')}, are charged on every kilowatt-hour whatever the spot price. So is the transfer fee. That is why a negative price helps a consumer less than the spot figure suggests.</p>
<h2>Negative prices and your own solar power</h2>
<p>For solar producers a negative price is bad news: selling to the grid can cost money if the sales contract follows the spot price. Many contracts and inverters allow export to be limited in negative hours. Using your own output, for example to heat the water heater, is then the better option. ${h.src('motivaJousto', 'Motiva')} explains demand-flexibility options.</p>
<h2>Preparing for negative hours</h2>
<p>Tomorrow’s prices come out in the afternoon, so negative hours show on the ${h.a('huomenna', 'tomorrow page')} the day before. Time the car charging, washing and water heater for them. The ${h.a('halvin-aika', 'cheapest time guide')} explains when cheap hours typically fall.</p>
<h2>Why producers pay to produce</h2>
<p>A negative price sounds odd but has a clear logic. Some plants cannot stop and restart quickly or cheaply, so running through a short negative spell costs less than shutting down. Some wind output is sold on long contracts that pay per unit produced, so continuing can still pay at a slightly negative exchange price. When supply exceeds demand and the surplus cannot be exported, the price drops below zero. The situation often corrects itself: flexible demand rises and some output stops, and storage such as batteries and electric boilers buys power at exactly such moments.</p>
<h2>Your contract terms decide</h2>
<p>Not every spot contract passes a negative price on unchanged. Some cap the energy price at zero, and some always charge the margin. Check your terms if you want to use negative hours. On a fixed-price contract a negative spot price does not show at all.</p>`;
    },
  },
});
