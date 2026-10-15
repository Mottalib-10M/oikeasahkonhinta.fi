import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('oulu'); const y = t.yleis;
  const vuosi25 = y.perusVuosi!['3x25']!, vuosiKt = y.perusVuosi!.kt!;
  return { t, y, vuosi25, vuosiKt, kk25: h.M.perusKk(y, '3x25'), kkKt: h.M.perusKk(y, 'kt') };
};

export default defineGuide({
  id: 'siirto-oulu',
  group: 'verkko',
  order: 15,
  tool: 'tanaan',
  toolProps: { verkko: 'oulu', sulake: 1 },
  related: ['siirtohinnat', 'siirto-elenia', 'sahkolasku', 'porssi-vai-kiintea', 'siirtomaksu'],
  sources: ['oulu', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-oulu',
    nav: 'Oulun Energia',
    card: 'Oulun Energia Sähköverkon yleissähkön siirto ja pörssisähkön kokonaishinta Oulussa.',
    title: 'Oulun Energia siirtohinta 2026: pörssisähkö siirron kanssa',
    description: 'Oulun Energia Sähköverkon siirtohinnat 2026: yleissähkö ja vuosiperusmaksu sulakkeen mukaan. Näe pörssisähkön kokonaishinta Oulussa vartti vartilta tänään.',
    h1: 'Oulun Energia Sähköverkko: pörssisähkön hinta Oulussa',
    intro: 'Oulussa perusmaksu ilmoitetaan vuosimaksuna, ja siirtomaksu kuuluu maan edullisimpiin. Laskuri muuntaa molemmat kokonaishinnaksi.',
    resume: (h) => {
      const v = V(h);
      return `Oulun Energia Sähköverkko siirtää sähkön Oulun kaupunkialueella. Sen verkkopalveluhinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen, ja se poikkeaa muista siinä, että perusmaksu ilmoitetaan euroina vuodessa: yleissähkössä 3 × 25–63 ampeerin liittymällä ${h.eur(v.vuosi25)} vuodessa eli ${h.eur(v.kk25)} kuukaudessa ja pienemmillä yksivaiheisilla liittymillä ${h.eur(v.vuosiKt)} vuodessa. Yleissähkön siirtomaksu on ${h.c(v.y.energia.kaikki!)} arvonlisäveron kanssa, mikä on laskurin verkoista edullisimpien joukossa. Omakotitalon 5 000 kilowattitunnin siirto on Oulussa ${v.t.sija5}. halvin laskurin ${v.t.n} verkosta. Pörssisähkön kokonaishinta yleissähkön siirrolla on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} keskimäärin ${h.c(v.t.paiva.ka)}. Laskurissa on Oulun Energian yleissähkö; yhtiön aika- ja kausisähkön tuotteet näkyvät hinnastossa, mutta niiden aikarajoja ei ole ilmoitettu hinnastossa, joten ne voi laskea valitsemalla Muu ja syöttämällä hinnan laskusta. Oulun seudulla toimii myös muita verkkoyhtiöitä, joten tarkista oma yhtiösi postinumerolla. Laskurin taulukot näyttävät yleissähkön vuosikustannuksen.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miksi Oulun Energian perusmaksu on euroa vuodessa?', a: `Oulun Energia ilmoittaa perusmaksun vuosihintana, vaikka se laskutetaan jaksoittain. Kun vertaat muihin verkkoihin, jaa vuosimaksu kahdellatoista: yleissähkön 3 × 25 ampeerin ${h.eur(v.vuosi25)} vuodessa on ${h.eur(v.kk25)} kuukaudessa. Laskuri tekee muunnoksen automaattisesti ja näyttää kuukausimaksut samassa muodossa kuin muissa verkoissa. Vertailu on siksi suoraan yhteismitallinen.` },
        { q: 'Onko Oulun Energian siirto edullista?', a: `On. Yleissähkön siirtomaksu ${h.c(v.y.energia.kaikki!)} ja kuukauteen muunnettu perusmaksu ovat molemmat laskurin edullisimpien joukossa. Ympäröivän Pohjois-Pohjanmaan maaseudulla verkkoyhtiö on usein Elenia tai jokin paikallinen yhtiö, joiden hinnat ovat yleensä korkeammat. Postinumerohaku kertoo oman alueesi yhtiön. Kaupungin sisälläkin kannattaa tarkistaa yhtiö, koska Oulun seudulla toimii useampi verkkoyhtiö.` },
        { q: 'Voiko Oulussa valita aikasähkön?', a: 'Oulun Energian hinnastossa on yleissähkön lisäksi aikasähkö, kausisähkö ja tehosähkö. Hinnasto ei kuitenkaan kerro päivä- ja yöajan tai talviarkipäivän kellonaikoja, joten laskuri käyttää vain yleissähköä. Jos sinulla on aika- tai kausisähkö, valitse laskurissa Muu verkkoyhtiö ja syötä keskimääräinen siirtomaksu laskusta. Yhtiön asiakaspalvelu kertoo tuotteiden aikarajat.' },
        { q: 'Sisältääkö Oulun Energian hinnasto sähköveron?', a: `Ei siirtohintoihin, vaan sähkövero lisätään erikseen, kuten hinnastossa todetaan. Huhtikuun 2026 alusta vero on veroluokassa I ${h.c(h.M.VERO_C, 4)} kilowattitunnilta arvonlisäveron kanssa. Laskuri lisää sen jokaiseen varttiin, joten näet saman kokonaishinnan kuin laskullasi. Hinnastossa mainittu vanha verotaso on korvautunut uudella verotaulukolla.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Oulun Energian yleissähkö</h2>
${hintaTaulukko(h, v.t)}
<p>Laskurissa käytetyt perusmaksut on muunnettu Oulun Energian vuosimaksuista kuukausimaksuiksi jakamalla kahdellatoista. 3 × 25 ja 3 × 35 ampeerin liittymillä on yleissähkössä sama vuosimaksu, sillä hinnasto käsittelee kaikki 3 × 25–63 ampeerin liittymät yhtenä ryhmänä. Suuremman pääsulakkeen hinta ei siis kasva, mikä on harvinaista.</p>
<h2>Vuosikustannus kolmella käyttäjällä</h2>
${vuosiTaulukko(h, v.t)}
<p>Myös sähkölämmitteisen omakotitalon siirto pysyy Oulussa kohtuullisena, koska siirtomaksu on pieni. Tällöin sähkön energiahinta ja kulutuksen ajoitus ratkaisevat laskun suuruuden enemmän kuin siirto. Pörssisähkön käyttäjä hyötyy halvoista tunneista suhteellisesti paljon, ja ${h.a('porssi-vai-kiintea', 'pörssin ja kiinteän sopimuksen vertailu')} kannattaa tehdä omalla kulutuksella.</p>
<h2>Pohjoisen talvi ja pörssihinta</h2>
<p>Oulussa lämmityskausi on pitkä, ja kovilla pakkasilla koko Suomen sähkönkulutus nousee. Silloin pörssihinta voi nousta korkeaksi juuri kun lämmitys kuluttaa eniten. Siirron edullisuus ei suojaa siltä, joten talvikuukausien laskuun kannattaa varautua. ${h.a('sahkolasku', 'Sähkölaskulaskuri')} näyttää kuukausittaisen laskun eri pörssihinnoilla.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-oulu',
    nav: 'Oulun Energia',
    card: 'Oulun Energia Sähköverkko’s general transfer and the all-in spot electricity price in Oulu.',
    title: 'Oulun Energia Transfer Fee 2026: Spot Price With Transfer',
    description: 'Oulun Energia Sähköverkko transfer fees 2026: general transfer and an annual basic fee by fuse. See the all-in spot electricity price in Oulu by quarter today.',
    h1: 'Oulun Energia Sähköverkko: the spot electricity price in Oulu',
    intro: 'In Oulu the basic fee is quoted per year, and the transfer fee is among the lowest in Finland. The calculator turns both into an all-in price.',
    resume: (h) => {
      const v = V(h);
      return `Oulun Energia Sähköverkko distributes electricity in the city of Oulu. Its price list applies from ${h.date(v.t.v.voimassa!)} and differs from others by quoting the basic fee in euros per year: ${h.eur(v.vuosi25)} a year, or ${h.eur(v.kk25)} a month, for a 3 × 25–63 A connection on general transfer, and ${h.eur(v.vuosiKt)} a year for smaller single-phase connections. The general transfer fee is ${h.c(v.y.energia.kaikki!)} including VAT, among the cheapest of the calculator’s networks. For a house using 5,000 kilowatt-hours, Oulu ranks ${v.t.sija5} of ${v.t.n} networks from cheapest. The all-in spot price on general transfer averages ${v.t.arvio ? `an estimated ${h.c(v.t.paiva.ka)}` : `${h.c(v.t.paiva.ka)} today`}. The calculator uses Oulun Energia’s general transfer; the company’s time-of-day and seasonal products appear in its price list but without their hours, so enter them via Other with the fee from your bill.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Why is Oulun Energia’s basic fee quoted per year?', a: `Oulun Energia states the basic fee as an annual price, though it bills it in instalments. To compare with other networks, divide by twelve: ${h.eur(v.vuosi25)} a year for 3 × 25 A is ${h.eur(v.kk25)} a month. The calculator does the conversion and shows monthly fees in the same form as for other networks.` },
        { q: 'Is transfer in Oulu cheap?', a: `Yes. The general transfer fee of ${h.c(v.y.energia.kaikki!)} and the monthly equivalent of the basic fee are both among the cheapest in the calculator. In rural Northern Ostrobothnia around the city the operator is often Elenia or a local company with higher prices. The postcode lookup tells you your area’s operator.` },
        { q: 'Can I choose time-of-day transfer in Oulu?', a: 'Oulun Energia’s price list has time-of-day, seasonal and power-based products besides general transfer. It does not state the day, night or winter-weekday hours, though, so the calculator uses general transfer only. If you have one of those products, choose Other operator and enter your average transfer fee from the bill.' },
        { q: 'Does Oulun Energia’s price list include electricity tax?', a: `Not in the transfer prices; the price list says electricity tax is added separately. From April 2026 it is ${h.c(h.M.VERO_C, 4)} per kilowatt-hour including VAT in tax class I. The calculator adds it to every quarter hour, so you see the same all-in price as on your bill.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Oulun Energia’s general transfer</h2>
${hintaTaulukko(h, v.t)}
<p>The basic fees used in the calculator are Oulun Energia’s annual fees divided by twelve. On general transfer 3 × 25 A and 3 × 35 A connections have the same annual fee, because the price list treats all 3 × 25–63 A connections as one group. A larger main fuse does not raise the price, which is unusual.</p>
<h2>Annual cost for three users</h2>
${vuosiTaulukko(h, v.t)}
<p>Even for an electrically heated house transfer stays moderate in Oulu because the transfer fee is low. The energy price and when you use power then decide the bill more than transfer does. A spot customer gains relatively much from cheap hours, and the ${h.a('porssi-vai-kiintea', 'spot versus fixed comparison')} is worth running on your own consumption.</p>
<h2>Northern winter and the spot price</h2>
<p>Oulu’s heating season is long, and in hard frost consumption rises across Finland. The spot price can then climb just when heating uses most. Cheap transfer does not protect against that, so plan for the winter months’ bills. The ${h.a('sahkolasku', 'electricity bill calculator')} shows a monthly bill at different spot prices.</p>`;
    },
  },
});
