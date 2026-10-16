import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('herrfors'); const tt = t.v.tuotteet;
  const y = tt.find((x) => x.nimi === 'Yleistariffi')!, b = tt.find((x) => x.nimi === 'Yleistariffi B')!, a = t.aika;
  const kt = h.M.perusKk(y, 'kt'), p1 = h.M.perusKk(y, '1x25'), p25 = h.M.perusKk(y, '3x25'), p35 = h.M.perusKk(y, '3x35');
  const b25 = h.M.perusKk(b, '3x25'), a25 = a ? h.M.perusKk(a, '3x25') : null;
  /** Yleistariffi B:n suurempi perusmaksu 3 × 25 A:lla, €/vuosi. */
  const bLisa = (b25 - p25) * 12;
  /** Vuosikulutus, josta Yleistariffi B alittaa Yleistariffin (molemmat yksiaikaisia). */
  const bRaja = t.tasapaino(b, y);
  /** Yökulutuksen osuus, josta Aikatariffin keskimääräinen siirtomaksu alittaa Yleistariffi B:n. */
  const yoOsuus = a && a.energia.paiva! > b.energia.kaikki! ? ((a.energia.paiva! - b.energia.kaikki!) / (a.energia.paiva! - a.energia.yo!)) * 100 : null;
  return { t, y, b, a, kt, p1, p25, p35, b25, a25, bLisa, bRaja, yoOsuus };
};

export default defineGuide({
  id: 'siirto-herrfors',
  group: 'verkko',
  order: 30,
  tool: 'tanaan',
  toolProps: { verkko: 'herrfors', sulake: 1 },
  related: ['siirtohinnat', 'siirto-vaasa', 'siirtomaksu', 'sahkoauton-lataus', 'porssi-vai-kiintea'],
  sources: ['herrfors', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-herrfors',
    nav: 'Herrfors',
    card: 'Herrforsin Yleistariffi, Yleistariffi B ja Aikatariffi sekä pörssisähkön kokonaishinta Pietarsaaren seudulla.',
    title: 'Herrfors siirtohinta 2026: Pietarsaari ja Yleistariffi B',
    description: 'Herrfors Nät-Verkon siirtohinnat 2026: Yleistariffi, suurkuluttajan Yleistariffi B ja Aikatariffi Pietarsaaressa ja Ylivieskassa. Pörssisähkö varteittain.',
    h1: 'Herrfors Nät-Verkko: pörssisähkön hinta Pietarsaaren seudulla',
    intro: 'Herrforsin verkossa voi valita kahdesta yksiaikaisesta tariffista: toisessa perusmaksu on pieni, toisessa siirtomaksu. Laskuri näyttää, mitä pörssisähkö maksaa kunkin tuotteen kanssa vartti kerrallaan.',
    resume: (h) => {
      const v = V(h);
      return `Herrfors Nät-Verkko Oy Ab on Herrfors-konserniin kuuluva paikallinen jakeluyhtiö, joka siirtää sähkön Pietarsaaressa (ruotsiksi Jakobstad) ja sen lähikunnissa sekä Ylivieskan seudulla. Verkossa on ${h.num(v.t.v.asiakkaat!.maara)} käyttöpaikkaa (${v.t.v.asiakkaat!.vuosi}). Verkkopalveluhinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen, eikä kotitalouksien tuotteissa ole tehomaksua, koska hinnaston tehosähkötuotteet on tarkoitettu yrityksille. Yleistariffin siirtomaksu on ${h.c(v.y.energia.kaikki!)} vuorokauden ajasta riippumatta, ja perusmaksu on 1 × 25 ampeerilla ${h.eur(v.p1)}, 3 × 25 ampeerilla ${h.eur(v.p25)} ja 3 × 35 ampeerilla ${h.eur(v.p35)} kuukaudessa. Rivi- ja kerrostalojen huoneistoille on oma Kerrostalosähkö, jossa perusmaksu on ${h.eur(v.kt)} ja siirtomaksu sama. Herrforsin erikoisuus on Yleistariffi B: sekin on yksiaikainen, mutta siirtomaksu on vain ${h.c(v.b.energia.kaikki!)} ja perusmaksu 3 × 25 ampeerilla ${h.eur(v.b25)}. Laskelmamme mukaan se alittaa Yleistariffin noin ${v.bRaja ? h.num(v.bRaja) : '–'} kilowattitunnin vuosikulutuksesta alkaen.${v.a ? ` Aikatariffissa yöaika on hinnaston mukaan kello 22–07, jolloin siirto maksaa ${h.c(v.a.energia.yo!)}, ja muulloin ${h.c(v.a.energia.paiva!)}.` : ''} Laskurin ${v.t.n} verkon joukossa Herrfors sijoittuu ${v.t.sija5}. sijalle, kun vertaillaan 5 000 kilowattitunnin omakotitaloa halvimmasta alkaen. Laskurissa on valmiina Yleistariffi, ja muut tuotteet ja sulakkeet löytyvät valikosta.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Kenelle Herrforsin Yleistariffi B sopii?', a: `Yleistariffi B on yksiaikainen kuten Yleistariffi, mutta sen perusmaksu on 3 × 25 ampeerilla ${h.eur(v.b25)} eli ${h.eur(v.bLisa, 0)} vuodessa enemmän. Vastineeksi jokainen kilowattitunti maksaa ${h.c(v.b.energia.kaikki!)} eikä ${h.c(v.y.energia.kaikki!)}. Laskelmamme mukaan ero kuittautuu noin ${v.bRaja ? h.num(v.bRaja) : '–'} kilowattitunnin vuosikulutuksella. Tuote sopii siis suurelle kulutukselle, jota ei voi siirtää yöhön, koska hinta on sama kellonajasta riippumatta.` },
        { q: 'Kumpi on Herrforsilla edullisempi, Aikatariffi vai Yleistariffi B?', a: v.a && v.a25 !== null ? `Aikatariffin perusmaksu on 3 × 25 ampeerilla ${h.eur(v.a25)} ja Yleistariffi B:n ${h.eur(v.b25)}. Päivällä B on ${h.c(v.a.energia.paiva! - v.b.energia.kaikki!)} halvempi, mutta kello 22–07 Aikatariffi maksaa vain ${h.c(v.a.energia.yo!)}. ${v.yoOsuus !== null ? `Kun yöhön osuu yli ${h.num(v.yoOsuus, 0)} % kulutuksesta, Aikatariffin keskimääräinen siirtomaksu on pienempi.` : 'Aikatariffin siirtomaksu on pienempi kaikkina aikoina.'} Yölataus tai varaava lämmitys kallistaa valinnan Aikatariffin puolelle.` : 'Aikatariffi puuttuu laskurin tiedoista, joten vertailua ei voi tehdä.' },
        { q: 'Miksi Herrforsin vuodenaikasähkö puuttuu laskurista?', a: 'Herrforsin hinnastossa on myös Vuodenaikasähkö, jossa on erillinen talviarkipäivän ja muun ajan siirtomaksu. Hinnasto tai yhtiön muut sivut eivät kuitenkaan kerro, mitkä kuukaudet, viikonpäivät ja kellonajat talviarkipäivään kuuluvat. Ilman näitä rajoja tuotetta ei voi hinnoitella vartti vartilta, joten jätimme sen pois. Kysy aikarajat Herrforsin asiakaspalvelusta, jos harkitset tuotetta.' },
        { q: 'Paljonko kolmivaiheinen liittymä maksaa Herrforsilla yksivaiheista enemmän?', a: `Yleistariffissa vain vähän: 1 × 25 ampeerin perusmaksu on ${h.eur(v.p1)} ja 3 × 25 ampeerin ${h.eur(v.p25)} kuukaudessa, joten ero on ${h.eur((v.p25 - v.p1) * 12, 0)} vuodessa. Vasta 3 × 35 ampeerilla perusmaksu kasvaa selvästi, ${h.eur(v.p35)} kuukaudessa. Rivi- tai kerrostalon huoneistossa Kerrostalosähkö on edullisin, ${h.eur(v.kt)} kuukaudessa, ja siirtomaksu on sama ${h.c(v.y.energia.kaikki!)}.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Herrforsin kotitalousverkon hinnat</h2>
${hintaTaulukko(h, v.t)}
<p>Kerrostalosarakkeessa Yleistariffin kohdalla on Kerrostalosähkön perusmaksu, joka koskee hinnaston mukaan rivi- ja kerrostalojen huoneistoja. Yleistariffi B ja Aikatariffi on hinnoiteltu vain kolmivaiheisille liittymille, joten niiden kerrostalosarakkeessa näkyy 3 × 25 ampeerin perusmaksu.</p>
<h2>Vuosikustannus Pietarsaaren seudulla</h2>
${vuosiTaulukko(h, v.t)}
<p>Tavallisessa omakotitalossa Yleistariffin pieni perusmaksu ratkaisee. Sähkölämmitteisessä talossa vertailu käy kahden kalliimman perusmaksun tuotteen välillä: Yleistariffi B pienentää jokaisen kilowattitunnin hintaa, Aikatariffi vain yön kilowattitunteja. ${h.a('sahkoauton-lataus', 'Sähköauton lataus')} yöllä kasvattaa yöosuutta ja siten Aikatariffin etua.</p>
<h2>Tuotteen vaihto ja sähkövero</h2>
<p>Herrforsin mukaan verkkopalvelutuotteen voi vaihtaa maksutta kerran 12 kuukaudessa, joten valintaa voi korjata, kun vuoden todellinen kulutus on tiedossa. Hinnaston siirtohinnoissa ei ole sähköveroa: veroluokassa I se on ${h.c(h.M.VERO_C, 4)} arvonlisäveron kanssa ja tulee laskulle erikseen. Laskuri lisää sen jokaiseen varttiin. Etelämpänä Pohjanmaan rannikolla verkkoyhtiö on ${h.a('siirto-vaasa', 'Vaasan Sähköverkko')}; kaikkia verkkoja voi verrata ${h.a('siirtohinnat', 'siirtohintojen vertailussa')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-herrfors',
    nav: 'Herrfors',
    card: 'Herrfors’s Yleistariffi, Yleistariffi B and Aikatariffi and the all-in spot price in the Jakobstad region.',
    title: 'Herrfors Transfer Fee 2026: Jakobstad and General Tariff B',
    description: 'Herrfors Nät-Verkko transfer fees 2026: general tariff, high-use general tariff B and time-of-day tariff in Jakobstad and Ylivieska. Spot price by quarter hour.',
    h1: 'Herrfors Nät-Verkko: the spot electricity price around Jakobstad',
    intro: 'Herrfors offers two single-rate tariffs: one with a low basic fee, the other with a low transfer fee. The calculator shows what spot electricity costs with each product, one quarter hour at a time.',
    resume: (h) => {
      const v = V(h);
      return `Herrfors Nät-Verkko Oy Ab is a local distribution company in the Herrfors group, serving Jakobstad (Pietarsaari in Finnish) and the surrounding municipalities as well as the Ylivieska area, ${h.num(v.t.v.asiakkaat!.maara)} metering points in all (${v.t.v.asiakkaat!.vuosi}). The network service price list applies from ${h.date(v.t.v.voimassa!)}, and household products carry no power fee, as the price list’s power products are meant for businesses. The general tariff (Yleistariffi) costs ${h.c(v.y.energia.kaikki!)} at any time of day, with a basic fee of ${h.eur(v.p1)} at 1 × 25 A, ${h.eur(v.p25)} at 3 × 25 A and ${h.eur(v.p35)} at 3 × 35 A per month. Flats in terraced houses and blocks have their own Kerrostalosähkö with a ${h.eur(v.kt)} basic fee and the same transfer fee. What sets Herrfors apart is general tariff B: also single-rate, but at only ${h.c(v.b.energia.kaikki!)} with a 3 × 25 A basic fee of ${h.eur(v.b25)}. By our calculation it undercuts the general tariff from about ${v.bRaja ? h.num(v.bRaja) : '–'} kilowatt-hours a year.${v.a ? ` On the time-of-day tariff (Aikatariffi) night runs from 22:00 to 07:00 under the price list, costing ${h.c(v.a.energia.yo!)}, and ${h.c(v.a.energia.paiva!)} otherwise.` : ''} Among the calculator’s ${v.t.n} networks, Herrfors is number ${v.t.sija5}, counting from the cheapest, for a house using 5,000 kWh.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Who is Herrfors’s general tariff B for?', a: `General tariff B is single-rate like the general tariff, but its 3 × 25 A basic fee is ${h.eur(v.b25)}, or ${h.eur(v.bLisa, 0)} a year more. In return every kilowatt-hour costs ${h.c(v.b.energia.kaikki!)} instead of ${h.c(v.y.energia.kaikki!)}. By our calculation the difference pays back at about ${v.bRaja ? h.num(v.bRaja) : '–'} kilowatt-hours a year. It therefore suits heavy use that cannot be moved to the night, because the price is the same at any hour.` },
        { q: 'Which is cheaper with Herrfors, the time-of-day tariff or general tariff B?', a: v.a && v.a25 !== null ? `The time-of-day tariff’s 3 × 25 A basic fee is ${h.eur(v.a25)} and tariff B’s ${h.eur(v.b25)}. By day tariff B is ${h.c(v.a.energia.paiva! - v.b.energia.kaikki!)} cheaper, but from 22:00 to 07:00 the time-of-day tariff costs only ${h.c(v.a.energia.yo!)}. ${v.yoOsuus !== null ? `Once more than ${h.num(v.yoOsuus, 0)}% of your use falls at night, its average transfer fee is lower.` : 'Its transfer fee is lower at all times.'} Overnight charging or storage heating tips the choice towards the time-of-day tariff.` : 'The time-of-day tariff is missing from the calculator’s data, so no comparison can be made.' },
        { q: 'Why is Herrfors’s seasonal product missing from the calculator?', a: 'Herrfors’s price list also includes a seasonal product (Vuodenaikasähkö) with separate winter-weekday and other-time transfer fees. However, neither the price list nor the company’s other pages say which months, weekdays and hours make up a winter weekday. Without those limits the product cannot be priced quarter by quarter, so we left it out. Ask Herrfors’s customer service for the hours if you are considering it.' },
        { q: 'How much more does a three-phase connection cost with Herrfors?', a: `On the general tariff very little: the 1 × 25 A basic fee is ${h.eur(v.p1)} and the 3 × 25 A one ${h.eur(v.p25)} a month, a difference of ${h.eur((v.p25 - v.p1) * 12, 0)} a year. Only at 3 × 35 A does it rise to ${h.eur(v.p35)}. In a flat in a terraced house or block, Kerrostalosähkö is the cheapest at ${h.eur(v.kt)} a month, with the same ${h.c(v.y.energia.kaikki!)} transfer fee.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Herrfors’s household network prices</h2>
${hintaTaulukko(h, v.t)}
<p>In the flat column, the general tariff row shows the Kerrostalosähkö basic fee, which under the price list applies to flats in terraced houses and blocks. General tariff B and the time-of-day tariff are priced only for three-phase connections, so their flat column shows the 3 × 25 A basic fee.</p>
<h2>Annual cost in the Jakobstad region</h2>
${vuosiTaulukko(h, v.t)}
<p>In an ordinary house the general tariff’s low basic fee decides it. In an electrically heated house the contest is between the two products with higher basic fees: tariff B lowers the price of every kilowatt-hour, the time-of-day tariff only of night-time ones. ${h.a('sahkoauton-lataus', 'Charging an electric car')} overnight raises the night share and with it the time-of-day tariff’s advantage.</p>
<h2>Switching product and electricity tax</h2>
<p>According to Herrfors, you can switch network service product free of charge once every 12 months, so the choice can be corrected once a year’s real consumption is known. The price list’s transfer prices exclude electricity tax: in tax class I it is ${h.c(h.M.VERO_C, 4)} including VAT and is billed separately. The calculator adds it to every quarter hour. Further south on the Ostrobothnian coast the operator is ${h.a('siirto-vaasa', 'Vaasan Sähköverkko')}; compare every network in the ${h.a('siirtohinnat', 'transfer fee comparison')}.</p>`;
    },
  },
});
