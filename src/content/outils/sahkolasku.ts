import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { MARG, PERUS_MYYJA } from '../../lib/arvot';

/** Sähkölasku laskuri : facture d'un mois (énergie, transport, taxe, abonnements). */
const V = (h: Helpers) => {
  const { M, S } = h;
  const kk = Object.keys(S.kuukaudet).filter((k) => k < S.tanaan.slice(0, 7)).sort();
  const viim = kk.at(-1)!;
  const spot = M.spotC(S.kuukaudet[viim].keskiarvo);
  const lasku = (kwh: number, verkko: string, s: M.Sulake, t: M.Tyyppi = 'yleis') => {
    const tu = M.tuote(M.verkko(verkko)!, t)!;
    const energia = (kwh * (spot + MARG)) / 100 + PERUS_MYYJA;
    const siirto = (kwh * M.siirtoKuukausi(tu, viim)) / 100 + M.perusKk(tu, s);
    const vero = (kwh * M.VERO_C) / 100;
    return { energia, siirto, vero, yht: energia + siirto + vero };
  };
  const a = lasku(170, 'helen', 'kt'), b = lasku(400, 'elenia', '3x25'), c = lasku(1500, 'pks', '3x25', 'aika');
  return { viim, spot, a, b, c };
};

export default defineGuide({
  id: 'sahkolasku',
  group: 'hinta',
  order: 40,
  tool: 'lasku',
  toolProps: { verkko: 'helen' },
  related: ['kuukausihinnat', 'porssi-vai-kiintea', 'siirtomaksu', 'sahkovero', 'siirtohinnat'],
  sources: ['nordpool', 'veroTaulukko', 'evHintavertailu', 'motivaSiirto'],
  fi: {
    slug: 'sahkolasku-laskuri',
    nav: 'Sähkölasku-laskuri',
    card: 'Kuukauden sähkölasku osina: energia, siirto, perusmaksut ja sähkövero.',
    title: 'Sähkölasku laskuri 2026: kuukauden lasku pörssisähköllä',
    description: 'Sähkölasku laskuri 2026: laske kuukauden sähkölasku pörssi- tai kiinteällä sopimuksella. Energia, siirtomaksu, perusmaksut ja vero oman verkkoyhtiösi mukaan.',
    h1: 'Sähkölasku-laskuri: mistä kuukauden lasku koostuu',
    intro: 'Syötä kuukauden kulutus, verkkoyhtiö ja sopimus. Laskuri jakaa laskun energiaan, siirtoon, perusmaksuihin ja veroon.',
    resume: (h) => {
      const v = V(h);
      return `Suomalainen kotitalous saa sähköstä tavallisesti kaksi laskua: sähkönmyyjältä energiasta ja verkkoyhtiöltä siirrosta ja sähköverosta. Kuukauden ${v.viim} pörssihinnalla, ${h.c(v.spot)} arvonlisäveron kanssa, ja ${h.c(MARG)} marginaalilla Helsingin kerrostaloasunnon 170 kilowattitunnin kuukausilasku olisi ollut yhteensä ${h.eur(v.a.yht)}: energia perusmaksuineen ${h.eur(v.a.energia)}, siirto perusmaksuineen ${h.eur(v.a.siirto)} ja sähkövero ${h.eur(v.a.vero)}. Elenian alueen omakotitalossa, jonka kulutus on 400 kilowattituntia kuukaudessa, summa olisi ollut ${h.eur(v.b.yht)}, ja PKS:n alueen sähkölämmitystalossa 1 500 kilowattitunnin talvikuukautena ${h.eur(v.c.yht)}. Pienellä kulutuksella perusmaksut ja siirto ovat laskun suurin osa, suurella kulutuksella energia. Valitse alta kuukausi, kulutus, verkkoyhtiö ja sopimus, niin laskuri näyttää laskun osat ja kilowattitunnin keskihinnan kaikkine maksuineen. Laskuri käyttää valitun kuukauden toteutunutta pörssikeskihintaa ja verkkoyhtiösi hinnastoa, joten tulos vastaa tasaisesti jakautuneen kulutuksen laskua. Kokonaissumma vastaa myyjän ja verkkoyhtiön laskujen yhteissummaa.`;
    },
    faqs: (h) => [
      { q: 'Miksi saan kaksi sähkölaskua?', a: 'Sähkön myynti ja siirto ovat Suomessa eri yhtiöiden tehtäviä. Myyjä laskuttaa energian, marginaalin ja oman perusmaksunsa, verkkoyhtiö siirtomaksun, verkon perusmaksun ja sähköveron. Jotkut myyjät tarjoavat yhteislaskun, jolloin myyjä laskuttaa myös verkkopalvelun verkkoyhtiön hinnoilla. Laskun loppusumma on sama. Laskurissa molemmat laskut on laskettu yhteen ja eritelty riveittäin.' },
      { q: 'Mistä löydän kuukauden kulutukseni?', a: 'Kulutus näkyy verkkoyhtiön laskussa ja sen sähköisessä palvelussa, jossa voit katsoa kulutuksen yleensä tunneittain tai varteittain. Sähkönmyyjän palvelussa näkyy usein sama tieto, koska kulutustiedot kulkevat kansallisen Datahub-järjestelmän kautta. Kerrostaloasunnossa kulutus on tyypillisesti 100–250 kilowattituntia kuukaudessa. Omakotitalossa ilman sähkölämmitystä se on tavallisesti 300–600 kilowattituntia.' },
      { q: 'Laskeeko laskuri arvioon tunnittaisen kulutukseni?', a: 'Ei. Laskuri käyttää kuukauden keskimääräistä pörssihintaa, joten se vastaa tilannetta, jossa kulutus jakautuu tasaisesti kuukauden tunneille. Jos kulutuksesi osuu kalliisiin tunteihin, todellinen lasku on hieman suurempi, ja halpoihin tunteihin painottuessaan pienempi. Päivän tarkat hinnat näet etusivun laskurista. Ero on yleensä pieni, ellei kulutus painotu selvästi aamuun tai iltaan.' },
      { q: 'Miksi laskuni on talvella moninkertainen?', a: `Talvella kulutus kasvaa lämmityksen, valaistuksen ja saunomisen vuoksi, ja pörssihinnat ovat usein korkeampia. Kun molemmat nousevat yhtä aikaa, lasku voi moninkertaistua kesään verrattuna. Kausisiirrossa talviarkipäivien siirto on lisäksi kalliimpaa. Kiinteä sopimus tasaa energian hintaa mutta ei kulutuksen kasvua. Kuukausihintojen sivulta näet, kuinka paljon pörssihinta on vaihdellut kuukausittain.` },
    ],
    body: (h) => {
      const v = V(h);
      const r = (x: typeof v.a) => [h.eur(x.energia), h.eur(x.siirto), h.eur(x.vero), `<strong>${h.eur(x.yht)}</strong>`];
      return `<h2>Kolme esimerkkilaskua</h2>
${h.table(['Koti', 'Energia + myyjän perusmaksu', 'Siirto + verkon perusmaksu', 'Sähkövero', 'Yhteensä'], [
        ['Kerrostalo, Helen, 170 kWh', ...r(v.a)],
        ['Omakotitalo, Elenia, 400 kWh', ...r(v.b)],
        ['Sähkölämmitys, PKS päivä-yö, 1 500 kWh', ...r(v.c)],
      ], `Kuukauden ${v.viim} pörssikeskihinta ${h.c(v.spot)} + marginaali ${h.c(MARG)}, myyjän perusmaksu ${h.eur(PERUS_MYYJA)}/kk, € sis. alv.`, ['l', 'r', 'r', 'r', 'r'])}
<p>Esimerkit näyttävät, miten laskun rakenne muuttuu kulutuksen mukaan. Kerrostaloasunnossa kiinteät maksut ja siirto vievät suurimman osan, joten sähkösopimuksen kilpailuttaminen säästää vähemmän kuin moni olettaa. Sähkölämmitystalossa energia ja siirto ovat lähes yhtä suuret, ja sähkövero on jo merkittävä erä.</p>
<h2>Laskun rivit selitettynä</h2>
<ul>
<li><strong>Energia</strong>: pörssisopimuksessa kunkin tunnin tai vartin pörssihinta kulutuksella kerrottuna, plus marginaali. Kiinteässä sopimuksessa kulutus kertaa sopimushinta.</li>
<li><strong>Myyjän perusmaksu</strong>: kiinteä kuukausimaksu, joka ei riipu kulutuksesta.</li>
<li><strong>Siirtomaksu</strong>: verkkoyhtiön senttihinta kilowattitunnilta; aika- ja kausisiirrossa eri hinta eri aikoina. ${h.a('siirtomaksu', 'Siirtomaksun opas')} kertoo lisää.</li>
<li><strong>Verkon perusmaksu</strong>: pääsulakkeen mukainen kuukausimaksu, joissakin verkoissa myös tehomaksu.</li>
<li><strong>Sähkövero ja huoltovarmuusmaksu</strong>: ${h.c(h.M.VERO_C, 4)} kilowattitunnilta arvonlisäveron kanssa; ks. ${h.a('sahkovero', 'sähkövero')}.</li>
</ul>
<h2>Jos lasku tuntuu liian suurelta</h2>
<p>Tarkista ensin kulutus: onko se kasvanut edellisestä vuodesta, ja osuuko se kalliisiin tunteihin? Tarkista sitten siirtotuote ja sopimuksen marginaali. Laskun virheistä voi reklamoida sähkönmyyjälle tai verkkoyhtiölle. ${h.src('motivaSiirto', 'Motivan')} sivuilla on lisää tietoa siirtomaksun rakenteesta, ja ${h.src('evHintavertailu', 'Energiaviraston hintavertailusta')} löydät ajantasaiset sähkösopimukset.</p>`;
    },
  },
  en: {
    slug: 'electricity-bill-calculator',
    nav: 'Electricity bill calculator',
    card: 'A month’s electricity bill in parts: energy, transfer, monthly fees and electricity tax.',
    title: 'Electricity Bill Calculator Finland 2026: Your Monthly Bill',
    description: 'Electricity bill calculator for Finland, 2026: work out a month’s bill on a spot or fixed contract, with energy, transfer, fees and tax for your network.',
    h1: 'Electricity bill calculator: what a month’s bill is made of',
    intro: 'Enter the month’s consumption, your operator and your contract. The calculator splits the bill into energy, transfer, fees and tax.',
    resume: (h) => {
      const v = V(h);
      return `A Finnish household usually gets two electricity bills: one from the retailer for energy and one from the network operator for transfer and electricity tax. At ${v.viim}’s spot price of ${h.c(v.spot)} including VAT and a ${h.c(MARG)} margin, a Helsinki flat using 170 kilowatt-hours in the month would have paid ${h.eur(v.a.yht)} in total: energy with monthly fee ${h.eur(v.a.energia)}, transfer with basic fee ${h.eur(v.a.siirto)} and electricity tax ${h.eur(v.a.vero)}. A house in Elenia’s area using 400 kilowatt-hours would have paid ${h.eur(v.b.yht)}, and an electrically heated house in PKS’s area using 1,500 kilowatt-hours in a winter month ${h.eur(v.c.yht)}. At low use the fixed fees and transfer are most of the bill; at high use, energy. Choose a month, consumption, operator and contract below and the calculator shows each part of the bill and the average price per kilowatt-hour with every fee.`;
    },
    faqs: (h) => [
      { q: 'Why do I get two electricity bills?', a: 'In Finland retail and distribution are done by different companies. The retailer bills energy, margin and its monthly fee; the network operator bills transfer, the network basic fee and electricity tax. Some retailers offer a combined bill covering the network service at the operator’s prices. The total is the same.' },
      { q: 'Where do I find my monthly consumption?', a: 'It appears on the network operator’s bill and in its online service, usually by the hour or quarter. The retailer’s service often shows the same data, since consumption flows through the national Datahub. A flat typically uses 100–250 kilowatt-hours a month.' },
      { q: 'Does the calculator use my hourly consumption?', a: 'No. It uses the month’s average spot price, which matches use spread evenly over the month’s hours. If your use falls in expensive hours your real bill is a little higher; if it leans to cheap hours, lower. See the day’s exact prices in the home page calculator.' },
      { q: 'Why is my winter bill several times higher?', a: 'In winter use rises with heating, lighting and sauna, and spot prices are often higher. When both rise together the bill can multiply compared with summer. On seasonal transfer, winter weekday transfer is dearer as well. A fixed contract evens out the energy price but not the extra consumption.' },
    ],
    body: (h) => {
      const v = V(h);
      const r = (x: typeof v.a) => [h.eur(x.energia), h.eur(x.siirto), h.eur(x.vero), `<strong>${h.eur(x.yht)}</strong>`];
      return `<h2>Three example bills</h2>
${h.table(['Home', 'Energy + retailer fee', 'Transfer + network fee', 'Electricity tax', 'Total'], [
        ['Flat, Helen, 170 kWh', ...r(v.a)],
        ['House, Elenia, 400 kWh', ...r(v.b)],
        ['Electric heating, PKS day-night, 1,500 kWh', ...r(v.c)],
      ], `${v.viim} average spot price ${h.c(v.spot)} + margin ${h.c(MARG)}, retailer fee ${h.eur(PERUS_MYYJA)}/month, € incl. VAT.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The examples show how the bill’s structure changes with consumption. In a flat fixed fees and transfer take the largest share, so switching retailer saves less than many expect. In an electrically heated house energy and transfer are almost equal, and electricity tax is already a significant item.</p>
<h2>The bill’s lines explained</h2>
<ul>
<li><strong>Energy</strong>: on a spot contract each hour’s or quarter’s exchange price times your use, plus the margin. On a fixed contract, use times the contract price.</li>
<li><strong>Retailer monthly fee</strong>: a fixed charge that does not depend on use.</li>
<li><strong>Transfer fee</strong>: the operator’s cents per kilowatt-hour; time-of-day and seasonal products price times differently. The ${h.a('siirtomaksu', 'transfer fee guide')} explains more.</li>
<li><strong>Network basic fee</strong>: a monthly fee by main fuse, in some networks with a power fee.</li>
<li><strong>Electricity tax and security-of-supply fee</strong>: ${h.c(h.M.VERO_C, 4)} per kilowatt-hour including VAT; see ${h.a('sahkovero', 'electricity tax')}.</li>
</ul>
<h2>If the bill seems too high</h2>
<p>Check consumption first: has it grown since last year, and does it fall in expensive hours? Then check your transfer product and contract margin. Billing errors can be disputed with the retailer or the network operator. ${h.src('motivaSiirto', 'Motiva')} explains the structure of the transfer fee, and the ${h.src('evHintavertailu', 'Energy Authority’s comparison')} lists current contracts.</p>`;
    },
  },
});
