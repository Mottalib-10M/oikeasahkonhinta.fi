import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('tampere'); const e = verkkoTiedot('elenia'); const y = t.yleis, a = t.aika!, k = t.kausi!;
  const eroElenia = e.taulu[1].arvot[0].e - t.taulu[1].arvot[0].e;
  return { t, y, a, k, eroElenia, p25: h.M.perusKk(y, '3x25'), p35: h.M.perusKk(y, '3x35'), k25: h.M.perusKk(k, '3x25') };
};

export default defineGuide({
  id: 'siirto-tampere',
  group: 'verkko',
  order: 14,
  tool: 'tanaan',
  toolProps: { verkko: 'tampere', sulake: 1 },
  related: ['siirto-elenia', 'siirtohinnat', 'halvin-aika', 'pyykinpesu', 'sahkovero'],
  sources: ['tampere', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-tampere',
    nav: 'Tampereen Sähköverkko',
    card: 'Tampereen Sähköverkon yleis-, aika- ja kausisiirto sekä pörssisähkön kokonaishinta Tampereella.',
    title: 'Tampereen Sähköverkko siirtohinta 2026: pörssisähkö tänään',
    description: 'Tampereen Sähköverkon siirtohinnat 2026: yleissiirto, aikasiirto ja kausisiirto. Pörssisähkön kokonaishinta Tampereella vartti vartilta siirron ja veron kanssa.',
    h1: 'Tampereen Sähköverkko: pörssisähkön hinta Tampereella',
    intro: 'Tampereen kantakaupungissa siirto on halvempaa kuin ympäröivillä maaseutualueilla. Laskuri näyttää, mitä se tarkoittaa kokonaishinnassa.',
    resume: (h) => {
      const v = V(h);
      return `Tampereen Energia Sähköverkko siirtää sähkön Tampereen kaupunkialueella, kun taas ympäröivä Pirkanmaa kuuluu suurelta osin Elenian verkkoon. Ero näkyy hinnoissa: Tampereen yleissiirron siirtomaksu on ${h.c(v.y.energia.kaikki!)} arvonlisäveron kanssa ja perusmaksu yksivaiheisessa tai 3 × 25 ampeerin liittymässä ${h.eur(v.p25)} kuukaudessa. Omakotitalossa, joka kuluttaa 5 000 kilowattituntia vuodessa, siirto maksaa Tampereella noin ${h.eur(v.eroElenia, 0)} vuodessa vähemmän kuin Elenian yleissiirrolla. Verkkopalveluhinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen, ja yhtiö julkaisi sähköveromuutoksen jälkeen päivitetyn hinnaston, jossa verolliset siirtohinnat on laskettu valmiiksi. Pörssisähkön kokonaishinta yleissiirrolla on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} keskimäärin ${h.c(v.t.paiva.ka)}. Laskuri on asetettu Tampereen yleissiirtoon omakotitalossa; vaihda tilalle oma siirtotuotteesi ja sopimuksesi, niin näet jokaisen vartin kokonaishinnan ja päivän halvimman jakson. Ympäröivän Pirkanmaan Elenian hinnat löydät omalta sivultaan. Postinumerohaku kertoo, kumman yhtiön verkossa osoitteesi on.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Kuuluuko koko Tampere Tampereen Sähköverkon alueeseen?', a: 'Ei aivan. Tampereen Sähköverkko palvelee pääosaa kaupungista, mutta kaupungin reuna-alueilla ja naapurikunnissa verkkoyhtiö on usein Elenia. Raja ei noudata kuntarajaa. Syötä postinumerosi laskuriin, niin se hakee alueen verkkoyhtiön Energiaviraston luettelosta ja valitsee oikean hinnaston automaattisesti. Elenian hinnat ovat omalla sivullaan.' },
        { q: 'Mikä on Tampereen aikasiirron yöaika?', a: `Aikasiirrossa päiväaika on kello 7–22 ja yöaika kello 22–7 Suomen virallista aikaa. Päiväsiirto maksaa ${h.c(v.a.energia.paiva!)} ja yösiirto ${h.c(v.a.energia.yo!)} arvonlisäveron kanssa. Perusmaksu on suurempi kuin yleissiirrossa, joten tuote kannattaa vasta, kun yökulutusta on paljon, kuten varaavassa sähkölämmityksessä. Laskuri näyttää kello 22 kohdalla hinnan pudotuksen.` },
        { q: 'Mitä Tampereen kausisiirron talviarkipäivä tarkoittaa?', a: `Talviarkipäiviä ovat hinnaston mukaan maanantaista lauantaihin 1.11.–31.3. kello 7–22, mukaan lukien arkipyhien päiväaika. Silloin siirtomaksu on ${h.c(v.k.energia.talvipaiva!)}, muulloin ${h.c(v.k.energia.muu!)}. Kausisiirron perusmaksu on 3 × 25 ampeerilla ${h.eur(v.k25)} kuukaudessa, selvästi yleissiirtoa enemmän. Kesällä koko vuorokausi on halvempaa aikaa.` },
        { q: 'Paljonko 3 × 35 ampeerin liittymä maksaa Tampereella?', a: `Yleissiirrossa perusmaksu nousee 3 × 35 ampeerilla ${h.eur(v.p35)} kuukauteen. Ero 3 × 25 ampeeriin on pieni verrattuna moniin maaseutuverkkoihin, joissa perusmaksu lähes kaksinkertaistuu. Sähköauton latauksen takia sulaketta harkitsevalle Tampere on siksi edullinen alue. Muutostyöstä peritään kuitenkin liittymismaksu. Lähde on yhtiön oma hinnasto.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Tampereen hinnasto</h2>
${hintaTaulukko(h, v.t)}
<p>Tampereen Sähköverkon hinnastossa yksivaiheisilla ja 3 × 25 ampeerin käyttöpaikoilla on sama yleissiirron perusmaksu. Hinnaston mukaan verolliset hinnat on pyöristetty kahteen desimaaliin, ja kaikki asiakkaat kuuluvat sähköveroluokkaan 1, elleivät ole ilmoittaneet toiminnasta, joka oikeuttaa luokkaan 2. Kotitaloudet maksavat aina luokan 1 veroa.</p>
<h2>Kenelle mikin tuote</h2>
${vuosiTaulukko(h, v.t)}
<p>Kerrostaloissa ja pientaloissa ilman sähkölämmitystä yleissiirto on selvästi halvin. Tampereen Sähköverkko tarjoaa lisäksi oman siirtotuotelaskurinsa sähkölämmittäjille. Laskelmamme mukaan aikasiirto ohittaa yleissiirron noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattitunnin vuosikulutuksella ja kausisiirto noin ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowattitunnilla, kun kulutus painottuu talveen ja jakautuu tasaisesti vuorokaudelle.</p>
<h2>Halpa siirto korostaa ajoitusta</h2>
<p>Tampereen yleissiirto on laskurin edullisimpia, joten pörssihinnan vaihtelu ratkaisee kokonaishinnan suunnan. Halvalla yötunnilla kokonaishinta on lähellä siirron ja veron summaa, kalliilla iltatunnilla moninkertainen. Siksi ${h.a('halvin-aika', 'halvimpien tuntien')} käyttö säästää Tampereella suhteellisesti enemmän kuin kalliin siirron alueilla. Vertaa naapuriverkkoon ${h.a('siirto-elenia', 'Eleniaan')}.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-tampere',
    nav: 'Tampereen Sähköverkko',
    card: 'Tampereen Sähköverkko’s general, time-of-day and seasonal transfer and the all-in spot price in Tampere.',
    title: 'Tampere Transfer Fee 2026: Spot Electricity With All Fees',
    description: 'Tampereen Sähköverkko transfer fees 2026: general, time-of-day and seasonal transfer. The all-in spot price in Tampere by quarter with transfer and tax.',
    h1: 'Tampereen Sähköverkko: the spot electricity price in Tampere',
    intro: 'In central Tampere transfer is cheaper than in the surrounding rural areas. The calculator shows what that means for the all-in price.',
    resume: (h) => {
      const v = V(h);
      return `Tampereen Energia Sähköverkko distributes electricity in the city of Tampere, while much of the surrounding Pirkanmaa region belongs to Elenia’s network. The difference shows in prices: Tampere’s general transfer fee is ${h.c(v.y.energia.kaikki!)} including VAT and the basic fee for a single-phase or 3 × 25 A connection is ${h.eur(v.p25)} a month. For a house using 5,000 kilowatt-hours a year, transfer in Tampere costs about ${h.eur(v.eroElenia, 0)} a year less than on Elenia’s general transfer. The price list applies from ${h.date(v.t.v.voimassa!)}, and after the electricity tax change the company published an updated list with tax-inclusive transfer prices. The all-in spot price on general transfer averages ${v.t.arvio ? `an estimated ${h.c(v.t.paiva.ka)}` : `${h.c(v.t.paiva.ka)} today`}. The calculator is preset to Tampere’s general transfer for a house; switch to your own product and contract to see every quarter hour’s all-in price and the day’s cheapest window.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Is all of Tampere on Tampereen Sähköverkko’s network?', a: 'Not quite. Tampereen Sähköverkko serves most of the city, but on the outskirts and in neighbouring municipalities the operator is often Elenia, and the boundary does not follow municipal lines. Enter your postcode in the calculator to look up the operator in the Energy Authority list and load its prices automatically.' },
        { q: 'What are the night hours on Tampere’s time-of-day transfer?', a: `Day is 07:00–22:00 and night 22:00–07:00 Finnish time. Day transfer costs ${h.c(v.a.energia.paiva!)} and night transfer ${h.c(v.a.energia.yo!)} including VAT. The basic fee is higher than on general transfer, so the product only pays with plenty of night use, as with storage electric heating.` },
        { q: 'What is a winter weekday on Tampere’s seasonal transfer?', a: `The price list defines it as Monday to Saturday from 1 Nov to 31 Mar, 07:00–22:00, including the daytime of public holidays. The fee is then ${h.c(v.k.energia.talvipaiva!)}, otherwise ${h.c(v.k.energia.muu!)}. The 3 × 25 A basic fee is ${h.eur(v.k25)} a month, clearly more than on general transfer.` },
        { q: 'How much does a 3 × 35 A connection cost in Tampere?', a: `On general transfer the basic fee rises to ${h.eur(v.p35)} a month at 3 × 35 A. The step from 3 × 25 A is small compared with many rural networks, where the basic fee nearly doubles. That makes Tampere a cheap area for anyone upsizing the fuse for car charging.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Tampere’s price list</h2>
${hintaTaulukko(h, v.t)}
<p>On Tampereen Sähköverkko’s price list, single-phase and 3 × 25 A sites have the same general transfer basic fee. Tax-inclusive prices are rounded to two decimals, and every customer is in electricity tax class 1 unless they have declared activity qualifying for class 2. Households always pay class 1 tax.</p>
<h2>Which product for whom</h2>
${vuosiTaulukko(h, v.t)}
<p>In flats and houses without electric heating general transfer is clearly cheapest. Tampereen Sähköverkko also offers its own product calculator for electrically heated homes. By our calculation time-of-day transfer overtakes general transfer at about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours a year and seasonal at about ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'}, with winter-heavy use spread evenly over the day.</p>
<h2>Cheap transfer makes timing matter</h2>
<p>Tampere’s general transfer is among the cheapest in the calculator, so swings in the spot price set the direction of the all-in price. In a cheap night hour the all-in price is close to transfer plus tax; in an expensive evening hour it is several times higher. Using the ${h.a('halvin-aika', 'cheapest hours')} therefore saves relatively more in Tampere than in high-transfer areas. Compare with the neighbouring ${h.a('siirto-elenia', 'Elenia network')}.</p>`;
    },
  },
});
