import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { verkkoTiedot, vuosiTaulukko, hintaTaulukko } from '../../lib/verkkotiedot';

const V = (h: Helpers) => {
  const t = verkkoTiedot('kajave'); const y = t.yleis, a = t.aika, k = t.kausi;
  const kt = h.M.perusKk(y, 'kt'), p25 = h.M.perusKk(y, '3x25'), p35 = h.M.perusKk(y, '3x35');
  const a25 = a ? h.M.perusKk(a, '3x25') : null, akt = a ? h.M.perusKk(a, 'kt') : null;
  /** Kaksiaikasähkön päiväsiirto on halvempi kuin yleissähkön siirto. */
  const paivaHalvempi = !!a && a.energia.paiva! < y.energia.kaikki!;
  return { t, y, a, k, kt, p25, p35, a25, akt, paivaHalvempi, ktEroVuosi: (p25 - kt) * 12, aEroVuosi: a25 !== null ? (a25 - p25) * 12 : null };
};

export default defineGuide({
  id: 'siirto-kajave',
  group: 'verkko',
  order: 26,
  tool: 'tanaan',
  toolProps: { verkko: 'kajave', sulake: 1 },
  related: ['siirtohinnat', 'siirto-elenia', 'siirto-oulu', 'sahkoauton-lataus', 'porssi-vai-kiintea'],
  sources: ['kajave', 'veroTaulukko', 'evPostinumerot'],
  fi: {
    slug: 'siirtohinta-kajave',
    nav: 'Kajave',
    card: 'Kajaven yleissähkö, kaksiaikasähkö ja kausiaikasähkö sekä pörssisähkön kokonaishinta Kainuussa.',
    title: 'Kajave siirtohinta 2026: Kainuun siirto ja pörssisähkö',
    description: 'Kajaven siirtohinnat 2026 Kainuussa: yleissähkö, kaksiaikasähkö ja kausiaikasähkö, perusmaksut sulakkeen mukaan ja pörssisähkön kokonaishinta vartti vartilta.',
    h1: 'Kajave: pörssisähkön kokonaishinta Kainuussa',
    intro: 'Kajaven kotitaloustuotteissa ei ole tehomaksua. Hinta riippuu siitä, osuuko kulutus yöhön tai talven arkipäiviin, ja siitä, montako käyttöpaikkaa liittymällä on.',
    resume: (h) => {
      const v = V(h);
      return `Kajave Oy vastaa sähkönjakelusta Kainuussa ja osassa Pohjois-Pohjanmaata, ja se on osa Loiste-konsernia. Verkkopalveluhinnasto on voimassa ${h.date(v.t.v.voimassa!)} alkaen, ja käyttöpaikkoja on hinnaston mukaan ${h.num(v.t.v.asiakkaat!.maara)}. Hinnasto kuvaa alueen maan metsäisimmäksi ja lumisimmaksi, ja käyttöpaikkoja on neliökilometrillä selvästi vähemmän kuin Suomessa keskimäärin. Sulakepohjaisissa tuotteissa ei ole tehomaksua, vaan lasku muodostuu perusmaksusta ja kulutetuista kilowattitunneista; tehotuotteet ovat hinnastossa erikseen. Hinnaston mukaan sopivin tuote riippuu pääsulakkeesta sekä siitä, kuinka paljon ja mihin aikaan sähköä käytetään, ja tuotteen voi vaihtaa kerran vuodessa. Yleissähkön siirtomaksu on ${h.c(v.y.energia.kaikki!)} ja perusmaksu 3 × 25 ampeerilla ${h.eur(v.p25)} kuukaudessa.${v.a ? ` Kaksiaikasähkössä siirto maksaa kello 7–22 ${h.c(v.a.energia.paiva!)} ja yöllä kello 22–7 joka viikonpäivä ${h.c(v.a.energia.yo!)}${v.paivaHalvempi ? ', joten myös päiväsiirto on yleissähköä halvempi' : ''}; perusmaksu on ${h.eur(v.a25!)}.` : ''}${v.k ? ` Kausiaikasähkössä talviarkipäivän siirto 1.11.–31.3. maanantaista lauantaihin kello 7–22 maksaa ${h.c(v.k.energia.talvipaiva!)} ja muu aika ${h.c(v.k.energia.muu!)}.` : ''} Alempi ${h.eur(v.kt)} perusmaksu koskee hinnaston mukaan liittymiä, joissa on vähintään kolme käyttöpaikkaa, eli tavallisesti kerros- ja rivitaloja. Omakotitalon 5 000 kilowattitunnin siirto on Kajaven verkossa ${v.t.sija5}. edullisin laskurin ${v.t.n} verkosta. Laskuri on asetettu yleissähköön; vaihda tuote ja sulake, niin näet jokaisen vartin kokonaishinnan.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Mitä eroa on Kajaven yösähköllä ja kaksiaikasähköllä?', a: `Hinnaston mukaan perus- ja siirtomaksut ovat molemmissa samat${v.a ? `: päivällä ${h.c(v.a.energia.paiva!)} ja yöllä ${h.c(v.a.energia.yo!)}` : ''}. Ero on yöhinnan ajassa. Kaksiaikasähkössä yöhinta on käytössä joka päivä kello 22–7. Yösähkössä se on voimassa kello 22–7, lauantaisin jo kello 20 alkaen ja sunnuntaisin koko vuorokauden. Laskuri mallintaa kaksiaikasähkön, joten viikonloppuna paljon kuluttavalla yösähkö voi tulla laskelmaa edullisemmaksi.` },
        { q: 'Miten Kajaven säästötuotteet eroavat tavallisista?', a: 'Hinnaston mukaan säästöyösähkössä ja säästövuodenaikasähkössä hinnat ovat samat kuin perustuotteessa, mutta halvempi aika on pidempi: säästöyösähkössä yöhinta on käytössä myös lauantaisin kello 7–15. Vastineeksi Kajave voi rajoittaa lämmityksen, lämminvesivaraajan ja kiukaan tehoja: suoraa sähkölämmitystä enintään 1,5 tuntia ja varaavaa enintään 3 tuntia kerrallaan, yhteensä enintään 5 tuntia vuorokaudessa. Säästöyleissähkö on lakkautettava tuote.' },
        { q: 'Kuka saa Kajaven alemman perusmaksun?', a: `Hinnaston mukaan 3 × 25 ampeerin liittymä, jossa on vähintään kolme käyttöpaikkaa, maksaa yleissähkössä ${h.eur(v.kt)} kuukaudessa. Jos käyttöpaikkoja on yksi tai kaksi, tai sulake on 1 × 25 tai 1 × 35 ampeeria, perusmaksu on ${h.eur(v.p25)}. Ero on ${h.eur(v.ktEroVuosi, 0)} vuodessa. Tyypillisesti alempi hinta koskee kerros- ja rivitaloasuntoja, ylempi omakotitaloja ja vapaa-ajan asuntoja.` },
        { q: 'Milloin Kajaven kausiaikasähkö kannattaa?', a: v.k ? `Kausiaikasähkön talviarkipäivän siirto ${h.c(v.k.energia.talvipaiva!)} on kalliimpi kuin yleissähkön ${h.c(v.y.energia.kaikki!)}, mutta muun ajan siirto on vain ${h.c(v.k.energia.muu!)}. Perusmaksu on sama kuin kaksiaikasähkössä. Laskelmamme mukaan se ohittaa yleissähkön noin ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowattitunnin talvipainotteisella vuosikulutuksella. Hinnaston vuodenaikasähkössä talviarkipäivä päättyy lauantaisin jo kello 20.` : 'Kajaven hinnastossa ei tällä hetkellä ole laskurissa mallinnettua kausiaikatuotetta, joten vertailu tehdään yleissähkön ja muiden tuotteiden kesken.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Kajaven sulakepohjaiset tuotteet</h2>
${hintaTaulukko(h, v.t)}
<p>Kajaven hinnastossa yö- ja kausituotteilla on yhteinen perusmaksu, joka on suurempi kuin yleissähkön. 3 × 35 ampeerilla yleissähkön perusmaksu on ${h.eur(v.p35)}, eli selvästi yli 3 × 25 ampeerin hinnan. Hinnaston mukaan sopivin tuote riippuu pääsulakkeesta sekä sähkönkäytön määrästä ja ajoittumisesta, ja tuotteen voi vaihtaa kerran 12 kuukaudessa maksutta. Jos sulaketta muutetaan useasti vuodessa, perusmaksu määräytyy suurimman sulakkeen mukaan.</p>
<h2>Siirron vuosikustannus Kajaven verkossa</h2>
${vuosiTaulukko(h, v.t)}
<p>${v.a && v.aEroVuosi !== null ? `Kaksiaikasähkö maksaa perusmaksuina ${h.eur(v.aEroVuosi, 0)} vuodessa enemmän kuin yleissähkö 3 × 25 ampeerilla. Laskelmamme mukaan se tulee talvipainotteisella kulutuksella edullisemmaksi noin ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowattitunnista alkaen. ` : ''}Taulukossa sähkövero on jätetty pois, koska se on sama kaikissa tuotteissa.</p>
<h2>Pörssisähkö harvaan asutussa Kainuussa</h2>
<p>Kaksiaikasähkössä halvempi siirto alkaa kello 22, jolloin pörssisähkökin on usein edullisimmillaan, joten ${h.a('sahkoauton-lataus', 'sähköauton lataus')} ja varaajan lämmitys kannattaa ajastaa yöhön. Laskuri näyttää siirron hyppäyksen kello 22 ja 7. Osa Kainuun ja Pohjois-Pohjanmaan taloista kuuluu ${h.a('siirto-elenia', 'Elenian')} verkkoon, ja Oulun seudulla siirrosta vastaa ${h.a('siirto-oulu', 'Oulun Energia')}. Verkkoyhtiötä ei voi valita, mutta siirtotuotteen ja sähkösopimuksen voi; ${h.a('siirtohinnat', 'siirtohintojen vertailu')} näyttää, miten Kajave sijoittuu muihin verkkoihin.</p>`;
    },
  },
  en: {
    slug: 'transfer-fee-kajave',
    nav: 'Kajave',
    card: 'Kajave’s general, two-time and seasonal-time transfer and the all-in spot price in Kainuu.',
    title: 'Kajave Transfer Fee 2026: Kainuu Transfer and Spot Price',
    description: 'Kajave transfer fees 2026 in Kainuu: general, two-time and seasonal-time transfer, basic fees by fuse size and the all-in spot price for every quarter hour.',
    h1: 'Kajave: the all-in spot electricity price in Kainuu',
    intro: 'Kajave’s household products have no power fee. The price depends on whether your use falls at night or on winter weekdays, and on how many metering points share your connection.',
    resume: (h) => {
      const v = V(h);
      return `Kajave Oy distributes electricity in Kainuu and part of North Ostrobothnia and is part of the Loiste group. Its network price list applies from ${h.date(v.t.v.voimassa!)}, and according to the price list it serves ${h.num(v.t.v.asiakkaat!.maara)} metering points. The price list describes the area as Finland’s most forested and snowiest, with far fewer metering points per square kilometre than the Finnish average. The fuse-based products carry no power fee; power products are listed separately. General transfer (Yleissähkö) costs ${h.c(v.y.energia.kaikki!)} with a basic fee of ${h.eur(v.p25)} a month at 3 × 25 A.${v.a ? ` Two-time transfer (Kaksiaikasähkö) costs ${h.c(v.a.energia.paiva!)} from 07:00 to 22:00 and ${h.c(v.a.energia.yo!)} from 22:00 to 07:00 every day of the week${v.paivaHalvempi ? ', so even its daytime rate is below general transfer' : ''}; its basic fee is ${h.eur(v.a25!)}.` : ''}${v.k ? ` Seasonal-time transfer (Kausiaikasähkö) costs ${h.c(v.k.energia.talvipaiva!)} on winter weekdays, 1 Nov to 31 Mar, Monday to Saturday 07:00–22:00, and ${h.c(v.k.energia.muu!)} at other times.` : ''} Under the price list the lower basic fee of ${h.eur(v.kt)} applies to connections with at least three metering points. For a house using 5,000 kilowatt-hours, Kajave ranks ${v.t.sija5} of the calculator’s ${v.t.n} networks from cheapest.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'What is the difference between Kajave’s night and two-time transfer?', a: `According to the price list both have the same basic and transfer fees${v.a ? `: ${h.c(v.a.energia.paiva!)} by day and ${h.c(v.a.energia.yo!)} at night` : ''}. The difference is when the night rate applies. On two-time transfer it runs 22:00–07:00 every day. On night transfer (Yösähkö) it runs 22:00–07:00, from 20:00 on Saturdays and all day on Sundays. The calculator models two-time transfer, so a household with heavy weekend use may pay less on night transfer than shown.` },
        { q: 'How do Kajave’s saver products differ from the standard ones?', a: 'According to the price list the saver night and saver seasonal products have the same prices as the standard ones but a longer cheap period: saver night transfer also applies the night rate on Saturdays 07:00–15:00. In return Kajave may limit heating, water heater and sauna stove loads: direct heating for at most 1.5 hours and storage heating 3 hours at a time, 5 hours a day in total. Saver general transfer is being discontinued.' },
        { q: 'Who qualifies for Kajave’s lower basic fee?', a: `According to the price list a 3 × 25 A connection with at least three metering points pays ${h.eur(v.kt)} a month on general transfer. With one or two metering points, or a 1 × 25 A or 1 × 35 A fuse, the basic fee is ${h.eur(v.p25)}. The difference is ${h.eur(v.ktEroVuosi, 0)} a year. The lower fee typically covers flats and terraced homes, the higher one detached houses and holiday homes.` },
        { q: 'When does Kajave’s seasonal-time transfer pay off?', a: v.k ? `Its winter weekday rate of ${h.c(v.k.energia.talvipaiva!)} is above general transfer’s ${h.c(v.y.energia.kaikki!)}, but at other times it costs only ${h.c(v.k.energia.muu!)}. The basic fee matches two-time transfer. By our calculation it overtakes general transfer at about ${v.t.tasapainoKausi ? h.num(v.t.tasapainoKausi) : '–'} kilowatt-hours a year of winter-heavy use. On the price list’s Vuodenaikasähkö the winter weekday ends at 20:00 on Saturdays.` : 'Kajave’s price list currently has no seasonal product modelled in the calculator, so the comparison is between general transfer and the other products.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Kajave’s fuse-based products</h2>
${hintaTaulukko(h, v.t)}
<p>On Kajave’s price list the night and seasonal products share one basic fee, higher than general transfer’s. At 3 × 35 A the general transfer basic fee is ${h.eur(v.p35)}, well above the 3 × 25 A price. According to the price list the best product depends on the main fuse and on how much electricity you use and when, and you can switch product free of charge once every 12 months. If the fuse is changed several times a year, the basic fee follows the largest fuse.</p>
<h2>Annual transfer cost on Kajave’s network</h2>
${vuosiTaulukko(h, v.t)}
<p>${v.a && v.aEroVuosi !== null ? `Two-time transfer costs ${h.eur(v.aEroVuosi, 0)} a year more in basic fees than general transfer at 3 × 25 A. By our calculation it becomes cheaper from about ${v.t.tasapainoAika ? h.num(v.t.tasapainoAika) : '–'} kilowatt-hours of winter-heavy use. ` : ''}Electricity tax is left out of the table because it is the same on every product.</p>
<h2>Spot electricity in sparsely populated Kainuu</h2>
<p>On two-time transfer the cheaper rate starts at 22:00, when spot prices are often at their lowest too, so ${h.a('sahkoauton-lataus', 'electric car charging')} and water heater loads are worth scheduling overnight. The calculator shows the transfer step at 22:00 and 07:00. Some homes in Kainuu and North Ostrobothnia are on ${h.a('siirto-elenia', 'Elenia’s')} network, and around Oulu transfer is handled by ${h.a('siirto-oulu', 'Oulun Energia')}. You cannot choose your network company, but you can choose the transfer product and the electricity contract; the ${h.a('siirtohinnat', 'transfer fee comparison')} shows how Kajave ranks against other networks.</p>`;
    },
  },
});
