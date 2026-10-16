import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('oulu'); const y = t.yleis, a = t.aika!, k = t.kausi!;
  const vuosi25 = y.perusVuosi!['3x25']!, vuosiKt = y.perusVuosi!.kt!;
  // Jours fériés qui tombent un jour ouvré de l'hiver 2026–2027 (1.11.2026–31.3.2027) : tarif « muu » chez Oulu.
  const pyhat: string[] = [];
  for (let p = '2026-11-01'; p <= '2027-03-31'; p = h.M.lisaaPaivia(p, 1)) { const w = new Date(`${p}T12:00:00Z`).getUTCDay(); if (w !== 0 && h.M.onPyha(p)) pyhat.push(p); }
  return { t, y, a, k, vuosi25, vuosiKt, kk25: h.M.perusKk(y, '3x25'), kkKt: h.M.perusKk(y, 'kt'), ka25: h.M.perusKk(a, '3x25'), kk25k: h.M.perusKk(k, '3x25'), pyhat };
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
    card: 'Oulun Energia Sähköverkon yleis-, aika- ja kausisähkö sekä pörssisähkön kokonaishinta Oulussa.',
    title: 'Oulun Energia siirtohinta 2026: pörssisähkö siirron kanssa',
    description: 'Oulun Energia Sähköverkon siirtohinnat 2026: yleis-, aika- ja kausisähkö vuosiperusmaksuineen. Näe pörssisähkön kokonaishinta Oulussa vartti vartilta tänään.',
    h1: 'Oulun Energia Sähköverkko: pörssisähkön hinta Oulussa',
    intro: 'Oulussa perusmaksu ilmoitetaan vuosimaksuna, ja yleissähkön siirtomaksu kuuluu maan edullisimpiin. Laskuri muuntaa molemmat kokonaishinnaksi.',
    resume: (h) => {
      const v = V(h);
      return `Oulun Energia Sähköverkko siirtää sähkön Oulun kaupunkialueella. Sen verkkopalveluhinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen, ja perusmaksu ilmoitetaan euroina vuodessa: yleissähkössä 3 × 25–63 ampeerin liittymällä ${h.eur(v.vuosi25)} vuodessa eli ${h.eur(v.kk25)} kuukaudessa ja pienemmillä yksivaiheisilla liittymillä ${h.eur(v.vuosiKt)} vuodessa. Yleissähkön siirtomaksu on ${h.c(v.y.energia.kaikki!)} arvonlisäveron kanssa. Aikasähkössä päiväenergia kello 7–22 maksaa ${h.c(v.a.energia.paiva!)} ja yöenergia ${h.c(v.a.energia.yo!)}, perusmaksu on ${h.eur(v.ka25)} kuukaudessa. Kausisähkössä talviarkipäivä 1.11.–31.3. kello 7–22 maksaa ${h.c(v.k.energia.talvipaiva!)} ja muu aika ${h.c(v.k.energia.muu!)}. Yhtiön mukaan talviarkipäivä koskee arkipäiviä lauantait ja aattopäivät mukaan luettuina, joten arkipyhät ovat muuta aikaa: talvella 2026–2027 niitä on ${v.pyhat.length}. Omakotitalon 5 000 kilowattitunnin siirto on Oulussa ${v.t.sija5}. halvin laskurin ${v.t.n} verkosta. Pörssisähkön kokonaishinta yleissähköllä on ${v.t.arvio ? 'arvion mukaan' : 'tänään'} keskimäärin ${h.c(v.t.paiva.ka)}. Laskuri on asetettu omakotitalon yleissähköön; vaihda aika- tai kausisähköön, niin näet yö- ja talvihinnan jokaisessa vartissa. Oulun seudulla toimii myös muita verkkoyhtiöitä, joten tarkista oma yhtiösi postinumerolla.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miksi Oulun Energian perusmaksu on euroa vuodessa?', a: `Oulun Energia ilmoittaa perusmaksun vuosihintana, vaikka se laskutetaan jaksoittain. Kun vertaat muihin verkkoihin, jaa vuosimaksu kahdellatoista: yleissähkön 3 × 25 ampeerin ${h.eur(v.vuosi25)} vuodessa on ${h.eur(v.kk25)} kuukaudessa. Laskuri tekee muunnoksen automaattisesti ja näyttää kuukausimaksut samassa muodossa kuin muissa verkoissa.` },
        { q: 'Mitkä päivät ovat Oulussa talviarkipäiviä?', a: `Oulun Energian verkkopalveluhinnastosivun mukaan talviarkipäivän hinta on voimassa 1.11.–31.3. kello 7–22 arkipäivisin, lauantait ja aattopäivät mukaan luettuina. Sunnuntait ja arkipyhät ovat muuta aikaa. Talvella 2026–2027 arkipyhiä on ${v.pyhat.map((p) => h.date(p)).join(', ')}. Laskuri käyttää virallista pyhäpäiväkalenteria ja hinnoittelee nämä päivät muun ajan hinnalla.` },
        { q: 'Kannattaako Oulussa aika- tai kausisähkö?', a: `Aikasähkön perusmaksu ${h.eur(v.ka25)} kuukaudessa on moninkertainen yleissähköön verrattuna, ja kausisähkön ${h.eur(v.kk25k)} vielä suurempi. Oulun Energian mukaan aikasähkö sopii sähkölämmitteisiin taloihin, joiden kulutus on yli 10 000 kilowattituntia ja painottuu yöhön. Laskelmamme mukaan aikasähkö kannattaa talvipainotteisella kulutuksella noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattitunnista alkaen.` },
        { q: 'Sisältääkö Oulun Energian hinnasto sähköveron?', a: `Ei siirtohintoihin, vaan sähkövero lisätään erikseen, kuten hinnastossa todetaan. Huhtikuun 2026 alusta vero on veroluokassa I ${h.c(h.M.VERO_C, 4)} kilowattitunnilta arvonlisäveron kanssa. Laskuri lisää sen jokaiseen varttiin, joten näet saman kokonaishinnan kuin laskullasi. Verkkoyhtiö laskuttaa veron samalla laskulla kuin siirron, vaikka sähkö ostettaisiin eri myyjältä.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Oulun Energian siirtotuotteet</h2>
${hintaTaulukko(h, v.t)}
<p>Laskurin perusmaksut on muunnettu Oulun Energian vuosimaksuista kuukausimaksuiksi jakamalla kahdellatoista. Yleissähkössä kaikki 3 × 25–63 ampeerin liittymät ovat samassa ryhmässä, joten suurempi pääsulake ei nosta hintaa. Aika- ja kausisähkössä perusmaksu kasvaa sulakkeen mukaan. Aikajaot on julkaistu yhtiön ${h.src('oulu', 'verkkopalveluhinnastossa')} ja tuotesivulla.</p>
<h2>Vuosikustannus kolmella käyttäjällä</h2>
${vuosiTaulukko(h, v.t)}
<p>Sähkölämmitteisen omakotitalon siirto pysyy Oulussa kohtuullisena kaikilla tuotteilla, koska siirtomaksut ovat pieniä. Silloin energiahinta ja kulutuksen ajoitus ratkaisevat laskun suuruuden enemmän kuin siirto, ja ${h.a('porssi-vai-kiintea', 'pörssin ja kiinteän sopimuksen vertailu')} kannattaa tehdä omalla kulutuksella.</p>
<h2>Pohjoisen talvi ja pörssihinta</h2>
<p>Oulussa lämmityskausi on pitkä, ja kovilla pakkasilla koko Suomen sähkönkulutus nousee. Pörssihinta voi nousta korkeaksi juuri kun lämmitys kuluttaa eniten, eikä edullinen siirto suojaa siltä. ${h.a('sahkolasku', 'Sähkölaskulaskuri')} näyttää kuukausittaisen laskun eri pörssihinnoilla.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-oulu',
    nav: 'Oulun Energia',
    card: 'Oulun Energia Sähköverkko’s general, time-of-day and seasonal transfer and the all-in spot price in Oulu.',
    title: 'Oulun Energia Transfer Fee 2026: Spot Price With Transfer',
    description: 'Oulun Energia Sähköverkko transfer fees 2026: general, time-of-day and seasonal products with annual basic fees. See the all-in spot price in Oulu today.',
    h1: 'Oulun Energia Sähköverkko: the spot electricity price in Oulu',
    intro: 'In Oulu the basic fee is quoted per year, and the general transfer fee is among the lowest in Finland. The calculator turns both into an all-in price.',
    resume: (h) => {
      const v = V(h);
      return `Oulun Energia Sähköverkko distributes electricity in the city of Oulu. Its price list applies from ${h.date(v.t.v.voimassa!)} and quotes the basic fee in euros per year: ${h.eur(v.vuosi25)} a year, or ${h.eur(v.kk25)} a month, for a 3 × 25–63 A connection on general transfer, and ${h.eur(v.vuosiKt)} a year for smaller single-phase connections. The general transfer fee is ${h.c(v.y.energia.kaikki!)} including VAT. On the time-of-day product day energy (07:00–22:00) costs ${h.c(v.a.energia.paiva!)} and night energy ${h.c(v.a.energia.yo!)}, with a basic fee of ${h.eur(v.ka25)} a month. On the seasonal product the winter weekday rate (1 Nov – 31 Mar, 07:00–22:00) is ${h.c(v.k.energia.talvipaiva!)} and other time ${h.c(v.k.energia.muu!)}. The company says the winter weekday covers working days including Saturdays and holiday eves, so weekday public holidays count as other time: there are ${v.pyhat.length} of them in winter 2026–2027. For a house using 5,000 kilowatt-hours, Oulu ranks ${v.t.sija5} of ${v.t.n} networks from cheapest.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Why is Oulun Energia’s basic fee quoted per year?', a: `Oulun Energia states the basic fee as an annual price, though it bills it in instalments. To compare with other networks, divide by twelve: ${h.eur(v.vuosi25)} a year for 3 × 25 A is ${h.eur(v.kk25)} a month. The calculator does the conversion and shows monthly fees in the same form as for other networks.` },
        { q: 'Which days are winter weekdays in Oulu?', a: `According to Oulun Energia’s price list page, the winter weekday rate applies from 1 November to 31 March, 07:00–22:00, on working days including Saturdays and holiday eves. Sundays and public holidays are other time. In winter 2026–2027 the weekday holidays are ${v.pyhat.map((p) => h.date(p)).join(', ')}. The calculator uses the official holiday calendar and prices these days at the other-time rate.` },
        { q: 'Is time-of-day or seasonal transfer worth it in Oulu?', a: `The time-of-day basic fee of ${h.eur(v.ka25)} a month is several times general transfer’s, and the seasonal product’s ${h.eur(v.kk25k)} higher still. Oulun Energia says time-of-day suits electrically heated houses using over 10,000 kilowatt-hours mostly at night. By our calculation it pays from about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours of winter-heavy use.` },
        { q: 'Does Oulun Energia’s price list include electricity tax?', a: `Not in the transfer prices; electricity tax is added separately. From April 2026 it is ${h.c(h.M.VERO_C, 4)} per kilowatt-hour including VAT in tax class I. The calculator adds it to every quarter hour, so you see the same all-in price as on your bill.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Oulun Energia’s transfer products</h2>
${hintaTaulukko(h, v.t)}
<p>The calculator’s basic fees are Oulun Energia’s annual fees divided by twelve. On general transfer all 3 × 25–63 A connections are one group, so a larger main fuse does not raise the price. On the time-of-day and seasonal products the basic fee rises with the fuse. The time bands are published in the company’s ${h.src('oulu', 'price list')} and product page.</p>
<h2>Annual cost for three users</h2>
${vuosiTaulukko(h, v.t)}
<p>Transfer for an electrically heated house stays moderate in Oulu on every product because the transfer fees are low. The energy price and when you use power then matter more, and the ${h.a('porssi-vai-kiintea', 'spot versus fixed comparison')} is worth running on your own consumption.</p>
<h2>Northern winter and the spot price</h2>
<p>Oulu’s heating season is long, and in hard frost consumption rises across Finland. The spot price can climb just when heating uses most, and cheap transfer does not protect against that. The ${h.a('sahkolasku', 'electricity bill calculator')} shows a monthly bill at different spot prices.</p>`;
    },
  },
});
