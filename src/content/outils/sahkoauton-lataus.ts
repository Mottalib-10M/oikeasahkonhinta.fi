import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { laiteHinta, MARG } from '../../lib/arvot';

/** Sähköauton lataus : coût d'une recharge à domicile au prix réel du quart d'heure. */
const V = (h: Helpers) => {
  const a = h.P.laitteet.auto;
  const D = a.kwh / a.kw;
  const he = laiteHinta(a.kwh, D, 'helen'), ksoy = laiteHinta(a.kwh, D, 'ksoy', 'aika'), hidas = laiteHinta(a.kwh, a.kwh / 3.7, 'helen');
  return { a, D, he, ksoy, hidas, per100: (he.halvin / a.kwh) * 100 };
};

export default defineGuide({
  id: 'sahkoauton-lataus',
  group: 'laite',
  order: 20,
  tool: 'laite',
  toolProps: { laite: 'auto', verkko: 'helen' },
  related: ['huomenna', 'halvin-aika', 'tehomaksu', 'siirto-ksoy', 'saunan-hinta'],
  sources: ['motivaJousto', 'nordpool', 'veroTaulukko', 'ksoy'],
  fi: {
    slug: 'sahkoauton-lataus-hinta',
    nav: 'Sähköauton lataus',
    card: 'Mitä sähköauton kotilataus maksaa tänään ja mihin aikaan se on halvinta.',
    title: 'Sähköauton lataus hinta 2026: kotilataus pörssisähköllä',
    description: 'Sähköauton latauksen hinta kotona 2026: paljonko lataus maksaa tänään pörssisähköllä siirron ja verojen kanssa ja mihin aikaan lataus on halvinta kotona.',
    h1: 'Sähköauton kotilataus: hinta ja halvin latausaika',
    intro: 'Sähköauto on kodin suurin joustava kuorma. Laskuri kertoo latauksen hinnan halvimmalla ja kalleimmalla aloitusajalla tänään tai huomenna.',
    resume: (h) => {
      const v = V(h);
      return `Kolmivaiheinen 16 ampeerin kotilaturi lataa ${h.num(v.a.kw)} kilowatin teholla, joten ${h.num(v.a.kwh)} kilowattitunnin lataus kestää noin ${h.num(v.D, 1)} tuntia. Helsingissä Helen Sähköverkon yleissiirrolla ja ${h.c(MARG)} marginaalin pörssisopimuksella tällainen lataus maksaa tänään halvimmalla aloitusajalla, kello ${v.he.halvinKlo}, ${h.eur(v.he.halvin)} ja kalleimmalla, kello ${v.he.kalleinKlo}, ${h.eur(v.he.kallein)}. Päivän keskihinnalla lataus maksaa ${h.eur(v.he.keski)}. Kymenlaakson Sähköverkon yösiirrolla, jossa yön siirtomaksu on alle sentin, halvin lataus maksaa ${h.eur(v.ksoy.halvin)}. Halvimmalla ajalla ladattuna sadan kilowattitunnin energia maksaa Helsingissä tänään ${h.eur(v.per100)}, joten auton kulutuksella voit laskea kilometrihinnan. Siirto ja sähkövero ovat yleissiirrossa samat joka tunti, mutta pörssihinnan vaihtelu tekee ajoituksesta kannattavaa. Valitse alta ladattava energia, latausteho, verkkoyhtiösi ja sopimuksesi, niin laskuri näyttää halvimman aloitusajan. Laskuri näyttää myös latauksen vuosikustannuksen valitsemallasi latauskertojen määrällä viikossa. Talvella auto kuluttaa enemmän, joten latauksen tarve kasvaa juuri silloin, kun pörssihinnat ovat usein korkeimmillaan.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Mihin aikaan sähköauto kannattaa ladata?', a: `Pörssisähköllä yleensä yöllä, jolloin kulutus on vähäistä, mutta tuulisena päivänä halvin jakso voi osua myös päivään. Tänään Helsingissä halvin ${h.num(v.D, 1)} tunnin latausjakso alkaa kello ${v.he.halvinKlo}. Huomisen hinnat julkaistaan iltapäivällä, joten latauksen voi ajastaa edellisenä iltana. Laskuri näyttää aloitusajan valitsemallesi latausmäärälle ja teholle.` },
        { q: 'Kannattaako hidas lataus tavallisesta pistorasiasta?', a: `Hidas lataus pidentää latausaikaa, jolloin se kattaa myös kalliimpia tunteja. Laskelmamme mukaan ${h.num(v.a.kwh)} kilowattitunnin lataus 3,7 kilowatin teholla maksaisi Helsingissä halvimmalla aloituksella ${h.eur(v.hidas.halvin)}, kun 11 kilowatin teholla se maksaa ${h.eur(v.he.halvin)}. Tavallinen pistorasia ei myöskään sovellu jatkuvaan lataukseen. Laskurissa voit kokeilla eri tehoja.` },
        { q: 'Vaikuttaako sähköauton lataus tehomaksuun?', a: 'Vaikuttaa, jos verkkoyhtiösi tuotteessa on tehomaksu. 11 kilowatin lataus nostaa tunnin keskitehoa voimakkaasti, varsinkin jos samaan aikaan lämmitetään saunaa tai käytetään muita suuria laitteita. Latauksen ajoittaminen yöhön ja tehon rajoittaminen pitävät huipun pienenä. Monessa laturissa on tehonhallinta tätä varten. Tarkista oma tuotteesi.' },
        { q: 'Kannattaako yösiirto sähköauton takia?', a: 'Jos lataat paljon ja enimmäkseen yöllä, yö- tai aikasiirto voi kannattaa, koska jokainen yöllä ladattu kilowattitunti on silloin halvempi myös siirron osalta. Perusmaksu on kuitenkin suurempi. Laske ero oman verkkoyhtiösi sivulla, jossa on vuosivertailu ja raja, jolla yösiirto alkaa kannattaa.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Latauksen hinta tänään</h2>
${h.table(['Verkko ja tuote', 'Halvin aloitus', 'Keskihinnalla', 'Kallein aloitus'], [
        ['Helen, yleissiirto', `${h.eur(v.he.halvin)} (${v.he.halvinKlo})`, h.eur(v.he.keski), `${h.eur(v.he.kallein)} (${v.he.kalleinKlo})`],
        ['Kymenlaakson Sähköverkko, yösiirto', `${h.eur(v.ksoy.halvin)} (${v.ksoy.halvinKlo})`, h.eur(v.ksoy.keski), `${h.eur(v.ksoy.kallein)} (${v.ksoy.kalleinKlo})`],
      ], `${h.num(v.a.kwh)} kWh, ${h.num(v.a.kw)} kW, pörssisopimus mediaanimarginaalilla, sähkövero ja alv mukana.`, ['l', 'r', 'r', 'r'])}
<p>Lataushäviöt eivät sisälly laskelmaan: osa sähköstä muuttuu lämmöksi laturissa ja akussa, joten verkosta otetaan hieman enemmän kuin akkuun menee. Syötä laskuriin verkosta otettava energia, jos tiedät sen laturin tai auton sovelluksesta.</p>
<h2>Kulutusjousto on sähköauton etu</h2>
<p>${h.src('motivaJousto', 'Motiva')} kannustaa siirtämään joustavaa kulutusta halvoille tunneille. Sähköauto on siihen erityisen sopiva, koska se seisoo usein kotona koko yön ja latausaika on lyhyt verrattuna seisonta-aikaan. Useimmissa autoissa ja latureissa on ajastin tai pörssihintaan perustuva ohjaus. Ohjaus voi aloittaa latauksen automaattisesti halvimmalla jaksolla, kun huomisen hinnat on julkaistu.</p>
<h2>Kilometrihinta</h2>
<p>Kun tiedät autosi kulutuksen kilowattitunteina sadalla kilometrillä, kerro se sadan kilowattitunnin hinnalla ja jaa sadalla. Tänään halvimmalla ajalla Helsingissä ladattu sata kilowattituntia maksaa ${h.eur(v.per100)}. Talvella kulutus kasvaa lämmityksen vuoksi, ja pörssihinnat ovat usein korkeampia. Huomisen halvimman ajan näet ${h.a('huomenna', 'huomisen hintasivulta')} ja tyypilliset halvat tunnit ${h.a('halvin-aika', 'halvimman ajan oppaasta')}.</p>`;
    },
  },
  en: {
    slug: 'electric-car-charging-cost',
    nav: 'EV charging cost',
    card: 'What charging an electric car at home costs today, and the cheapest time to charge.',
    title: 'EV Charging Cost at Home Finland 2026: Spot Electricity',
    description: 'Electric car home charging cost in Finland, 2026: what a charge costs today on spot electricity with transfer and taxes, and the cheapest time to charge.',
    h1: 'Charging an electric car at home: cost and cheapest time',
    intro: 'An electric car is a home’s largest flexible load. The calculator shows the cost of a charge at the cheapest and dearest start today or tomorrow.',
    resume: (h) => {
      const v = V(h);
      return `A three-phase 16 A home charger charges at ${h.num(v.a.kw)} kW, so a ${h.num(v.a.kwh)} kWh charge takes about ${h.num(v.D, 1)} hours. In Helsinki, on Helen Sähköverkko’s general transfer and a spot contract with a ${h.c(MARG)} margin, such a charge costs ${h.eur(v.he.halvin)} today at the cheapest start (${v.he.halvinKlo}) and ${h.eur(v.he.kallein)} at the dearest (${v.he.kalleinKlo}). At the day’s average price it costs ${h.eur(v.he.keski)}. On Kymenlaakson Sähköverkko’s night transfer, where the night transfer fee is under a cent, the cheapest charge costs ${h.eur(v.ksoy.halvin)}. Charged at the cheapest time, 100 kWh costs ${h.eur(v.per100)} in Helsinki today, so with your car’s consumption you can work out the cost per kilometre. On general transfer, transfer and tax are the same every hour, but spot price swings make timing worthwhile. Enter the energy to charge, charging power, operator and contract below to see the cheapest start.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'When is the best time to charge an electric car?', a: `On spot electricity usually at night, when demand is low, but on a windy day the cheapest window can fall in daytime. Today in Helsinki the cheapest ${h.num(v.D, 1)}-hour window starts at ${v.he.halvinKlo}. Tomorrow’s prices come out in the afternoon, so you can schedule charging the evening before.` },
        { q: 'Is slow charging from a normal socket worth it?', a: `Slow charging stretches the charge over more hours, including dearer ones. By our calculation a ${h.num(v.a.kwh)} kWh charge at 3.7 kW would cost ${h.eur(v.hidas.halvin)} at the cheapest start in Helsinki, against ${h.eur(v.he.halvin)} at 11 kW. A normal socket is also not suited to regular charging.` },
        { q: 'Does charging affect a power fee?', a: 'It does if your operator’s product has a power fee. 11 kW charging lifts the hourly average power sharply, especially with the sauna or other large appliances running. Charging at night and limiting power keep the peak down. Many chargers have load management for exactly this.' },
        { q: 'Is night transfer worth it for an electric car?', a: 'If you charge a lot and mostly at night, night or time-of-day transfer can pay because every night-time kilowatt-hour is cheaper on transfer too. The basic fee is higher, though. Check the annual comparison and break-even consumption on your own operator’s page.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Today’s charging cost</h2>
${h.table(['Network and product', 'Cheapest start', 'At average price', 'Dearest start'], [
        ['Helen, general transfer', `${h.eur(v.he.halvin)} (${v.he.halvinKlo})`, h.eur(v.he.keski), `${h.eur(v.he.kallein)} (${v.he.kalleinKlo})`],
        ['Kymenlaakson Sähköverkko, night transfer', `${h.eur(v.ksoy.halvin)} (${v.ksoy.halvinKlo})`, h.eur(v.ksoy.keski), `${h.eur(v.ksoy.kallein)} (${v.ksoy.kalleinKlo})`],
      ], `${h.num(v.a.kwh)} kWh at ${h.num(v.a.kw)} kW, spot contract at the median margin, electricity tax and VAT included.`, ['l', 'r', 'r', 'r'])}
<p>Charging losses are not included: some electricity turns into heat in the charger and battery, so a little more is drawn from the grid than reaches the battery. Enter the energy drawn from the grid if your charger or car app shows it.</p>
<h2>Flexibility is the electric car’s advantage</h2>
<p>${h.src('motivaJousto', 'Motiva')} encourages moving flexible use to cheap hours. An electric car is ideal for this, since it often sits at home all night and the charge is short compared with the time parked. Most cars and chargers have a timer or spot-price-based control that can start charging automatically in the cheapest window once tomorrow’s prices are out.</p>
<h2>Cost per kilometre</h2>
<p>If you know your car’s consumption in kilowatt-hours per 100 km, multiply it by the price of 100 kWh and divide by 100. Today 100 kWh charged at the cheapest time in Helsinki costs ${h.eur(v.per100)}. In winter consumption rises because of heating, and spot prices are often higher. See tomorrow’s cheapest time on the ${h.a('huomenna', 'tomorrow page')} and typical cheap hours in the ${h.a('halvin-aika', 'cheapest time guide')}.</p>`;
    },
  },
});
