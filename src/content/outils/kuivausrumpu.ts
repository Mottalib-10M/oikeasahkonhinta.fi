import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { laiteHinta, MARG } from '../../lib/arvot';

/** Kuivausrumpu : coût d'un séchage au prix réel du quart d'heure, aikasiirto comparé. */
const V = (h: Helpers) => {
  const k = h.P.laitteet.kuivausrumpu;
  const he = laiteHinta(k.kwh, k.h, 'helen'), el = laiteHinta(k.kwh, k.h, 'elenia', 'aika'), ely = laiteHinta(k.kwh, k.h, 'elenia');
  return { k, he, el, ely, vuosi: he.keski * 3 * 52 };
};

export default defineGuide({
  id: 'kuivausrumpu',
  group: 'laite',
  order: 40,
  tool: 'laite',
  toolProps: { laite: 'kuivausrumpu', verkko: 'elenia', tuote: 1 },
  related: ['pyykinpesu', 'halvin-aika', 'siirto-elenia', 'tehomaksu', 'negatiivinen-hinta'],
  sources: ['motivaKoneet', 'nordpool', 'elenia', 'veroTaulukko'],
  fi: {
    slug: 'kuivausrumpu-sahkon-hinta',
    nav: 'Kuivausrumpu',
    card: 'Mitä kuivausrummun kuivaus maksaa tänään ja kuinka paljon yösiirto säästää.',
    title: 'Kuivausrumpu sähkön hinta 2026: kuivauksen hinta tänään',
    description: 'Kuivausrummun sähkönkulutus ja kuivauksen hinta 2026: paljonko kuivaus maksaa tänään pörssisähköllä siirron ja verojen kanssa ja paljonko yösiirto säästää.',
    h1: 'Paljonko kuivausrummun kuivaus maksaa?',
    intro: 'Kuivausrumpu kuluttaa yleensä enemmän sähköä kuin pesukone. Laskuri kertoo kuivauksen hinnan ja halvimman aloitusajan.',
    resume: (h) => {
      const v = V(h);
      return `Kuivausrummun sähkönkulutus riippuu ennen kaikkea rummun tyypistä. Motivan mukaan nykyaikaiset kuivausrummut ovat lämpöpumpputoimisia ja energiatehokkaita, kun taas vanhat kondenssirummut voivat kuluttaa runsaasti sähköä, etenkin korkealla käyttölämpötilalla. Laskurin oletus on ${h.num(v.k.kwh)} kilowattituntia ja ${h.num(v.k.h, 1)} tunnin ohjelma; tarkista oman rumpusi kulutus energiamerkistä. Elenian alueella yösiirrolla ja ${h.c(MARG)} marginaalin pörssisopimuksella kuivaus maksaa tänään halvimmalla aloitusajalla, kello ${v.el.halvinKlo}, ${h.eur(v.el.halvin)} ja kalleimmalla, kello ${v.el.kalleinKlo}, ${h.eur(v.el.kallein)}. Elenian yleissiirrolla halvin kuivaus maksaa ${h.eur(v.ely.halvin)}. Helsingissä Helenin yleissiirrolla kuivaus maksaa päivän keskihinnalla ${h.eur(v.he.keski)}, ja kolme kuivausta viikossa tekee vuodessa noin ${h.eur(v.vuosi, 0)}. Valitse alta oma verkkoyhtiösi, siirtotuotteesi ja sopimuksesi, niin laskuri näyttää halvimman kuivausajan tänään tai huomenna. Kun pyykki linkotaan hyvin ennen kuivausta, rummun kulutus pienenee, koska haihdutettavaa vettä on vähemmän. Myös nukkasihdin puhdistaminen jokaisen kuivauksen jälkeen pitää kulutuksen pienenä.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Kuluttaako kuivausrumpu enemmän sähköä kuin pesukone?', a: `Yleensä kyllä. Pesukone kuluttaa energiaa lähinnä veden lämmittämiseen, kuivausrumpu koko kuivauksen ajan pyykin kosteuden haihduttamiseen. Lämpöpumppurumpu on selvästi säästeliäämpi kuin vanha kondenssi- tai poistoilmarumpu. Laskurin oletus on ${h.num(v.k.kwh)} kilowattituntia kuivaukselta, ja oman rumpusi luvun näet energiamerkistä. Ohjelman valinta vaikuttaa kulutukseen myös.` },
        { q: 'Kannattaako kuivaus ajoittaa yöhön?', a: `Pörssisähköllä usein kannattaa, ja yö- tai aikasiirrolla vielä enemmän, koska silloin myös siirtomaksu on yöllä halvempi. Elenian yösiirrolla tämän päivän halvin kuivaus maksaa ${h.eur(v.el.halvin)} ja kallein ${h.eur(v.el.kallein)}. Huomioi rummun ääni, jos asut kerrostalossa, ja taloyhtiön järjestyssäännöt. Ajastin auttaa.` },
        { q: 'Miten kuivausrummun kulutusta voi pienentää?', a: 'Linkoa pyykki pesukoneessa mahdollisimman suurella kierrosnopeudella, jotta rummun ei tarvitse haihduttaa niin paljon vettä. Puhdista nukkasihti jokaisen kuivauksen jälkeen ja täytä rumpu sopivasti. Motiva neuvoo kuivaamaan pyykin ulkona narulla, kun se on mahdollista, ja harkitsemaan, milloin rumpua todella tarvitaan. Pienetkin muutokset kertyvät vuodessa.' },
        { q: 'Vaikuttaako kuivausrumpu tehomaksuun?', a: 'Lämpöpumppurummun teho on pieni, joten sen vaikutus tehomaksuun on vähäinen. Vastuksella lämmittävä vanhempi rumpu voi ottaa enemmän tehoa, ja jos se on päällä samaan aikaan saunan tai sähköauton latauksen kanssa, tunnin huippu kasvaa. Porrasta suuret laitteet eri tunneille, jos tuotteessasi on tehomaksu.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Kuivauksen hinta tänään</h2>
${h.table(['Verkko ja tuote', 'Halvin aloitus', 'Keskihinnalla', 'Kallein aloitus'], [
        ['Elenia, yösiirto', `${h.eur(v.el.halvin)} (${v.el.halvinKlo})`, h.eur(v.el.keski), `${h.eur(v.el.kallein)} (${v.el.kalleinKlo})`],
        ['Elenia, yleissiirto', `${h.eur(v.ely.halvin)} (${v.ely.halvinKlo})`, h.eur(v.ely.keski), `${h.eur(v.ely.kallein)} (${v.ely.kalleinKlo})`],
        ['Helen, yleissiirto', `${h.eur(v.he.halvin)} (${v.he.halvinKlo})`, h.eur(v.he.keski), `${h.eur(v.he.kallein)} (${v.he.kalleinKlo})`],
      ], `${h.num(v.k.kwh)} kWh, ${h.num(v.k.h, 1)} h ohjelma, pörssisopimus mediaanimarginaalilla, sähkövero ja alv mukana.`, ['l', 'r', 'r', 'r'])}
<p>Yösiirrolla halvimman ja kalleimman aloitusajan ero on suurempi kuin yleissiirrolla, koska siirtomaksu vaihtuu kello 22. Yleissiirrolla ero syntyy pelkästä pörssihinnasta.</p>
<h2>Rummun tyyppi ratkaisee</h2>
<p>${h.src('motivaKoneet', 'Motivan ohjeiden')} mukaan nykyaikaiset kuivausrummut ovat lämpöpumpputoimisia ja energiatehokkaita, mutta vanhat kondenssirummut voivat kuluttaa runsaasti sähköä. Jos rumpusi on vanha ja käytät sitä usein, uuden rummun säästö voi olla suurempi kuin ajoittamisen. Energiamerkissä ilmoitetaan kulutus sataa kuivausta kohden, joten jaa luku sadalla ja syötä se laskuriin.</p>
<h2>Halvin aika pesulle ja kuivaukselle</h2>
<p>Pesu ja kuivaus kestävät yhteensä useita tunteja. Laskurin halvin jakso etsii yhtenäisen ajan, joten aseta kesto pesun ja kuivauksen yhteisajaksi ja käynnistä pesukone jakson alussa. ${h.a('pyykinpesu', 'Pyykinpesun laskuri')} kertoo pesun osuuden. Joskus pörssihinta on jopa ${h.a('negatiivinen-hinta', 'negatiivinen')}, jolloin kuivaus on poikkeuksellisen halpaa.</p>`;
    },
  },
  en: {
    slug: 'tumble-dryer-electricity-cost',
    nav: 'Tumble dryer',
    card: 'What a drying cycle costs today and how much night transfer saves.',
    title: 'Tumble Dryer Electricity Cost Finland 2026: Cost per Load',
    description: 'Tumble dryer cost per load in Finland, 2026: what a drying cycle costs today on spot electricity with transfer and taxes, and what night transfer saves.',
    h1: 'What does a tumble dryer cycle cost?',
    intro: 'A tumble dryer usually uses more electricity than a washing machine. The calculator shows the cost of a cycle and the cheapest start.',
    resume: (h) => {
      const v = V(h);
      return `A tumble dryer’s electricity use depends above all on its type. Motiva notes that modern dryers are heat-pump models and energy-efficient, while old condenser dryers can use a lot of electricity, especially at high temperatures. The calculator’s default is ${h.num(v.k.kwh)} kWh and a ${h.num(v.k.h, 1)}-hour programme; check your own dryer’s energy label. In Elenia’s area, on night transfer and a spot contract with a ${h.c(MARG)} margin, a cycle costs ${h.eur(v.el.halvin)} today at the cheapest start (${v.el.halvinKlo}) and ${h.eur(v.el.kallein)} at the dearest (${v.el.kalleinKlo}). On Elenia’s general transfer the cheapest cycle costs ${h.eur(v.ely.halvin)}. In Helsinki on Helen’s general transfer a cycle costs ${h.eur(v.he.keski)} at the day’s average price, and three cycles a week come to about ${h.eur(v.vuosi, 0)} a year. Choose your operator, transfer product and contract below to see the cheapest drying time today or tomorrow.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Does a tumble dryer use more electricity than a washing machine?', a: `Usually yes. A washing machine uses energy mainly to heat water; a dryer uses it throughout to evaporate moisture. A heat-pump dryer is much more frugal than an old condenser or vented dryer. The calculator’s default is ${h.num(v.k.kwh)} kWh per cycle; your dryer’s figure is on its energy label.` },
        { q: 'Should I dry at night?', a: `On spot electricity it often pays, and more so on night or time-of-day transfer, where night transfer is also cheaper. On Elenia’s night transfer today’s cheapest cycle costs ${h.eur(v.el.halvin)} and the dearest ${h.eur(v.el.kallein)}. Mind the noise and house rules if you live in a block of flats.` },
        { q: 'How can I cut a dryer’s consumption?', a: 'Spin the laundry at the highest speed in the washing machine so the dryer has less water to evaporate. Clean the lint filter after every cycle and load the drum sensibly. Motiva advises line-drying outdoors when possible and thinking about when the dryer is really needed.' },
        { q: 'Does a tumble dryer affect a power fee?', a: 'A heat-pump dryer draws little power, so its effect on a power fee is small. An older dryer with a heating element can draw more, and running it alongside the sauna or car charging lifts the hourly peak. Stagger large appliances across hours if your product has a power fee.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Today’s drying cost</h2>
${h.table(['Network and product', 'Cheapest start', 'At average price', 'Dearest start'], [
        ['Elenia, night transfer', `${h.eur(v.el.halvin)} (${v.el.halvinKlo})`, h.eur(v.el.keski), `${h.eur(v.el.kallein)} (${v.el.kalleinKlo})`],
        ['Elenia, general transfer', `${h.eur(v.ely.halvin)} (${v.ely.halvinKlo})`, h.eur(v.ely.keski), `${h.eur(v.ely.kallein)} (${v.ely.kalleinKlo})`],
        ['Helen, general transfer', `${h.eur(v.he.halvin)} (${v.he.halvinKlo})`, h.eur(v.he.keski), `${h.eur(v.he.kallein)} (${v.he.kalleinKlo})`],
      ], `${h.num(v.k.kwh)} kWh, ${h.num(v.k.h, 1)} h programme, spot contract at the median margin, electricity tax and VAT included.`, ['l', 'r', 'r', 'r'])}
<p>On night transfer the gap between the cheapest and dearest start is wider than on general transfer, because the transfer fee changes at 22:00. On general transfer the gap comes from the spot price alone.</p>
<h2>The dryer type decides</h2>
<p>According to ${h.src('motivaKoneet', 'Motiva’s advice')}, modern dryers are heat-pump models and energy-efficient, but old condenser dryers can use a lot of electricity. If your dryer is old and used often, a new one may save more than timing. The energy label gives use per 100 cycles; divide by 100 and enter it in the calculator.</p>
<h2>The cheapest time to wash and dry</h2>
<p>Washing and drying together take several hours. The calculator’s cheapest window finds one continuous slot, so set the length to the combined time and start the washing machine at the beginning of the window. The ${h.a('pyykinpesu', 'washing machine calculator')} shows the wash’s share. Sometimes the spot price even goes ${h.a('negatiivinen-hinta', 'negative')}, making drying exceptionally cheap.</p>`;
    },
  },
});
