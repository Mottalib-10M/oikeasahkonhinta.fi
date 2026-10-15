import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { vuosiKa, MARG, PERUS_MYYJA, KIINTEA_OLETUS, TK_KK } from '../../lib/arvot';

/** Pörssi vai kiinteä : coût annuel sur les 12 derniers mois publiés pour trois profils. */
const V = (h: Helpers) => {
  const { M } = h;
  const v12 = vuosiKa();
  const tu = M.tuote(M.verkko('helen')!, 'yleis')!;
  const laske = (kwh: number, p: M.Profiili, kiintea = KIINTEA_OLETUS) => M.vuosikustannus({ kwh, profiili: p, vuosi: v12, marginaali: MARG, kiintea, perusMyyjaPorssi: PERUS_MYYJA, perusMyyjaKiintea: PERUS_MYYJA, tuote: tu, sulake: '3x25' });
  const k = laske(2000, 'tasainen'), o = laske(5000, 'tasainen'), l = laske(18000, 'lammitys');
  const tasapaino = (r: M.VuosiTulos, kwh: number) => ((r.porssi - PERUS_MYYJA * 12) / kwh) * 100;
  const kalle = v12.spot.reduce((a, b, i) => (b > v12.spot[a] ? i : a), 0);
  const halpa = v12.spot.reduce((a, b, i) => (b < v12.spot[a] ? i : a), 0);
  return { v12, k, o, l, tk: tasapaino(k, 2000), tl: tasapaino(l, 18000), kalle, halpa };
};

export default defineGuide({
  id: 'porssi-vai-kiintea',
  group: 'hinta',
  order: 20,
  tool: 'vertailu',
  toolProps: { verkko: 'helen', kwh: 5000 },
  related: ['marginaali', 'kuukausihinnat', 'sahkolasku', 'halvin-aika', 'huomenna'],
  sources: ['nordpool', 'tkHinta', 'tkKulutus', 'evHintavertailu', 'motivaSopimus'],
  fi: {
    slug: 'porssisahko-vai-kiintea',
    nav: 'Pörssisähkö vai kiinteä',
    card: 'Kumpi olisi ollut halvempi omalla kulutuksellasi viimeisen 12 kuukauden hinnoilla?',
    title: 'Pörssisähkö vai kiinteä 2026: kumpi olisi ollut halvempi',
    description: 'Pörssisähkö vai kiinteä sopimus 2026: laske viimeisen 12 kuukauden toteutuneilla hinnoilla, kumpi olisi ollut omalla kulutuksellasi halvempi ja paljonko.',
    h1: 'Pörssisähkö vai kiinteä sopimus: laske omalla kulutuksellasi',
    intro: 'Laskuri vertaa pörssisopimusta ja kiinteää hintaa viimeisen kahdentoista kuukauden toteutuneilla pörssihinnoilla.',
    resume: (h) => {
      const v = V(h);
      return `Viimeisten kahdentoista julkaistun kuukauden aikana Suomen pörssisähkön keskihinta on ollut ${h.c(v.v12.kaC)} arvonlisäveron kanssa. Kun siihen lisätään ${h.c(MARG)} marginaali, pörssisopimuksen energia olisi maksanut kerrostaloasunnossa, joka kuluttaa 2 000 kilowattituntia vuodessa, perusmaksuineen ${h.eur(v.k.porssi, 0)}. Sama määrä kiinteällä ${h.c(KIINTEA_OLETUS)} hinnalla olisi maksanut ${h.eur(v.k.kiintea, 0)}. Sähkölämmitteisessä talossa, jonka 18 000 kilowattitunnin kulutus painottuu talveen, pörssisopimuksen energia olisi maksanut ${h.eur(v.l.porssi, 0)} ja kiinteä ${h.eur(v.l.kiintea, 0)}. Kiinteän hinnan raja, jolla molemmat olisivat maksaneet saman verran, on kerrostalossa ${h.c(v.tk)} ja sähkölämmitystalossa ${h.c(v.tl)}, koska talvikuukausien kalliit hinnat painavat enemmän. Syötä oma vuosikulutuksesi, marginaalisi ja kiinteän tarjouksen hinta, niin laskuri kertoo eron euroina ja kuukausi kuukaudelta. Siirtomaksu ja sähkövero eivät vaikuta eroon, koska ne ovat molemmissa sopimuksissa samat. Laskurin taulukko erittelee kuukausittain sekä kulutuksen että molempien sopimusten energiakustannuksen, joten näet, missä kuukausissa pörssisopimus oli kalliimpi.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miksi sähkölämmitystalon tasapainohinta on korkeampi?', a: `Koska sähkölämmitys kuluttaa eniten talvella, jolloin pörssihinnat ovat yleensä korkeimmillaan. Kulutuksella painotettu pörssihinta on siksi korkeampi kuin vuoden yksinkertainen keskiarvo. Laskurimme käyttää talvipainotteisessa profiilissa Tilastokeskuksen koko maan kuukausittaista sähkönkulutusta, joka jakaa vuoden kulutuksen kuukausille. Jos pystyt siirtämään lämmitystä halvoille tunneille, esimerkiksi varaajan avulla, oma tasapainohintasi on laskurin lukua alempi.` },
        { q: 'Mistä kiinteän hinnan oletusarvo tulee?', a: `Oletus ${h.c(KIINTEA_OLETUS)} on Tilastokeskuksen julkaisema kotitalouksien (5 000–15 000 kWh vuodessa) keskimääräinen sähköenergian hinta ilman veroja kuukaudelta ${TK_KK}, johon on lisätty arvonlisävero. Se on kaikkien sopimustyyppien keskiarvo, ei tietyn myyjän tarjous, joten vaihda tilalle saamasi tarjouksen hinta. Myös kiinteän sopimuksen perusmaksun voi muuttaa omaksi.` },
        { q: 'Kertooko menneen vuoden vertailu, kumpi kannattaa ensi vuonna?', a: 'Ei varmasti. Laskuri kertoo, kumpi olisi ollut halvempi viimeisen vuoden toteutuneilla hinnoilla. Ensi vuoden pörssihinnat riippuvat sääoloista, vesitilanteesta, ydinvoimaloiden käytettävyydestä ja tuulivoiman määrästä. Kiinteä sopimus on vakuutus hintapiikkejä vastaan, ja vakuutuksesta maksetaan yleensä jotain. Laskurin tulos auttaa arvioimaan, kuinka suuri vakuutusmaksu kiinteään hintaan olisi viime vuonna sisältynyt.' },
        { q: 'Vaikuttaako siirtomaksu valintaan?', a: 'Ei. Siirtomaksu, verkon perusmaksu ja sähkövero ovat samat riippumatta siitä, onko sähkösopimuksesi pörssi- vai kiinteähintainen. Siksi laskuri näyttää ne erikseen koko laskun arviona, mutta ero lasketaan vain energiasta ja myyjän perusmaksusta. Siirtotuotteen valinta on oma päätöksensä. Siirtotuotteen vertailu on siirtohintojen sivulla.' },
        { q: 'Kannattaako pörssisähkö, jos en voi ajoittaa kulutusta?', a: 'Pörssisopimus voi kannattaa, vaikka kulutusta ei ajoittaisi, jos pörssihintojen keskiarvo on matala, kuten laskurin vertailu näyttää. Ajoittaminen parantaa tulosta lisää. Sen sijaan suuri talvikulutus ilman joustoa altistaa pakkasjaksojen hintapiikeille, ja silloin yksittäisen kuukauden lasku voi olla hyvin suuri. Talvipainotteinen profiili laskurissa näyttää tämän vaikutuksen.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Kolme esimerkkikotia viimeisen vuoden hinnoilla</h2>
${h.table(['Koti', 'Pörssisopimus', 'Kiinteä', 'Ero', 'Tasapainohinta'], [
        ['Kerrostalo 2 000 kWh', h.eur(v.k.porssi, 0), h.eur(v.k.kiintea, 0), h.eur(v.k.erotus, 0), h.c(v.tk)],
        ['Omakotitalo 5 000 kWh', h.eur(v.o.porssi, 0), h.eur(v.o.kiintea, 0), h.eur(v.o.erotus, 0), h.c(((v.o.porssi - PERUS_MYYJA * 12) / 5000) * 100)],
        ['Sähkölämmitys 18 000 kWh', h.eur(v.l.porssi, 0), h.eur(v.l.kiintea, 0), h.eur(v.l.erotus, 0), h.c(v.tl)],
      ], `Energia ja myyjän perusmaksu ${h.eur(PERUS_MYYJA)}/kk vuodessa, € sis. alv. Pörssi = kuukauden keskihinta + ${h.c(MARG)}; kiinteä ${h.c(KIINTEA_OLETUS)}. Positiivinen ero = pörssi halvempi.`, ['l', 'r', 'r', 'r', 'r'])}
<p>Jakson kallein kuukausi oli ${v.v12.kk[v.kalle]} ja halvin ${v.v12.kk[v.halpa]}. Ero kuukausien välillä on suuri, minkä vuoksi pörssisopimuksen lasku vaihtelee kuukaudesta toiseen paljon enemmän kuin kiinteän sopimuksen. Kokonaisuutena ratkaisee kuitenkin vuoden summa.</p>
<h2>Miten laskuri vertaa</h2>
<p>Laskuri ottaa Suomen tarjousalueen kuukausittaiset keskihinnat viimeiseltä kahdeltatoista julkaistulta kuukaudelta ja lisää niihin arvonlisäveron ja marginaalisi. Kulutus jaetaan kuukausille joko tasaisesti tai talvipainotteisesti Tilastokeskuksen sähkönkulutustilaston mukaan. Kiinteän sopimuksen hinta on sama joka kuukausi. Molempiin lisätään myyjän perusmaksu. Kuukauden sisällä kulutuksen oletetaan jakautuvan tasaisesti; jos siirrät kulutusta halvoille tunneille, pörssisopimus pärjää vielä paremmin.</p>
<h2>Mitä Motiva ja Energiavirasto neuvovat</h2>
<p>${h.src('motivaSopimus', 'Motiva')} muistuttaa, että pörssisähkö sopii parhaiten sille, joka pystyy seuraamaan hintoja ja joustamaan kulutuksessaan, kun taas kiinteä hinta tuo ennustettavuutta. ${h.src('evHintavertailu', 'Energiaviraston hintavertailusta')} näet ajantasaiset tarjoukset omalle postinumerollesi. Vertaa tarjouksen hintaa laskurin tasapainohintaan: jos kiinteä tarjous on sen alapuolella, se olisi ollut menneellä vuodella edullinen.</p>
<h2>Marginaali ja perusmaksu ratkaisevat pörssisopimusten välillä</h2>
<p>Kaikki pörssisopimukset käyttävät samaa pörssihintaa, joten myyjien väliset erot ovat marginaalissa ja perusmaksussa. ${h.a('marginaali', 'Marginaalin oppaassa')} on laskuri, joka näyttää eri marginaalien vuosikustannuksen. Kuukauden sähkölaskun saat ${h.a('sahkolasku', 'sähkölaskulaskurista')}.</p>`;
    },
  },
  en: {
    slug: 'spot-or-fixed-electricity-contract',
    nav: 'Spot or fixed contract',
    card: 'Which would have been cheaper on your consumption at the last 12 months’ prices?',
    title: 'Spot or Fixed Electricity Contract Finland 2026: Which Pays',
    description: 'Spot or fixed electricity contract in Finland, 2026: the last 12 months’ real prices show which would have been cheaper on your own use, and by how much.',
    h1: 'Spot or fixed-price contract: work it out on your own consumption',
    intro: 'The calculator compares a spot contract with a fixed price using the last twelve months’ actual exchange prices.',
    resume: (h) => {
      const v = V(h);
      return `Over the last twelve published months the average Finnish spot price has been ${h.c(v.v12.kaC)} including VAT. Adding a ${h.c(MARG)} margin, a spot contract’s energy for a flat using 2,000 kilowatt-hours a year would have cost ${h.eur(v.k.porssi, 0)} with the monthly fee. The same amount at a fixed ${h.c(KIINTEA_OLETUS)} would have cost ${h.eur(v.k.kiintea, 0)}. In an electrically heated house using 18,000 kilowatt-hours, weighted towards winter, spot energy would have cost ${h.eur(v.l.porssi, 0)} and fixed ${h.eur(v.l.kiintea, 0)}. The fixed price at which both would have cost the same is ${h.c(v.tk)} for the flat and ${h.c(v.tl)} for the heated house, because expensive winter months weigh more. Enter your own annual use, margin and fixed offer, and the calculator gives the difference in euros and month by month.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Why is the break-even price higher for an electrically heated house?', a: 'Because electric heating uses most power in winter, when spot prices are usually highest. The consumption-weighted spot price is therefore above the simple annual average. For the winter-heavy profile the calculator uses Statistics Finland’s national monthly electricity consumption to spread the year’s use across months.' },
        { q: 'Where does the default fixed price come from?', a: `The default ${h.c(KIINTEA_OLETUS)} is Statistics Finland’s average household energy price (5,000–15,000 kWh a year) before tax for ${TK_KK}, with VAT added. It is an average across all contract types, not a specific retailer’s offer, so replace it with the price you have been quoted.` },
        { q: 'Does last year’s comparison tell me what pays next year?', a: 'Not for certain. It tells you which would have been cheaper at last year’s actual prices. Next year’s spot prices depend on weather, hydro reserves, nuclear availability and wind output. A fixed contract is insurance against price spikes, and insurance usually costs something.' },
        { q: 'Does the transfer fee affect the choice?', a: 'No. The transfer fee, network basic fee and electricity tax are the same whether your contract is spot or fixed. The calculator shows them separately as part of a whole-bill estimate, but the difference is computed from energy and the retailer’s fee only. Choosing a transfer product is a separate decision.' },
        { q: 'Is spot worth it if I cannot time my use?', a: 'A spot contract can pay even without timing, if the average spot price is low, as the comparison shows. Timing improves the result further. Large winter use with no flexibility, however, exposes you to cold-snap price spikes, when a single month’s bill can be very high.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Three example homes at last year’s prices</h2>
${h.table(['Home', 'Spot contract', 'Fixed', 'Difference', 'Break-even price'], [
        ['Flat 2,000 kWh', h.eur(v.k.porssi, 0), h.eur(v.k.kiintea, 0), h.eur(v.k.erotus, 0), h.c(v.tk)],
        ['House 5,000 kWh', h.eur(v.o.porssi, 0), h.eur(v.o.kiintea, 0), h.eur(v.o.erotus, 0), h.c(((v.o.porssi - PERUS_MYYJA * 12) / 5000) * 100)],
        ['Electric heating 18,000 kWh', h.eur(v.l.porssi, 0), h.eur(v.l.kiintea, 0), h.eur(v.l.erotus, 0), h.c(v.tl)],
      ], `Energy plus retailer fee of ${h.eur(PERUS_MYYJA)}/month, per year, € incl. VAT. Spot = monthly average + ${h.c(MARG)}; fixed ${h.c(KIINTEA_OLETUS)}. Positive difference = spot cheaper.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The period’s dearest month was ${v.v12.kk[v.kalle]} and the cheapest ${v.v12.kk[v.halpa]}. The gap between months is large, so a spot bill swings far more from month to month than a fixed one. What decides it overall is the annual total.</p>
<h2>How the calculator compares</h2>
<p>The calculator takes the Finnish bidding zone’s monthly averages for the last twelve published months and adds VAT and your margin. Consumption is spread over months either evenly or winter-heavy, following Statistics Finland’s consumption statistics. The fixed price is the same every month. Both get the retailer’s monthly fee. Within each month use is assumed even; if you shift use to cheap hours, the spot contract does better still.</p>
<h2>What Motiva and the Energy Authority advise</h2>
<p>${h.src('motivaSopimus', 'Motiva')} notes that spot electricity suits people who can follow prices and flex their use, while a fixed price brings predictability. The ${h.src('evHintavertailu', 'Energy Authority’s price comparison')} lists current offers for your postcode. Compare an offer with the calculator’s break-even price: if the fixed offer is below it, it would have been cheap over the past year.</p>
<h2>Margin and monthly fee decide between spot contracts</h2>
<p>All spot contracts use the same exchange price, so retailers differ only in margin and monthly fee. The ${h.a('marginaali', 'margin guide')} has a calculator showing the annual cost of different margins. Get a month’s bill from the ${h.a('sahkolasku', 'electricity bill calculator')}.</p>`;
    },
  },
});
