import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('ksoy'); const y = t.yleis, a = t.aika!, k = t.kausi!;
  return { t, y, a, k, kt: h.M.perusKk(y, 'kt'), p25: h.M.perusKk(y, '3x25'), a25: h.M.perusKk(a, '3x25'), ero: a.energia.paiva! - a.energia.yo! };
};

export default defineGuide({
  id: 'siirto-ksoy',
  group: 'verkko',
  order: 16,
  tool: 'tanaan',
  toolProps: { verkko: 'ksoy', tuote: 1, sulake: 1 },
  related: ['siirtohinnat', 'sahkoauton-lataus', 'halvin-aika', 'siirto-jse', 'huomenna'],
  sources: ['ksoy', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-kymenlaakson-sahkoverkko',
    nav: 'Kymenlaakson Sähköverkko',
    card: 'Kymenlaakson Sähköverkon halpa yösiirto ja pörssisähkön kokonaishinta Kymenlaaksossa.',
    title: 'Kymenlaakson Sähköverkko siirtohinta 2026: yösiirto, pörssi',
    description: 'Kymenlaakson Sähköverkon siirtohinnat 2026: yleis-, yö- ja vuodenaikasiirto. Yösiirron edullinen yöhinta ja pörssisähkön kokonaishinta vartti vartilta tänään.',
    h1: 'Kymenlaakson Sähköverkko: halpa yö ja pörssisähkö',
    intro: 'Kymenlaakson Sähköverkon yösiirrossa yön siirtohinta on alle sentin. Laskuri on valmiiksi asetettu yösiirtoon.',
    resume: (h) => {
      const v = V(h);
      return `Kymenlaakson Sähköverkko siirtää sähkön Kymenlaaksossa ja itäisellä Uudellamaalla, esimerkiksi Kotkassa, Haminassa, Kouvolassa ja Loviisassa. Pienasiakkaiden hinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen. Sen erikoisuus on yösiirto: päiväsiirto kello 7–22 maksaa ${h.c(v.a.energia.paiva!)}, mutta yösiirto vain ${h.c(v.a.energia.yo!)} arvonlisäveron kanssa. Ero on ${h.c(v.ero)}, laskurin verkoista suurimpia. Yleissiirron siirtomaksu on ${h.c(v.y.energia.kaikki!)} ja perusmaksu 3 × 25 ampeerin liittymällä ${h.eur(v.p25)} kuukaudessa; kerros- ja rivitalojen alempaa perusmaksua sovelletaan, kun liittymässä on vähintään viisi käyttöpaikkaa. Pörssisähkön kokonaishinta on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} yleissiirrolla keskimäärin ${h.c(v.t.paiva.ka)}${v.t.paivaAika ? ` ja yösiirrolla ${h.c(v.t.paivaAika.ka)}` : ''}. Laskuri on asetettu yösiirtoon omakotitalossa. Kun yön halpa siirto ja yön tavallisesti halpa pörssihinta osuvat yhteen, kokonaishinta laskee yöllä selvästi; näet sen kaaviossa kello 22 kohdalla. Yleissiirto on edelleen yleensä halvin kerrostaloasunnoissa ja pienen kulutuksen kodeissa. Postinumerohaku varmistaa yhtiön.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Kenelle Kymenlaakson Sähköverkon yösiirto sopii?', a: `Hinnaston mukaan yösiirto soveltuu sähkölämmittäjälle, jonka lämmitys on varaava ja sähkönkäyttö pääasiassa yöaikaan. Perusmaksu on 3 × 25 ampeerilla ${h.eur(v.a25)} kuukaudessa, joten yön ${h.c(v.ero)} säästö kilowattitunnilta kuittaa sen vasta, kun yökulutusta on paljon. Laskelmamme mukaan raja on noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattituntia vuodessa.` },
        { q: 'Kannattaako sähköauto ladata yöllä Kymenlaaksossa?', a: `Yösiirrolla kyllä: jokainen yöllä ladattu kilowattitunti säästää siirrossa ${h.c(v.ero)} päivään verrattuna, ja pörssihinta on yöllä usein halvimmillaan. Esimerkiksi 40 kilowattitunnin latauksessa pelkkä siirron ero on ${h.eur((40 * v.ero) / 100)}. Sähköautolaskuri näyttää koko latauksen hinnan halvimmalla aloitusajalla. Pörssihinnan ero yön ja päivän välillä tulee tämän päälle.` },
        { q: 'Mitä tarkoittaa viiden käyttöpaikan ehto?', a: `Kymenlaakson Sähköverkon alempi perusmaksu, yleissiirrossa ${h.eur(v.kt)} kuukaudessa, on valittavissa rivi- tai kerrostalon liittymässä, jossa on vähintään viisi voimassa olevaa käyttöpaikkaa. Pienemmässä paritalossa tai erillisessä asunnossa sovelletaan 3 × 25 ampeerin perusmaksua, joka on ${h.eur(v.p25)}. Laskurissa valinta Kerrostalo käyttää alempaa maksua.` },
        { q: 'Miten vuodenaikasiirto eroaa yösiirrosta?', a: `Vuodenaikasiirrossa kallis aika on talviarkipäivä, 1.11.–31.3. maanantaista lauantaihin kello 7–22, jolloin siirto maksaa ${h.c(v.k.energia.talvipaiva!)}. Muulloin se on ${h.c(v.k.energia.muu!)}. Hinnaston mukaan tuote sopii maatilalle ja muulle käyttöpaikalle, jolla kulutus on runsasta yöllä ja kesällä. Perusmaksu on sama kuin yösiirrossa, joten valinta riippuu siitä, kumpi aikajako vastaa kulutustasi paremmin.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Hinnasto pienasiakkaille</h2>
${hintaTaulukko(h, v.t)}
<p>Kymenlaakson Sähköverkko ilmoittaa hinnat sekä verottomina että verollisina; verottomat koskevat lähinnä yritysasiakkaita. Laskuri käyttää verollisia hintoja. Yhtiö käyttää myyjän puolesta tehtävissä laskutuksen korjauksissa pohjoismaisen sähköpörssin Suomen spot-hintaa.</p>
<h2>Vuosikustannus ja yösiirron raja</h2>
${vuosiTaulukko(h, v.t)}
<p>Taulukon sähkölämmitystalo kuluttaa tasaisesti ympäri vuorokauden. Todellisessa varaavassa lämmityksessä suurin osa sähköstä otetaan yöllä, jolloin yösiirron etu on vielä suurempi kuin taulukossa. Kerrostalossa ja pienen kulutuksen talossa yleissiirto pysyy halvimpana.</p>
<h2>Kahden halvan yön vaikutus</h2>
<p>Pörssihinnan halvimmat tunnit ovat usein yöllä, ja Kymenlaakson yösiirrossa myös siirto on silloin poikkeuksellisen halpaa. Siksi yöllä ajastettu kulutus, kuten ${h.a('sahkoauton-lataus', 'sähköauton lataus')} tai lämminvesivaraaja, voi maksaa alueella vain murto-osan iltapäivän hinnasta. Katso ${h.a('halvin-aika', 'halvimmat tunnit')} ja vertaa muihin verkkoihin ${h.a('siirtohinnat', 'siirtohintojen vertailussa')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-kymenlaakson-sahkoverkko',
    nav: 'Kymenlaakson Sähköverkko',
    card: 'Kymenlaakson Sähköverkko’s cheap night transfer and the all-in spot price in Kymenlaakso.',
    title: 'Kymenlaakso Transfer Fee 2026: Night Transfer and Spot Price',
    description: 'Kymenlaakson Sähköverkko transfer fees 2026: general, night and seasonal transfer. The low night rate and the all-in spot electricity price by quarter today.',
    h1: 'Kymenlaakson Sähköverkko: cheap nights and spot electricity',
    intro: 'On Kymenlaakson Sähköverkko’s night transfer the night rate is under one cent. The calculator is preset to night transfer.',
    resume: (h) => {
      const v = V(h);
      return `Kymenlaakson Sähköverkko distributes electricity in Kymenlaakso and eastern Uusimaa, including Kotka, Hamina, Kouvola and Loviisa. Its small-customer price list applies from ${h.date(v.t.v.voimassa!)}. Its stand-out feature is night transfer: day transfer (07:00–22:00) costs ${h.c(v.a.energia.paiva!)} but night transfer only ${h.c(v.a.energia.yo!)} including VAT, a gap of ${h.c(v.ero)} and one of the widest among the calculator’s networks. General transfer costs ${h.c(v.y.energia.kaikki!)} with a basic fee of ${h.eur(v.p25)} a month on 3 × 25 A; the lower flat rate applies when at least five sites share the connection. ${v.t.arvio ? 'By estimate, the' : 'Today the'} all-in spot price averages ${h.c(v.t.paiva.ka)} on general transfer${v.t.paivaAika ? ` and ${h.c(v.t.paivaAika.ka)} on night transfer` : ''}. The calculator is preset to night transfer for a house. When cheap night transfer meets the usually cheap night-time spot price, the all-in price drops sharply after 22:00, as the chart shows.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Who is Kymenlaakson Sähköverkko’s night transfer for?', a: `The price list says it suits electric heating that is storage-based, with use mainly at night. The 3 × 25 A basic fee is ${h.eur(v.a25)} a month, so the ${h.c(v.ero)} night saving per kilowatt-hour only pays it back with substantial night use. By our calculation the break-even is about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours a year.` },
        { q: 'Should I charge my car at night in Kymenlaakso?', a: `On night transfer, yes: every kilowatt-hour charged at night saves ${h.c(v.ero)} on transfer compared with the day, and the spot price is often lowest at night. On a 40 kWh charge the transfer gap alone is ${h.eur((40 * v.ero) / 100)}. The electric car calculator shows the whole charge at the cheapest start.` },
        { q: 'What is the five-site condition?', a: `The lower basic fee, ${h.eur(v.kt)} a month on general transfer, is available for a terraced or apartment building connection with at least five active sites. A smaller semi-detached house or a single home pays the 3 × 25 A basic fee of ${h.eur(v.p25)}.` },
        { q: 'How does seasonal transfer differ from night transfer?', a: `On seasonal transfer the expensive time is the winter weekday, 1 Nov to 31 Mar, Monday to Saturday 07:00–22:00, when transfer costs ${h.c(v.k.energia.talvipaiva!)}. Otherwise it is ${h.c(v.k.energia.muu!)}. The price list says it suits farms and other sites with heavy use at night and in summer.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Small-customer price list</h2>
${hintaTaulukko(h, v.t)}
<p>Kymenlaakson Sähköverkko publishes prices both with and without tax; tax-free prices mainly concern business customers. The calculator uses tax-inclusive prices. When correcting billing on a retailer’s behalf, the company uses the Nordic exchange’s Finnish spot price.</p>
<h2>Annual cost and the night transfer threshold</h2>
${vuosiTaulukko(h, v.t)}
<p>The electrically heated house in the table uses power evenly around the clock. With real storage heating most electricity is drawn at night, so the night transfer advantage is larger still than the table shows. In flats and low-use houses general transfer remains cheapest.</p>
<h2>Two cheap nights at once</h2>
<p>The cheapest spot hours are often at night, and on Kymenlaakso’s night transfer transfer is unusually cheap then too. Timed night-time use, such as ${h.a('sahkoauton-lataus', 'car charging')} or a water heater, can cost a fraction of the afternoon price here. See the ${h.a('halvin-aika', 'cheapest hours')} and compare with other networks in the ${h.a('siirtohinnat', 'transfer fee comparison')}.</p>`;
    },
  },
});
