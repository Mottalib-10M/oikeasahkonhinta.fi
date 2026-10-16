import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { jarjestys } from '../../lib/arvot';
import pn from '../../../public/data/postinumerot.json';

/** Gestionnaires de la liste Energiavirasto qui desservent au moins un code postal. */
const EV_N = (pn as { yhtiot: unknown[] }).yhtiot.length;

/** Siirtohinnat : comparaison du transport entre les réseaux du simulateur. */
const V = (h: Helpers) => {
  const k = jarjestys(2000, 'kt'), o = jarjestys(5000, '3x25'), l = jarjestys(18000, '3x25', 'lammitys');
  const ero = (r: typeof k) => r.at(-1)!.paras.e - r[0].paras.e;
  const yleis = h.M.VERKOT.flatMap((v) => { const t = v.tuotteet.find((x) => x.tyyppi === 'yleis' && !x.teho); return t ? [{ v, c: t.energia.kaikki! }] : []; }).sort((a, b) => a.c - b.c);
  const n = h.M.VERKOT.length, sivulla = h.M.VERKOT.filter((x) => x.sivu).length;
  const linkki = (x: { id: string; lyhyt: string; sivu?: string }) => (x.sivu ? h.a(x.sivu, x.lyhyt) : x.lyhyt);
  const teho = h.M.tehoVerkot().map((x) => x.lyhyt);
  return { k, o, l, eroK: ero(k), eroO: ero(o), eroL: ero(l), yleis, n, sivulla, linkki, teho, ev: EV_N };
};

export default defineGuide({
  id: 'siirtohinnat',
  group: 'verkko',
  order: 1,
  tool: 'verkot',
  toolProps: { verkko: 'helen', kwh: 5000, sulakeI: 1 },
  related: ['siirtomaksu', 'tehomaksu', 'siirto-caruna', 'siirto-elenia', 'siirto-helen'],
  sources: ['motivaSiirto', 'evPostinumerot', 'caruna', 'elenia', 'helen', 'veroTaulukko'],
  fi: {
    slug: 'sahkon-siirtohinnat',
    nav: 'Siirtohintojen vertailu',
    card: 'Siirron vuosikustannus kaikissa verkoissa, joiden hinnasto on julkinen, omalla kulutuksellasi ja sulakkeellasi.',
    title: 'Sähkön siirtohinnat 2026: kaikkien verkkoyhtiöiden vertailu',
    description: 'Sähkön siirtohinnat 2026 verkkoyhtiöittäin: vertaa siirron vuosikustannusta Suomen jakeluverkoissa omalla kulutuksellasi ja sulakkeellasi. Hinnat sis. alv:n.',
    h1: 'Sähkön siirtohinnat verkkoyhtiöittäin',
    intro: 'Siirtohinta riippuu siitä, missä asut. Laskuri vertaa siirron vuosikustannusta kaikissa verkoissa, joiden hinnasto on luettavissa, juuri sinun kulutuksellasi.',
    resume: (h) => {
      const v = V(h);
      return `Sähkön siirtohinta on Suomessa alueellinen: verkkoyhtiö määräytyy osoitteen mukaan, eikä sitä voi vaihtaa. Energiaviraston luettelossa on ${v.ev} jakeluverkkoyhtiötä, ja laskurissa on niistä ${v.n}, joiden hinnasto on julkaistu luettavassa muodossa. Erot ovat suuria. Kerrostaloasunnossa, joka kuluttaa 2 000 kilowattituntia vuodessa, siirto maksaa halvimmassa verkossa (${v.k[0].v.lyhyt}) ${h.eur(v.k[0].paras.e, 0)} ja kalleimmassa (${v.k.at(-1)!.v.lyhyt}) ${h.eur(v.k.at(-1)!.paras.e, 0)} vuodessa. Omakotitalossa, jonka kulutus on 5 000 kilowattituntia ja pääsulake 3 × 25 ampeeria, ero halvimman ja kalleimman verkon välillä on ${h.eur(v.eroO, 0)} vuodessa, ja sähkölämmitteisessä 18 000 kilowattitunnin talossa ${h.eur(v.eroL, 0)}. Yleissiirron kilowattituntihinta vaihtelee ${h.c(v.yleis[0].c)} ja ${h.c(v.yleis.at(-1)!.c)} välillä arvonlisäveron kanssa. Laskuri valitsee jokaiselle verkolle sen edullisimman tuotteen ja laskee siirtomaksun, perusmaksun ja mahdollisen tehomaksun yhteen. Syötä oma kulutuksesi, sulakkeesi ja verkkoyhtiösi, niin näet sijoituksesi. Suurimmilla verkoilla on oma sivunsa, johon pääset verkon nimestä. Taulukko näyttää lisäksi kerrostalon ja sähkölämmitystalon vuosikustannuksen jokaisessa verkossa.`;
    },
    faqs: (h) => [
      { q: 'Voinko vaihtaa verkkoyhtiötä, jos siirto on kallista?', a: 'Et voi. Sähkönjakelu on alueellinen monopoli, ja verkkoyhtiö määräytyy käyttöpaikan sijainnin mukaan. Voit kuitenkin vaihtaa siirtotuotetta, yleensä kerran vuodessa maksutta, ja joskus pienentää pääsulaketta. Energiavirasto valvoo, että verkkoyhtiöiden hinnoittelu ja tuotto pysyvät kohtuullisina, ja hinnankorotuksia on rajoitettu laissa. Sähkönmyyjän voit vaihtaa vapaasti.' },
      { q: 'Miksi siirtohinnat eroavat niin paljon alueittain?', a: 'Hinnat määräytyvät verkon kustannuksista asiakasta kohti. Kaupungeissa yhtä johtokilometriä kohti on paljon asiakkaita, maaseudulla vähän. Lisäksi myrskyjen jälkeen moni maaseutuverkko on rakennettu uudelleen maakaapeliksi, mikä on kallista. Siksi samanlainen omakotitalo maksaa siirrosta maaseudulla usein moninkertaisesti kaupunkiin verrattuna. Laskurin taulukko näyttää erot euroina.' },
      { q: 'Sisältyykö sähkövero siirtohintoihin?', a: `Vertailun siirtohinnoissa ei ole sähköveroa, koska se on kaikissa verkoissa sama, ${h.c(h.M.VERO_C, 4)} kilowattitunnilta arvonlisäveron kanssa. Vero laskutetaan kuitenkin verkkoyhtiön laskulla siirron yhteydessä. Jotkin verkkoyhtiöt ilmoittavat hinnastossaan myös sähköverollisen siirtohinnan. Hintalaskuri lisää sen kokonaishintaan. Vertailun järjestys ei siksi muutu veron vuoksi. Hintalaskuri lisää sen kokonaishintaan.` },
      { q: 'Miten tehomaksu on otettu huomioon?', a: `Tehomaksullisia kotitaloustuotteita on ${V(h).teho.length} verkossa, esimerkiksi ${V(h).teho.slice(0, 4).join(', ')}. Maksu riippuu verkosta: Helenillä kuukauden kolmanneksi suurimmasta tunnin tehosta, Lahti Energialla edellisen 12 kuukauden suurimmasta tunnin tehosta. Laskuri kertoo tehomaksun syöttämälläsi huipputeholla, oletuksena 5 kilowattia. Oman huippusi näet verkkoyhtiön asiointipalvelusta.` },
    ],
    body: (h) => {
      const v = V(h);
      const rows = v.o.map((r, i) => [`${i + 1}.`, v.linkki(r.v), r.paras.tu.nimi, h.eur(r.paras.e, 0), h.eur(v.k.find((x) => x.v.id === r.v.id)!.paras.e, 0), h.eur(v.l.find((x) => x.v.id === r.v.id)!.paras.e, 0)]);
      return `<h2>Järjestys omakotitalolla</h2>
${h.table(['#', 'Verkkoyhtiö', 'Edullisin tuote (5 000 kWh)', '5 000 kWh, 3 × 25 A', '2 000 kWh, kerrostalo', '18 000 kWh, sähkölämmitys'], rows, 'Siirron vuosikustannus edullisimmalla tuotteella, € sis. alv: siirtomaksu, perusmaksu ja tehomaksu 5 kW huipulla. Sähkövero ei sisälly.', ['l', 'l', 'l', 'r', 'r', 'r'])}
<p>Järjestys muuttuu kulutuksen mukaan. Pienellä kulutuksella ratkaisee perusmaksu, suurella siirtomaksu ja yö- tai kausisiirron hinnat. Verkko, jonka perusmaksu on pieni mutta siirtomaksu suuri, on edullinen kerrostaloasunnolle mutta voi olla kallis sähkölämmitteiselle talolle.</p>
<h2>Siirtotuotteen valinta on oma säästökeinonsa</h2>
<p>Lähes kaikilla verkkoyhtiöillä on yleissiirron lisäksi aika- tai yösiirto ja kausi- tai vuodenaikasiirto. Väärä tuote voi maksaa sähkölämmitteisessä talossa satoja euroja vuodessa. Jokaisen verkon omalla sivulla on taulukko, josta näet tuotteiden vuosikustannuksen kolmelle tyypilliselle kodille, sekä laskelma siitä, millä kulutuksella aika- tai kausisiirto alkaa kannattaa. ${h.src('motivaSiirto', 'Motivan')} sivulla kerrotaan, mistä siirtomaksu muodostuu.</p>
<h2>Laskurin verkkoyhtiöt</h2>
<p>Laskurissa on ${v.n} Energiaviraston luettelon ${v.ev} jakeluverkkoyhtiöstä: kaikki, joiden kotitaloushinnasto on julkaistu luettavana sivuna tai PDF-tiedostona arvonlisäveron kanssa. Hinnat on luettu kunkin yhtiön omasta hinnastosta, ja tarkistusohjelma varmistaa jokaisen hinnan ja aikajaon lähteestä. Omalla sivullaan on ${v.sivulla} suurinta verkkoa. Jos verkkoyhtiösi puuttuu, voit syöttää sen hinnat itse hintalaskuriin kohdassa Muu verkkoyhtiö. Lue myös ${h.a('siirtomaksu', 'siirtomaksun opas')} ja ${h.a('tehomaksu', 'tehomaksun opas')}.</p>`;
    },
  },
  en: {
    slug: 'electricity-transfer-fees',
    nav: 'Transfer fee comparison',
    card: 'Annual transfer cost in every network with a public price list, on your own consumption and fuse.',
    title: 'Finland Electricity Transfer Fees 2026: Every Network',
    description: 'Finnish electricity transfer fees 2026 by network operator: compare the annual transfer cost across Finland’s grids on your own consumption and fuse. Incl. VAT.',
    h1: 'Electricity transfer fees by network operator',
    intro: 'The transfer price depends on where you live. The calculator compares the annual transfer cost in every network whose price list can be read, on your own consumption.',
    resume: (h) => {
      const v = V(h);
      return `Electricity transfer pricing in Finland is regional: your network operator is set by your address and cannot be changed. The Energy Authority lists ${v.ev} distribution operators, and the calculator covers ${v.n} of them, those whose price list is published in readable form. The differences are large. For a flat using 2,000 kilowatt-hours a year, transfer costs ${h.eur(v.k[0].paras.e, 0)} a year in the cheapest network (${v.k[0].v.lyhyt}) and ${h.eur(v.k.at(-1)!.paras.e, 0)} in the dearest (${v.k.at(-1)!.v.lyhyt}). For a house using 5,000 kilowatt-hours on a 3 × 25 A fuse the gap between cheapest and dearest is ${h.eur(v.eroO, 0)} a year, and for an electrically heated 18,000 kWh house ${h.eur(v.eroL, 0)}. The general transfer price per kilowatt-hour ranges from ${h.c(v.yleis[0].c)} to ${h.c(v.yleis.at(-1)!.c)} including VAT. For each network the calculator picks its cheapest product and adds the transfer fee, basic fee and any power fee. Enter your consumption, fuse and operator to see where you rank.`;
    },
    faqs: (h) => [
      { q: 'Can I switch network operator if transfer is expensive?', a: 'No. Distribution is a regional monopoly and your operator is set by where you live. You can change transfer product, usually free once a year, and sometimes reduce your main fuse. The Energy Authority supervises that pricing and returns stay reasonable, and price rises are capped by law.' },
      { q: 'Why do transfer prices vary so much by region?', a: 'Prices follow network costs per customer. In cities each kilometre of line serves many customers, in the countryside few. After storms many rural networks have also been rebuilt as underground cable, which is expensive. A similar house therefore often pays several times more for transfer in the countryside than in town.' },
      { q: 'Is electricity tax included in transfer prices?', a: `The comparison excludes electricity tax because it is the same in every network, ${h.c(h.M.VERO_C, 4)} per kilowatt-hour including VAT. It is billed by the network operator with transfer, though, and some operators also list a tax-inclusive transfer price. The price calculator adds it to the all-in price.` },
      { q: 'How is the power fee handled?', a: `${V(h).teho.length} networks have household products with a power fee, for example ${V(h).teho.slice(0, 4).join(', ')}. The basis differs: Helen uses the month’s third-highest hourly power, Lahti Energia the highest hourly power of the previous 12 months. The calculator prices the fee at the peak you enter, 5 kW by default. Your own peak is in the operator’s online service.` },
    ],
    body: (h) => {
      const v = V(h);
      const rows = v.o.map((r, i) => [`${i + 1}.`, v.linkki(r.v), r.paras.tu.nimi, h.eur(r.paras.e, 0), h.eur(v.k.find((x) => x.v.id === r.v.id)!.paras.e, 0), h.eur(v.l.find((x) => x.v.id === r.v.id)!.paras.e, 0)]);
      return `<h2>Ranking for a house</h2>
${h.table(['#', 'Operator', 'Cheapest product (5,000 kWh)', '5,000 kWh, 3 × 25 A', '2,000 kWh, flat', '18,000 kWh, electric heating'], rows, 'Annual transfer cost on the cheapest product, € incl. VAT: transfer fee, basic fee and power fee at a 5 kW peak. Electricity tax excluded.', ['l', 'l', 'l', 'r', 'r', 'r'])}
<p>The order changes with consumption. At low use the basic fee decides; at high use the transfer fee and night or seasonal rates. A network with a small basic fee but a high transfer fee is cheap for a flat but can be dear for an electrically heated house.</p>
<h2>Choosing a transfer product is a saving in itself</h2>
<p>Almost every operator offers time-of-day or night transfer and seasonal transfer besides general transfer. The wrong product can cost an electrically heated house hundreds of euros a year. Each network’s own page has a table of the products’ annual cost for three typical homes, and the consumption at which time-of-day or seasonal transfer starts to pay. ${h.src('motivaSiirto', 'Motiva')} explains what the transfer fee is made of.</p>
<h2>Operators in the calculator</h2>
<p>The calculator covers ${v.n} of the Energy Authority’s ${v.ev} distribution operators: every one whose household price list is published as a readable page or PDF including VAT. Prices were read from each company’s own price list, and a check script confirms every price and time band against the source. The ${v.sivulla} largest networks have their own page. If your operator is missing, enter its prices yourself in the price calculator under Other operator. See also the ${h.a('siirtomaksu', 'transfer fee guide')} and the ${h.a('tehomaksu', 'power fee guide')}.</p>`;
    },
  },
});
