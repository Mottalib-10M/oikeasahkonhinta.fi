import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import sop from '../../data/sopimukset.json';
import { MARG, PERUS_MYYJA, vuosiKa } from '../../lib/arvot';

const V = (h: Helpers) => {
  const t = sop.tuotteet;
  const mMin = Math.min(...t.map((x) => x.marginaali)), mMax = Math.max(...t.map((x) => x.marginaali));
  const pMin = Math.min(...t.map((x) => x.perusmaksu)), pMax = Math.max(...t.map((x) => x.perusmaksu));
  const v12 = vuosiKa();
  const vuosi = (kwh: number, m: number, p: number) => (kwh * m) / 100 + p * 12;
  return { t, mMin, mMax, pMin, pMax, v12, vuosi, osuus: MARG / (v12.kaC + MARG) };
};

export default defineGuide({
  id: 'marginaali',
  group: 'opas',
  order: 50,
  mini: 'marginaali',
  miniHref: undefined,
  related: ['porssi-vai-kiintea', 'varttihinta', 'sahkolasku', 'kuukausihinnat', 'siirtomaksu'],
  sources: ['evHintavertailu', 'motivaSopimus', 'nordpool', 'veroAlv'],
  fi: {
    slug: 'porssisahko-marginaali',
    nav: 'Pörssisähkön marginaali',
    card: 'Mikä pörssisähkön marginaali on, paljonko se maksaa vuodessa ja miten sopimuksia verrataan.',
    title: 'Pörssisähkö marginaali 2026: mitä myyjän lisä maksaa',
    description: 'Pörssisähkön marginaali 2026: mitä marginaali ja perusmaksu ovat, paljonko ne maksavat vuodessa ja miten pörssisopimuksia vertaillaan hintavertailussa.',
    h1: 'Pörssisähkön marginaali: ainoa ero sopimusten välillä',
    intro: 'Kaikki pörssisopimukset käyttävät samaa pörssihintaa. Myyjät eroavat toisistaan marginaalissa ja perusmaksussa.',
    resume: (h) => {
      const v = V(h);
      return `Pörssisähkösopimuksessa energian hinta on pörssihinta, johon myyjä lisää marginaalin senttiä kilowattitunnilta ja perii lisäksi kuukausittaisen perusmaksun. Koska pörssihinta on kaikille sama, marginaali ja perusmaksu ovat käytännössä ainoat asiat, joilla pörssisopimukset eroavat toisistaan hinnaltaan. ${h.src('evHintavertailu', 'Energiaviraston hintavertailussa')} ${h.date(sop.haettu)} näkyneiden ${h.num(v.t.length)} kuluttajien pörssisopimuksen marginaalit olivat ${h.c(v.mMin)}–${h.c(v.mMax)} ja perusmaksut ${h.eur(v.pMin)}–${h.eur(v.pMax)} kuukaudessa arvonlisäveron kanssa. Mediaani oli ${h.c(MARG)} ja ${h.eur(PERUS_MYYJA)}, ja niitä tämän sivuston laskurit käyttävät oletuksena. Omakotitalossa, joka kuluttaa 5 000 kilowattituntia vuodessa, mediaanimarginaali ja -perusmaksu maksavat yhteensä ${h.eur(v.vuosi(5000, MARG, PERUS_MYYJA))} vuodessa. Viimeisen vuoden pörssihinnan keskiarvolla marginaalin osuus energian hinnasta on noin ${h.pct(v.osuus, 0)}. Laske alla, paljonko kahden sopimuksen ero maksaa omalla kulutuksellasi. Kahden sopimuksen erotus on usein muutamia kymmeniä euroja vuodessa, mutta suurella kulutuksella se kasvaa. Vertaa aina sekä marginaalia että perusmaksua, koska halvin marginaali voi tulla kalliin perusmaksun kanssa.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Sisältääkö marginaali arvonlisäveron?', a: 'Kuluttajasopimuksissa hinnat ilmoitetaan yleensä arvonlisäveron kanssa, mutta tarkista sopimuksesta. Arvonlisävero 25,5 prosenttia lasketaan sekä pörssihinnan että marginaalin päälle. Tämän sivuston laskureissa marginaali syötetään arvonlisäveron kanssa, samassa muodossa kuin Energiaviraston hintavertailussa. Jos sopimuksessa hinta on ilmoitettu ilman veroa, kerro se luvulla 1,255.' },
        { q: 'Kumpi on tärkeämpi, marginaali vai perusmaksu?', a: `Riippuu kulutuksesta. Pienellä kulutuksella perusmaksu ratkaisee: kerrostaloasunnossa, joka kuluttaa 2 000 kilowattituntia, yhden euron ero perusmaksussa on vuodessa 12 euroa, mutta 0,2 sentin ero marginaalissa vain 4 euroa. Sähkölämmitteisessä talossa marginaali painaa enemmän, koska se kerrotaan suurella kulutuksella. Laske molemmat omalla kulutuksellasi.` },
        { q: 'Mitä marginaalilla maksetaan?', a: 'Marginaalilla myyjä kattaa omat kulunsa ja voittonsa: sähkön hankinnan pörssistä, tasevastuun eli ennustevirheistä aiheutuvat kustannukset, asiakaspalvelun, laskutuksen ja riskit. Tasevastuun kustannukset kasvavat, kun asiakkaat kuluttavat paljon kalliilla tunneilla, minkä vuoksi joillakin myyjillä on erilaisia ehtoja suurille kuluttajille. Marginaali kattaa myös myyjän hallintokulut.' },
        { q: 'Voiko marginaali muuttua kesken sopimuksen?', a: 'Toistaiseksi voimassa olevassa sopimuksessa myyjä voi yleensä muuttaa marginaalia ja perusmaksua ilmoittamalla siitä etukäteen sopimusehtojen mukaisesti. Määräaikaisessa pörssisopimuksessa marginaali on usein kiinteä koko sopimuskauden. Tarkista sopimusehdot, ja vertaa hintaa säännöllisesti Energiaviraston hintavertailussa. Hinnanmuutoksesta on ilmoitettava asiakkaalle etukäteen. Silloin sopimuksen voi yleensä irtisanoa ehtojen mukaisesti ja vaihtaa myyjää.' },
      { q: 'Mistä näen oman marginaalini?', a: 'Marginaali ja perusmaksu lukevat sähkösopimuksessasi, ja ne näkyvät usein myös sähkönmyyjän laskussa omina riveinään tai sähkön hinnan erittelyssä. Jos laskussa näkyy vain energian kokonaishinta, voit päätellä marginaalin vertaamalla laskun keskihintaa saman jakson pörssihintaan. Myyjän asiakaspalvelu kertoo myös voimassa olevat hinnat.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      const rows = [...v.t].sort((a, b) => a.marginaali - b.marginaali).map((x) => [x.yhtio, x.tuote, h.c(x.marginaali), h.eur(x.perusmaksu), h.eur(v.vuosi(5000, x.marginaali, x.perusmaksu))]);
      return `<h2>Pörssisopimuksia Energiaviraston hintavertailussa</h2>
${h.table(['Myyjä', 'Tuote', 'Marginaali', 'Perusmaksu/kk', 'Vuodessa, 5 000 kWh'], rows, `Energiaviraston hintavertailun rajapinnasta ${h.date(sop.haettu)} haetut kuluttajien pörssisopimukset, hinnat sis. alv. Vuosisumma = marginaali × 5 000 kWh + 12 perusmaksua.`, ['l', 'l', 'r', 'r', 'r'])}
<p>Taulukko on otos vertailupalvelun näyttämistä tuotteista, ei kattava luettelo kaikista markkinoilla olevista sopimuksista. Ajantasaiset tarjoukset omalle postinumerollesi löydät ${h.src('evHintavertailu', 'Energiaviraston hintavertailusta')}. Emme suosittele mitään myyjää emmekä saa palkkiota sopimuksista.</p>
<h2>Miten pörssisopimuksia vertaillaan</h2>
<ol>
<li>Laske vuosikulutuksellasi marginaali kertaa kulutus plus kaksitoista perusmaksua. Pienin summa on halvin, koska pörssihinta on kaikille sama.</li>
<li>Tarkista, hinnoitellaanko sopimus varteittain, tunneittain vai kuukauden keskihinnalla. Se vaikuttaa siihen, hyödytkö kulutuksen ajoittamisesta.</li>
<li>Tarkista sopimuksen kesto ja irtisanomisehdot sekä se, voiko marginaali muuttua.</li>
<li>Tarkista mahdolliset lisäpalvelut ja niiden hinnat, esimerkiksi alkuperätakuut, joita ei aina ole eritelty marginaalista.</li>
</ol>
<h2>Marginaali osana kokonaishintaa</h2>
<p>Viimeisen kahdentoista kuukauden aikana pörssihinnan keskiarvo on ollut ${h.c(v.v12.kaC)} arvonlisäveron kanssa. Kokonaishinnassa ovat lisäksi siirtomaksu ja sähkövero, jotka ovat usein suuremmat kuin marginaali ja perusmaksu yhteensä. Siksi marginaalin kilpailuttaminen säästää yleensä kymmeniä euroja vuodessa, kun taas oikea ${h.a('siirtomaksu', 'siirtotuote')} tai kulutuksen ajoitus voi säästää enemmän. ${h.src('motivaSopimus', 'Motiva')} kertoo eri sopimustyyppien eduista ja haitoista.</p>
<h2>Pörssisopimus vai kiinteä</h2>
<p>Jos harkitset kiinteää sopimusta, vertaa sen hintaa pörssisopimuksen kokonaiskustannukseen omalla kulutuksellasi. ${h.a('porssi-vai-kiintea', 'Vertailulaskuri')} laskee viimeisen vuoden toteutuneilla hinnoilla, kumpi olisi ollut halvempi, ja kertoo kiinteän hinnan, jolla molemmat olisivat maksaneet saman verran.</p>
<h2>Esimerkki: kolme kotitaloutta, kaksi sopimusta</h2>
<p>Marginaalin merkitys riippuu kulutuksesta. Kerrostaloasunnossa, joka kuluttaa kaksituhatta kilowattituntia vuodessa, yhden sentin kymmenyksen ero marginaalissa on vain kaksi euroa vuodessa, mutta euron ero perusmaksussa on kaksitoista euroa. Pienen kulutuksen kodissa kannattaa siksi katsoa ensin perusmaksua. Omakotitalossa, joka kuluttaa viisituhatta kilowattituntia, sama marginaaliero on viisi euroa ja perusmaksun ero edelleen kaksitoista euroa. Sähkölämmitteisessä talossa, jonka kulutus on kahdeksantoistatuhatta kilowattituntia, marginaalin kymmenys maksaa jo kahdeksantoista euroa vuodessa, joten marginaali nousee tärkeämmäksi kuin perusmaksu.</p>
<p>Yllä olevalla laskurilla voit syöttää kahden sopimuksen marginaalit ja oman kulutuksesi ja nähdä eron euroina. Lisää perusmaksujen ero erikseen kertomalla se kahdellatoista.</p>
<h2>Muut sopimusehdot</h2>
<p>Hinta ei ole ainoa ero pörssisopimusten välillä. Sopimus voi olla toistaiseksi voimassa oleva tai määräaikainen, ja määräaikaisesta voi joutua maksamaan, jos sen irtisanoo kesken kauden. Osa sopimuksista hinnoitellaan varteittain, osa tunneittain ja osa kuukauden keskihinnalla. Jos aiot ajoittaa kulutusta, varmista, että sopimuksesi hinnoittelee kulutuksen vähintään tunneittain. Joissakin sopimuksissa negatiivinen pörssihinta on rajattu nollaan, ja joihinkin kuuluu alkuperätakuu tai muu lisäpalvelu, joka on hinnoiteltu marginaaliin.</p>
<p>Laskutustapa vaikuttaa myös arjen helppouteen: yhteislasku, jossa myyjä laskuttaa myös verkkopalvelun, voi olla kätevä, mutta loppusumma on sama kuin erillisillä laskuilla. Lue ehdot ennen sopimuksen tekemistä ja vertaa tarjouksia säännöllisesti, sillä marginaalit ja perusmaksut muuttuvat markkinatilanteen mukaan.</p>
<h2>Kuluttajan oikeudet</h2>
<p>Sähkösopimuksen vaihtaminen on kuluttajalle maksutonta, ja uusi myyjä hoitaa vaihdon. Toistaiseksi voimassa olevan sopimuksen voi irtisanoa sopimusehtojen mukaisesti. Jos sähkölaskussa on virhe, siitä voi reklamoida myyjälle. Riitatilanteissa kuluttajaneuvonta ja kuluttajariitalautakunta auttavat maksutta.</p>
<h2>Marginaali ja kulutuksen ajoitus</h2>
<p>Pörssisopimuksen kokonaiskustannukseen vaikuttaa marginaalin lisäksi se, milloin sähköä käytetään. Kaksi kotitaloutta, joilla on sama marginaali, voi maksaa energiasta hyvin eri hinnan, jos toinen käyttää sähköä enimmäkseen halvoilla tunneilla ja toinen kalliilla. Siksi marginaalien vertailu kannattaa yhdistää kulutuksen ajoittamiseen: pienikin marginaaliero on merkityksetön, jos kulutus osuu kalliisiin tunteihin, ja suurikin marginaali voi kannattaa, jos sopimus hinnoittelee varteittain ja kulutus on joustavaa.</p>
<p>Jotkin myyjät tarjoavat pörssisopimuksen, jossa hinta perustuu kuukauden keskihintaan. Silloin ajoittaminen ei vaikuta laskuun, ja vertailussa riittää katsoa marginaalia ja perusmaksua. Varttihintaisessa sopimuksessa ajoittaminen voi säästää enemmän kuin minkään marginaalieron kilpailuttaminen. Laske molemmat vaihtoehdot omilla luvuillasi.</p>
<h2>Kun vaihdat sopimusta</h2>
<p>Sopimuksen vaihtaminen on helppoa: teet uuden sopimuksen uuden myyjän kanssa, ja se hoitaa vaihdon ja vanhan sopimuksen päättymisen, jos vanha on toistaiseksi voimassa. Vaihto tapahtuu tavallisesti parin viikon kuluessa. Mittari ja verkkoyhtiö pysyvät samoina, eikä sähkö katkea vaihdon aikana. Määräaikaisen sopimuksen kohdalla tarkista päättymispäivä, jotta vältät mahdolliset sopimussakot.</p>
<p>Tämän sivuston laskurit käyttävät samoja virallisia lähteitä: pörssihinnat Suomen tarjousalueelta, siirtohinnat verkkoyhtiöiden omista hinnastoista ja verot Verohallinnon taulukosta. Kaikki laskenta tapahtuu selaimessasi, eikä syöttämiäsi tietoja lähetetä minnekään. Hinnat päivittyvät joka päivä automaattisesti, ja jos päivän pörssihintoja ei ole saatavilla, laskuri näyttää selvästi merkityn keskihinta-arvion. Lisätietoa laskentatavasta, lähteistä ja rajoituksista on menetelmäsivulla.</p>`;
    },
  },
  en: {
    slug: 'spot-contract-margin',
    nav: 'Spot contract margin',
    card: 'What the spot contract margin is, what it costs a year and how to compare contracts.',
    title: 'Spot Electricity Margin Finland 2026: What the Retailer Adds',
    description: 'Spot electricity margin in Finland, 2026: what the margin and monthly fee are, what they cost a year and how to compare spot contracts using official data.',
    h1: 'The spot contract margin: the only difference between contracts',
    intro: 'Every spot contract uses the same exchange price. Retailers differ in margin and monthly fee.',
    resume: (h) => {
      const v = V(h);
      return `On a spot contract the energy price is the exchange price plus a retailer margin in cents per kilowatt-hour, and the retailer also charges a monthly fee. Since the exchange price is the same for everyone, margin and monthly fee are in practice the only price differences between spot contracts. The ${h.num(v.t.length)} consumer spot contracts shown in the ${h.src('evHintavertailu', 'Energy Authority’s price comparison')} on ${h.date(sop.haettu)} had margins of ${h.c(v.mMin)}–${h.c(v.mMax)} and monthly fees of ${h.eur(v.pMin)}–${h.eur(v.pMax)} including VAT. The medians were ${h.c(MARG)} and ${h.eur(PERUS_MYYJA)}, which this site’s calculators use as defaults. For a house using 5,000 kilowatt-hours a year, the median margin and fee cost ${h.eur(v.vuosi(5000, MARG, PERUS_MYYJA))} a year. At the last year’s average spot price, the margin is about ${h.pct(v.osuus, 0)} of the energy price. Work out below what the gap between two contracts costs on your own consumption.`;
    },
    faqs: (h) => [
      { q: 'Does the margin include VAT?', a: 'Consumer contracts usually quote prices including VAT, but check yours. VAT of 25.5% applies to both the spot price and the margin. On this site the margin is entered including VAT, in the same form as in the Energy Authority comparison.' },
      { q: 'Which matters more, margin or monthly fee?', a: 'It depends on consumption. At low use the monthly fee decides: in a 2,000 kWh flat a one-euro gap in the monthly fee is 12 euros a year, but a 0.2-cent gap in margin only 4 euros. In an electrically heated house the margin weighs more because it is multiplied by large consumption.' },
      { q: 'What does the margin pay for?', a: 'The margin covers the retailer’s costs and profit: buying power on the exchange, balance responsibility for forecast errors, customer service, billing and risk. Balancing costs rise when customers use a lot in expensive hours, which is why some retailers have different terms for large consumers.' },
      { q: 'Can the margin change during a contract?', a: 'On an open-ended contract the retailer can usually change the margin and fee with advance notice under the contract terms. On a fixed-term spot contract the margin is often fixed for the term. Check your terms and compare prices regularly in the Energy Authority comparison.' },
      { q: 'Where do I find my own margin?', a: 'The margin and monthly fee are in your contract and often appear on the retailer’s bill as separate lines or in the price breakdown. If the bill shows only the total energy price, compare its average with the period’s spot price to infer the margin. The retailer’s customer service can also confirm current prices.' },
    ],
    body: (h) => {
      const v = V(h);
      const rows = [...v.t].sort((a, b) => a.marginaali - b.marginaali).map((x) => [x.yhtio, x.tuote, h.c(x.marginaali), h.eur(x.perusmaksu), h.eur(v.vuosi(5000, x.marginaali, x.perusmaksu))]);
      return `<h2>Spot contracts in the Energy Authority comparison</h2>
${h.table(['Retailer', 'Product', 'Margin', 'Monthly fee', 'Per year, 5,000 kWh'], rows, `Consumer spot contracts fetched from the Energy Authority comparison API on ${h.date(sop.haettu)}, prices incl. VAT. Annual total = margin × 5,000 kWh + 12 monthly fees.`, ['l', 'l', 'r', 'r', 'r'])}
<p>The table is a sample of the products the comparison service showed, not a complete list of every contract on the market. Current offers for your postcode are in the ${h.src('evHintavertailu', 'Energy Authority’s comparison')}. We recommend no retailer and take no commission on contracts.</p>
<h2>How to compare spot contracts</h2>
<ol>
<li>Multiply the margin by your annual use and add twelve monthly fees. The lowest total is cheapest, since the spot price is the same for all.</li>
<li>Check whether the contract is priced by quarter, by hour or by monthly average. That decides whether timing your use pays.</li>
<li>Check the contract length, notice terms and whether the margin can change.</li>
<li>Check any add-ons and their prices, such as guarantees of origin, which are not always separated from the margin.</li>
</ol>
<h2>The margin within the all-in price</h2>
<p>Over the last twelve months the average spot price has been ${h.c(v.v12.kaC)} including VAT. The all-in price adds transfer and electricity tax, which are often larger than margin and fee combined. Shopping around on margin therefore usually saves tens of euros a year, while the right ${h.a('siirtomaksu', 'transfer product')} or timing your use can save more. ${h.src('motivaSopimus', 'Motiva')} explains the pros and cons of each contract type.</p>
<h2>Spot or fixed</h2>
<p>If you are weighing a fixed contract, compare its price with a spot contract’s total cost on your own consumption. The ${h.a('porssi-vai-kiintea', 'comparison calculator')} uses the last year’s actual prices to show which would have been cheaper and the fixed price at which both would have cost the same.</p>
<h2>Example: three homes, two contracts</h2>
<p>How much the margin matters depends on consumption. In a flat using 2,000 kWh a year a gap of a tenth of a cent in margin is only two euros a year, while a one-euro gap in monthly fee is twelve. A low-use home should look at the fee first. In a 5,000 kWh house the same margin gap is five euros; in an electrically heated 18,000 kWh house it is eighteen, so the margin starts to outweigh the fee. Enter two contracts’ margins and your use in the calculator above, then add the fee gap times twelve.</p>
<h2>Other contract terms</h2>
<p>Price is not the only difference. A contract may be open-ended or fixed-term, and leaving a fixed-term contract early can cost money. Some contracts are priced by quarter, some by hour and some by monthly average; if you plan to time your use, make sure yours is priced at least by the hour. Some cap a negative spot price at zero, and some bundle guarantees of origin into the margin. Switching retailer is free and the new retailer handles it, and consumer advice services help free of charge in disputes.</p>
<p>Compare offers regularly, since margins and fees move with the market.</p>`;
    },
  },
});
