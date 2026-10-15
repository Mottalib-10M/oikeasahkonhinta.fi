import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { laiteHinta, MARG } from '../../lib/arvot';

/** Pyykinpesu : coût d'un lavage au prix réel du quart d'heure. */
const V = (h: Helpers) => {
  const p = h.P.laitteet.pesukone;
  const he = laiteHinta(p.kwh, p.h, 'helen'), ca = laiteHinta(p.kwh, p.h, 'caruna');
  return { p, he, ca, vuosi: he.keski * 4 * 52, saasto: (he.keski - he.halvin) * 4 * 52 };
};

export default defineGuide({
  id: 'pyykinpesu',
  group: 'laite',
  order: 30,
  tool: 'laite',
  toolProps: { laite: 'pesukone', verkko: 'helen' },
  related: ['kuivausrumpu', 'halvin-aika', 'varttihinta', 'saunan-hinta', 'sahkolasku'],
  sources: ['motivaKoneet', 'nordpool', 'veroTaulukko'],
  fi: {
    slug: 'pyykinpesukone-sahkon-hinta',
    nav: 'Pyykinpesu',
    card: 'Mitä pyykinpesukoneen pesu maksaa tänään ja paljonko ajoittaminen säästää.',
    title: 'Pyykinpesukone sähkön hinta 2026: pesun hinta pörssisähköllä',
    description: 'Pyykinpesukoneen sähkönkulutus ja pesun hinta 2026: paljonko pesu maksaa tänään pörssisähköllä siirron ja verojen kanssa ja milloin kone kannattaa käynnistää.',
    h1: 'Paljonko pyykinpesu maksaa pörssisähköllä?',
    intro: 'Yksi pesu maksaa senttejä, mutta vuodessa summa kertyy. Laskuri kertoo pesun hinnan ja halvimman käynnistysajan tänään tai huomenna.',
    resume: (h) => {
      const v = V(h);
      return `Pyykinpesukoneen sähkönkulutus riippuu ohjelmasta ja koneesta. Energiamerkissä ilmoitetaan eco 40–60 -ohjelman kulutus sataa pesua kohden, joten jakamalla luvun sadalla saat yhden pesun kulutuksen. Laskurin oletus on ${h.num(v.p.kwh, 1)} kilowattituntia ja ${h.num(v.p.h)} tunnin ohjelma; vaihda tilalle oman koneesi luvut. Helsingissä Helen Sähköverkon yleissiirrolla ja ${h.c(MARG)} marginaalin pörssisopimuksella pesu maksaa tänään halvimmalla aloitusajalla, kello ${v.he.halvinKlo}, ${h.eur(v.he.halvin)} ja kalleimmalla, kello ${v.he.kalleinKlo}, ${h.eur(v.he.kallein)}. Päivän keskihinnalla pesu maksaa ${h.eur(v.he.keski)}. Neljä pesua viikossa tekee vuodessa noin ${h.eur(v.vuosi, 0)}, ja jos kaikki pestään halvimmalla tunnilla, säästö olisi tämän päivän hinnoilla noin ${h.eur(v.saasto, 0)} vuodessa. Säästö on pieni verrattuna sähköautoon tai saunaan, mutta ajoittaminen ei maksa mitään, jos koneessa on ajastin. Laskuri näyttää myös vuosikustannuksen valitsemallasi pesukertojen määrällä. Täysi koneellinen ja matalampi pesulämpötila pienentävät kulutusta eniten.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Paljonko pyykinpesukone kuluttaa sähköä pesua kohden?', a: `Kulutus riippuu koneen energialuokasta, täyttömäärästä, ohjelmasta ja pesulämpötilasta. Koneen energiamerkissä on eco 40–60 -ohjelman kulutus kilowattitunteina sataa pesua kohden. Laskurin oletus on ${h.num(v.p.kwh, 1)} kilowattituntia pesulta. Kuumat ohjelmat kuluttavat enemmän, koska suurin osa energiasta kuluu veden lämmittämiseen. Laskuriin voit syöttää oman koneesi kulutuksen.` },
        { q: 'Mihin aikaan pyykinpesukone kannattaa käynnistää?', a: `Pörssisähköllä halvimpaan aikaan, joka on usein yöllä tai aikaisin aamulla. Tänään Helsingissä halvin aloitus on kello ${v.he.halvinKlo}. Ajastin auttaa: monessa koneessa voi asettaa, milloin pesu valmistuu, jolloin kone käynnistyy itse. Melun vuoksi taloyhtiön säännöt voivat rajoittaa yöpesua kerrostalossa. Ajastin auttaa.` },
        { q: 'Kannattaako pestä täysiä koneellisia?', a: 'Kannattaa. Motiva neuvoo pesemään täysiä koneellisia, käyttämään eko-ohjelmaa ja alhaisempia lämpötiloja, jos mahdollista, ja käyttämään pikaohjelmia vain kevyesti likaantuneelle pyykille. Koneen energia kuluu pääosin veden lämmittämiseen, joten puolityhjä kone kuluttaa pyykkikiloa kohden enemmän. Myös eko-ohjelma pienentää kulutusta. Pesukoneen energiamerkki kertoo kulutuksen.' },
        { q: 'Miksi säästö pesun ajoittamisesta on niin pieni?', a: 'Koska yksi pesu kuluttaa vähän sähköä. Ajoittaminen säästää vain pörssihinnan eron, sillä siirtomaksu ja sähkövero ovat yleissiirrossa samat joka tunti. Suuremmat säästöt syntyvät suurista joustavista kuormista, kuten sähköauton latauksesta ja lämminvesivaraajasta. Pesukone on silti helppo ajastaa. Ajastus on silti vaivaton tapa säästää.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Pesun hinta kahdessa verkossa</h2>
${h.table(['Verkko', 'Halvin aloitus', 'Keskihinnalla', 'Kallein aloitus'], [
        ['Helen, yleissiirto', `${h.eur(v.he.halvin)} (${v.he.halvinKlo})`, h.eur(v.he.keski), `${h.eur(v.he.kallein)} (${v.he.kalleinKlo})`],
        ['Caruna, yleissiirto', `${h.eur(v.ca.halvin)} (${v.ca.halvinKlo})`, h.eur(v.ca.keski), `${h.eur(v.ca.kallein)} (${v.ca.kalleinKlo})`],
      ], `${h.num(v.p.kwh, 1)} kWh, ${h.num(v.p.h)} h ohjelma, pörssisopimus mediaanimarginaalilla, sähkövero ja alv mukana.`, ['l', 'r', 'r', 'r'])}
<p>Carunan alueella sama pesu maksaa enemmän, koska siirtomaksu on suurempi. Ero ei riipu kellonajasta, koska molemmissa verkoissa yleissiirron siirtomaksu on sama ympäri vuorokauden.</p>
<h2>Energiamerkki kertoo kulutuksen</h2>
<p>EU:n energiamerkissä pyykinpesukoneen kulutus ilmoitetaan kilowattitunteina sataa eco 40–60 -pesua kohden. Esimerkiksi jos merkissä lukee 52, yksi eco-pesu kuluttaa noin 0,52 kilowattituntia. Muiden ohjelmien kulutus voi olla suurempi tai pienempi. ${h.src('motivaKoneet', 'Motivan kodinkoneohjeet')} neuvovat vertailemaan energiamerkkejä koneen hankinnassa ja valitsemaan täyttömäärän pyykkäystahdin mukaan.</p>
<h2>Pesu ja kuivaus samalla halvalla jaksolla</h2>
<p>Jos kuivaat pyykin rummussa, kuivaus kuluttaa yleensä enemmän sähköä kuin pesu. Silloin kannattaa ajoittaa molemmat peräkkäin halvalle jaksolle. ${h.a('kuivausrumpu', 'Kuivausrummun laskuri')} näyttää kuivauksen hinnan. Narulla kuivaaminen on edullisinta. Tyypillisistä halvoista tunneista kerrotaan ${h.a('halvin-aika', 'halvimman ajan oppaassa')}.</p>`;
    },
  },
  en: {
    slug: 'washing-machine-electricity-cost',
    nav: 'Washing machine',
    card: 'What a wash costs today and how much timing it saves.',
    title: 'Washing Machine Electricity Cost Finland 2026: Spot Price',
    description: 'Washing machine cost per wash in Finland, 2026: what a wash costs today on spot electricity with transfer and taxes, and the best time to start the machine.',
    h1: 'What does a wash cost on spot electricity?',
    intro: 'A single wash costs cents, but it adds up over a year. The calculator shows the cost of a wash and the cheapest start today or tomorrow.',
    resume: (h) => {
      const v = V(h);
      return `A washing machine’s electricity use depends on the programme and the machine. The energy label gives the eco 40–60 programme’s use per 100 cycles, so divide it by 100 for one wash. The calculator’s default is ${h.num(v.p.kwh, 1)} kWh and a ${h.num(v.p.h)}-hour programme; replace them with your machine’s figures. In Helsinki, on Helen Sähköverkko’s general transfer and a spot contract with a ${h.c(MARG)} margin, a wash costs ${h.eur(v.he.halvin)} today at the cheapest start (${v.he.halvinKlo}) and ${h.eur(v.he.kallein)} at the dearest (${v.he.kalleinKlo}). At the day’s average price it costs ${h.eur(v.he.keski)}. Four washes a week come to about ${h.eur(v.vuosi, 0)} a year, and washing every load in the cheapest hour would save about ${h.eur(v.saasto, 0)} a year at today’s prices. The saving is small compared with an electric car or sauna, but timing costs nothing if the machine has a timer.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'How much electricity does a washing machine use per wash?', a: `It depends on the machine’s energy class, load, programme and temperature. The energy label shows the eco 40–60 programme’s use in kilowatt-hours per 100 cycles. The calculator’s default is ${h.num(v.p.kwh, 1)} kWh per wash. Hot programmes use more, since most energy goes on heating water.` },
        { q: 'When should I start the washing machine?', a: `On spot electricity, at the cheapest time, often at night or early morning. Today in Helsinki the cheapest start is ${v.he.halvinKlo}. A timer helps: many machines let you set when the wash should finish and start themselves. In blocks of flats, house rules may restrict night-time washing because of noise.` },
        { q: 'Should I wash full loads?', a: 'Yes. Motiva advises washing full loads, using the eco programme and lower temperatures where possible, and keeping quick programmes for lightly soiled laundry. Most of the machine’s energy heats water, so a half-empty machine uses more per kilo of laundry.' },
        { q: 'Why is the saving from timing a wash so small?', a: 'Because one wash uses little electricity. Timing only saves the spot price difference, since on general transfer the transfer fee and tax are the same every hour. Bigger savings come from large flexible loads such as car charging and water heaters. A washing machine is still easy to time.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>The cost of a wash in two networks</h2>
${h.table(['Network', 'Cheapest start', 'At average price', 'Dearest start'], [
        ['Helen, general transfer', `${h.eur(v.he.halvin)} (${v.he.halvinKlo})`, h.eur(v.he.keski), `${h.eur(v.he.kallein)} (${v.he.kalleinKlo})`],
        ['Caruna, general transfer', `${h.eur(v.ca.halvin)} (${v.ca.halvinKlo})`, h.eur(v.ca.keski), `${h.eur(v.ca.kallein)} (${v.ca.kalleinKlo})`],
      ], `${h.num(v.p.kwh, 1)} kWh, ${h.num(v.p.h)} h programme, spot contract at the median margin, electricity tax and VAT included.`, ['l', 'r', 'r', 'r'])}
<p>In Caruna’s area the same wash costs more because the transfer fee is higher. The gap does not depend on the time of day, since general transfer costs the same around the clock in both networks.</p>
<h2>The energy label tells you the consumption</h2>
<p>On the EU energy label a washing machine’s use is given in kilowatt-hours per 100 eco 40–60 cycles. If the label says 52, one eco wash uses about 0.52 kWh. Other programmes may use more or less. ${h.src('motivaKoneet', 'Motiva’s appliance advice')} recommends comparing energy labels when buying and choosing a capacity that fits how often you wash.</p>
<h2>Washing and drying in the same cheap window</h2>
<p>If you tumble-dry, drying usually uses more electricity than washing, so schedule both back to back in a cheap window. The ${h.a('kuivausrumpu', 'tumble dryer calculator')} shows the cost of drying. Line-drying is cheapest of all. Typical cheap hours are covered in the ${h.a('halvin-aika', 'cheapest time guide')}.</p>`;
    },
  },
});
