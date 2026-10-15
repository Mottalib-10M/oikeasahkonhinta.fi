import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { laiteHinta, MARG } from '../../lib/arvot';

/** Saunan hinta : coût d'une séance de sauna électrique au prix réel du quart d'heure. */
const V = (h: Helpers) => {
  const s = h.P.laitteet.sauna;
  const E = s.kw * s.h;
  const he = laiteHinta(E, s.h, 'helen'), js = laiteHinta(E, s.h, 'jse');
  const iso = laiteHinta(9 * s.h, s.h, 'helen');
  return { s, E, he, js, iso, vuosi: he.keski * 2 * 52 };
};

export default defineGuide({
  id: 'saunan-hinta',
  group: 'laite',
  order: 10,
  tool: 'laite',
  toolProps: { laite: 'sauna', verkko: 'helen' },
  related: ['sahkoauton-lataus', 'halvin-aika', 'tehomaksu', 'siirto-helen', 'pyykinpesu'],
  sources: ['motivaSauna', 'nordpool', 'veroTaulukko', 'helen'],
  fi: {
    slug: 'saunan-lammityksen-hinta',
    nav: 'Saunan hinta',
    card: 'Paljonko saunan lämmitys maksaa tänään pörssisähköllä ja milloin se on halvinta.',
    title: 'Saunan lämmityksen hinta 2026: sähkökiuas pörssisähköllä',
    description: 'Saunan lämmityksen hinta 2026: paljonko sähkökiukaan lämmitys maksaa tänään pörssisähköllä siirron ja verojen kanssa, ja mihin aikaan saunominen on halvinta.',
    h1: 'Paljonko saunan lämmitys maksaa pörssisähköllä?',
    intro: 'Sähkökiuas on kodin suurimpia yksittäisiä sähkönkuluttajia. Laskuri kertoo, mitä saunavuoro maksaa tänään ja milloin se on halvin.',
    resume: (h) => {
      const v = V(h);
      return `Motivan mukaan kertalämmitteinen sähkökiuas on kodin ylivoimaisesti eniten kuluttava yksittäinen sähkölaite, ja yli puolet saunan sähköstä kuluu esilämmitykseen. ${h.num(v.s.kw)} kilowatin kiuas kuluttaa puolentoista tunnin lämmityksessä ja saunomisessa noin ${h.num(v.E, 1)} kilowattituntia. Helsingissä Helen Sähköverkon yleissiirrolla ja ${h.c(MARG)} marginaalin pörssisopimuksella tällainen saunavuoro maksaa päivän halvimmalla aloitusajalla, kello ${v.he.halvinKlo}, ${h.eur(v.he.halvin)} ja kalleimmalla, kello ${v.he.kalleinKlo}, ${h.eur(v.he.kallein)}. Päivän keskihinnalla se maksaa ${h.eur(v.he.keski)}. Järvi-Suomen Energian alueella, jossa siirto on kalliimpaa, sama saunavuoro maksaa keskihinnalla ${h.eur(v.js.keski)}. Kaksi saunavuoroa viikossa tekee Helsingissä vuodessa noin ${h.eur(v.vuosi, 0)}. Valitse alta kiukaasi teho, lämmityksen kesto, verkkoyhtiösi ja sopimuksesi, niin laskuri näyttää halvimman ja kalleimman aloitusajan tänään tai huomenna sekä vuosikustannuksen. Laskuri näyttää myös vuosikustannuksen valitsemallasi saunakertojen määrällä viikossa sekä aloituksen hinnan heti nyt, jos lämmität saunan tänään.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Paljonko sähkösaunan lämmitys kuluttaa sähköä?', a: `Kulutus on kiukaan teho kerrottuna käyttöajalla. ${h.num(v.s.kw)} kilowatin kiuas kuluttaa tunnissa enintään ${h.num(v.s.kw)} kilowattituntia, käytännössä hieman vähemmän, koska termostaatti katkaisee lämmityksen kiukaan ollessa kuuma. Puolentoista tunnin saunavuoro kuluttaa noin ${h.num(v.E, 1)} kilowattituntia. Isompi sauna ja tehokkaampi kiuas kuluttavat enemmän. Laskuri laskee tämän puolestasi.` },
        { q: 'Mihin aikaan sauna kannattaa lämmittää?', a: `Pörssisähköllä halvimpaan aikaan, joka on usein myöhään illalla tai yöllä, mutta vaihtelee päivittäin. Tänään Helsingissä halvin aloitus on kello ${v.he.halvinKlo}. Ero halvimman ja kalleimman aloitusajan välillä on ${h.eur(v.he.kallein - v.he.halvin)} saunavuorolta. Huomisen halvimman ajan näet, kun valitset laskurissa Huomenna. Lämmitä sauna kerralla koko perheelle.` },
        { q: 'Paljonko säästän laskemalla saunan lämpötilaa?', a: 'Motivan mukaan energiatehokkain saunan lämpötila on 70–80 astetta, ja saunan lämmittäminen sataan asteeseen nostaa sähkönkulutusta 20–30 prosenttia. Lisäksi sauna kannattaa lämmittää kerralla koko perheelle ja vähentää ilmanvaihtoa lämmityksen alussa. Turhinta on pitää saunaa lämpimänä tyhjillään. Säästö toistuu jokaisella saunakerralla, joten se kertyy vuodessa.' },
        { q: 'Vaikuttaako saunominen tehomaksuun?', a: `Kyllä, jos verkkoyhtiösi tuotteessa on tehomaksu. ${h.num(v.s.kw)} kilowatin kiuas nostaa tunnin keskitehoa merkittävästi, ja jos samaan aikaan latautuu sähköauto tai pyörii kuivausrumpu, kuukauden huippu voi nousta. Esimerkiksi Helenin aikasiirrossa tehomaksu määräytyy kuukauden kolmanneksi suurimman tunnin mukaan, joten yksittäinen saunavuoro ei yksin ratkaise.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Saunavuoron hinta kolmella kiukaalla</h2>
${h.table(['Kiuas', 'Energia', 'Halvin aloitus', 'Keskihinnalla', 'Kallein aloitus'], [
        [`${h.num(v.s.kw)} kW, ${h.num(v.s.h, 1)} h`, `${h.num(v.E, 1)} kWh`, `${h.eur(v.he.halvin)} (${v.he.halvinKlo})`, h.eur(v.he.keski), `${h.eur(v.he.kallein)} (${v.he.kalleinKlo})`],
        [`9 kW, ${h.num(v.s.h, 1)} h`, `${h.num(9 * v.s.h, 1)} kWh`, `${h.eur(v.iso.halvin)} (${v.iso.halvinKlo})`, h.eur(v.iso.keski), `${h.eur(v.iso.kallein)} (${v.iso.kalleinKlo})`],
      ], 'Helen Sähköverkon yleissiirto, pörssisopimus mediaanimarginaalilla, sähkövero ja alv mukana. Energia jaetaan tasan lämmityksen varteille.', ['l', 'r', 'r', 'r', 'r'])}
<p>Taulukon hinnat on laskettu sivun päivityspäivän pörssihinnoilla, ja ne päivittyvät joka päivä. Kiukaan teho lukee sen arvokilvessä, ja se on yleensä mitoitettu saunahuoneen tilavuuden mukaan. Mitä suurempi saunahuone ja mitä huonompi eristys, sitä pidempään kiukaan pitää lämmittää.</p>
<h2>Mistä saunavuoron hinta koostuu</h2>
<p>Saunavuoron hinnassa on samat osat kuin muussakin sähkössä: pörssihinta ja marginaali, siirtomaksu sekä sähkövero. Siirto ja vero maksavat jokaisesta kilowattitunnista saman verran kellonajasta riippumatta, jos siirtotuote on yleissiirto, joten Helsingissä niiden osuus saunavuorosta on ${h.eur(v.he.siirtoVero)} aina. Ajoittamalla voi säästää vain pörssihinnan erossa. Aikasiirrossa myös siirto on yöllä halvempaa, ja kausisiirrossa talviarkipäivinä kalliimpaa.</p>
<h2>Viisi tapaa saunoa halvemmalla</h2>
<ol>
<li>Lämmitä sauna kerralla koko perheelle, sillä esilämmitys vie yli puolet energiasta.</li>
<li>Pidä lämpötila 70–80 asteessa: sataan asteeseen lämmittäminen kuluttaa Motivan mukaan 20–30 prosenttia enemmän.</li>
<li>Valitse halvin aloitusaika laskurista, jos sopimuksesi on pörssisopimus.</li>
<li>Älä jätä kiuasta päälle saunomisen jälkeen.</li>
<li>Vältä saunan lämmittämistä samaan aikaan sähköauton latauksen kanssa, jos verkkoyhtiösi tuotteessa on ${h.a('tehomaksu', 'tehomaksu')}.</li>
</ol>
<p>${h.src('motivaSauna', 'Motivan energiatehokkaan saunan ohjeet')} kertovat lisää. Muiden laitteiden hinnat näet ${h.a('sahkoauton-lataus', 'sähköauton lataus')}- ja ${h.a('pyykinpesu', 'pyykinpesu')}-laskureista.</p>`;
    },
  },
  en: {
    slug: 'sauna-electricity-cost',
    nav: 'Sauna cost',
    card: 'What heating the sauna costs today on spot electricity, and when it is cheapest.',
    title: 'Sauna Electricity Cost Finland 2026: Electric Stove on Spot',
    description: 'Sauna electricity cost in Finland, 2026: what heating an electric stove costs today on spot electricity with transfer and taxes, and the cheapest time to bathe.',
    h1: 'What does heating the sauna cost on spot electricity?',
    intro: 'An electric sauna stove is one of the largest single power users in a home. The calculator shows what a sauna costs today and when it is cheapest.',
    resume: (h) => {
      const v = V(h);
      return `According to Motiva, a one-off electric sauna stove is by far the largest single electrical appliance in a home, and over half of its electricity goes on preheating. A ${h.num(v.s.kw)} kW stove uses about ${h.num(v.E, 1)} kilowatt-hours over an hour and a half of heating and bathing. In Helsinki, on Helen Sähköverkko’s general transfer and a spot contract with a ${h.c(MARG)} margin, such a sauna costs ${h.eur(v.he.halvin)} at the day’s cheapest start (${v.he.halvinKlo}) and ${h.eur(v.he.kallein)} at the dearest (${v.he.kalleinKlo}). At the day’s average price it costs ${h.eur(v.he.keski)}. In Järvi-Suomen Energia’s area, where transfer is dearer, the same sauna costs ${h.eur(v.js.keski)} at the average price. Two saunas a week come to about ${h.eur(v.vuosi, 0)} a year in Helsinki. Enter your stove’s power, heating time, operator and contract below to see today’s or tomorrow’s cheapest and dearest start and the annual cost.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'How much electricity does an electric sauna use?', a: `Use equals the stove’s power times the time it runs. A ${h.num(v.s.kw)} kW stove uses at most ${h.num(v.s.kw)} kilowatt-hours an hour, a little less in practice as the thermostat cuts in when the stones are hot. An hour-and-a-half sauna uses about ${h.num(v.E, 1)} kilowatt-hours. A bigger room and a more powerful stove use more.` },
        { q: 'When is the best time to heat the sauna?', a: `On spot electricity, at the cheapest time, often late evening or night, but it changes daily. Today in Helsinki the cheapest start is ${v.he.halvinKlo}. The gap between the cheapest and dearest start is ${h.eur(v.he.kallein - v.he.halvin)} per sauna. Choose Tomorrow in the calculator to see tomorrow’s cheapest time.` },
        { q: 'How much do I save by lowering the sauna temperature?', a: 'Motiva says the most energy-efficient sauna temperature is 70–80 °C, and heating to 100 °C raises consumption by 20–30%. Heat the sauna once for the whole family and reduce ventilation at the start of heating. The biggest waste is keeping an empty sauna hot.' },
        { q: 'Does the sauna affect a power fee?', a: `Yes, if your operator’s product has a power fee. A ${h.num(v.s.kw)} kW stove lifts the hourly average power considerably, and if a car is charging or a dryer running at the same time, the month’s peak can rise. On Helen’s time-of-day transfer, for example, the fee follows the month’s third-highest hour, so one sauna alone does not decide it.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>The cost of a sauna with two stoves</h2>
${h.table(['Stove', 'Energy', 'Cheapest start', 'At average price', 'Dearest start'], [
        [`${h.num(v.s.kw)} kW, ${h.num(v.s.h, 1)} h`, `${h.num(v.E, 1)} kWh`, `${h.eur(v.he.halvin)} (${v.he.halvinKlo})`, h.eur(v.he.keski), `${h.eur(v.he.kallein)} (${v.he.kalleinKlo})`],
        [`9 kW, ${h.num(v.s.h, 1)} h`, `${h.num(9 * v.s.h, 1)} kWh`, `${h.eur(v.iso.halvin)} (${v.iso.halvinKlo})`, h.eur(v.iso.keski), `${h.eur(v.iso.kallein)} (${v.iso.kalleinKlo})`],
      ], 'Helen Sähköverkko general transfer, spot contract at the median margin, electricity tax and VAT included. Energy is spread evenly over the heating quarters.', ['l', 'r', 'r', 'r', 'r'])}
<p>The table uses the exchange prices of the day the page was updated and refreshes daily. Your stove’s power is on its rating plate, and it is usually sized to the room’s volume. The larger the room and the poorer the insulation, the longer the stove must heat.</p>
<h2>What a sauna’s cost is made of</h2>
<p>A sauna has the same price parts as any other electricity: exchange price and margin, transfer fee and electricity tax. On general transfer, transfer and tax cost the same at every hour, so in Helsinki they account for ${h.eur(v.he.siirtoVero)} of every sauna whenever you heat it. Timing only saves on the exchange price. On time-of-day transfer night transfer is cheaper too, and on seasonal transfer winter weekdays are dearer.</p>
<h2>Five ways to a cheaper sauna</h2>
<ol>
<li>Heat the sauna once for the whole family, since preheating takes over half the energy.</li>
<li>Keep it at 70–80 °C: heating to 100 °C uses 20–30% more, according to Motiva.</li>
<li>Pick the cheapest start time in the calculator if you are on a spot contract.</li>
<li>Do not leave the stove on after bathing.</li>
<li>Avoid heating the sauna while the car charges if your operator has a ${h.a('tehomaksu', 'power fee')}.</li>
</ol>
<p>${h.src('motivaSauna', 'Motiva’s energy-efficient sauna advice')} has more. See the ${h.a('sahkoauton-lataus', 'car charging')} and ${h.a('pyykinpesu', 'washing machine')} calculators for other appliances.</p>`;
    },
  },
});
