/** Accueil (page pilier, RECETTE §5) : textes des deux langues ; chiffres tirés du moteur, du jour de build et des tarifs. */
import type { Helpers, FAQ } from '../lib/guide-types';
import { paivaVerkossa, vuosiKa, tuntiProfiili, jarjestys, SARJA, PAIVA, MARG, PERUS_MYYJA, SOP_N, tunti, porssi } from '../lib/arvot';

export interface HomeText {
  title: string; description: string; h1: string; intro: string;
  resume: (h: Helpers) => string; faqs: (h: Helpers) => FAQ[]; body: (h: Helpers) => string;
}

const V = (h: Helpers) => {
  const { M, P } = h;
  const helen = paivaVerkossa('helen');
  const caruna = paivaVerkossa('caruna');
  const elenia = paivaVerkossa('elenia');
  const jse = paivaVerkossa('jse');
  const arvio = SARJA.tila !== 'toteutunut';
  const v12 = vuosiKa();
  const prof = tuntiProfiili('arki');
  const rank = jarjestys(5000, '3x25');
  const verot = M.VERO_C;
  const spotOsuus = helen.st.ka ? (helen.spot.ka + MARG) / helen.st.ka : 0;
  const huolto = { ennen: P.vero.aiempi_huoltovarmuus_c, nyt: P.vero.huoltovarmuus_c };
  const tuH = M.tuote(M.verkko('helen')!, 'yleis')!;
  const kolme = [-1, 0, 1].map((d) => {
    const s = M.sarja(h.S, M.lisaaPaivia(PAIVA, d));
    const q = M.vartit(s, tuH, porssi);
    return { d, s, sp: M.tilasto(q.map((x) => x.spot)), st: M.tilasto(q.map((x) => x.yhteensa)) };
  });
  const kk = v12.kk.slice(-6).map((k, i) => ({ k, spot: M.spotC(v12.spot.slice(-6)[i]), tot: M.spotC(v12.spot.slice(-6)[i]) + MARG + tuH.energia.kaikki! + verot }));
  const esim = (kwh: number, verkko: string, sulake: M.Sulake, tyyppi: M.Tyyppi) => {
    const tu = M.tuote(M.verkko(verkko)!, tyyppi)!;
    const e = (kwh * (v12.kaC + MARG)) / 100 + PERUS_MYYJA * 12;
    const siirto = M.verkkoVuosi(tu, sulake, kwh, tyyppi === 'yleis' ? 'tasainen' : 'lammitys', v12.kk);
    const vero = (kwh * verot) / 100;
    return { e, siirto, vero, yht: e + siirto + vero, kk: (e + siirto + vero) / 12 };
  };
  const exK = esim(2000, 'helen', 'kt', 'yleis');
  const exL = esim(18000, 'elenia', '3x25', 'aika');
  return { helen, caruna, elenia, jse, arvio, v12, prof, rank, verot, spotOsuus, huolto, pv: h.date(PAIVA), kolme, kk, exK, exL };
};

export const HOME: Record<'fi' | 'en', HomeText> = {
  fi: {
    title: 'Pörssisähkö tänään 2026: hinta siirron ja verojen kanssa',
    description: 'Pörssisähkön hinta tänään ja huomenna 2026 vartin tarkkuudella: lisää oman verkkoyhtiösi siirtomaksu, sähkövero ja alv 25,5 % ja näe sähkön todellinen hinta.',
    h1: 'Pörssisähkön hinta tänään, siirto ja verot mukana',
    intro: 'Pörssihinta on vain osa siitä, mitä kilowattitunti maksaa. Täällä näet koko hinnan oman verkkoyhtiösi mukaan, vartti kerrallaan.',
    resume: (h) => {
      const v = V(h);
      return `${v.arvio ? `Päivän ${v.pv} pörssihintoja ei ollut vielä julkaistu sivun päivittyessä, joten luvut ovat saman kuukauden keskihinta-arvioita.` : `Pörssisähkön keskihinta ${v.pv} on Suomen tarjousalueella ${h.c(v.helen.spot.ka)} arvonlisäveron kanssa.`} Se ei ole se hinta, jonka maksat. Jokaisen kilowattitunnin päälle tulevat myyjän marginaali, paikallisen verkkoyhtiön siirtomaksu sekä sähkövero ja huoltovarmuusmaksu, yhteensä ${h.c(v.verot)} alv mukaan lukien. Helsingissä Helen Sähköverkon yleissiirrolla päivän keskimääräinen kokonaishinta on ${h.c(v.helen.st.ka)}, Carunan yleissiirrolla ${h.c(v.caruna.st.ka)} ja Järvi-Suomen Energian alueella ${h.c(v.jse.st.ka)}, kun marginaali on ${h.c(MARG)}. Halvin vartti maksaa Helsingissä ${h.c(v.helen.st.min)} ja kallein ${h.c(v.helen.st.max)}. Valitse alla postinumero tai verkkoyhtiö, siirtotuote ja sopimus, niin laskuri näyttää hinnan jokaiselle vartille, halvimman jakson ja kuukausimaksut. Huomisen hinnat ilmestyvät iltapäivällä noin kello ${h.P.markkina.julkaisu_fi_klo}, ja sivu päivittää ne itse. Kaikki hinnat ovat senttejä kilowattitunnilta arvonlisäveron kanssa, samassa muodossa kuin sähkösopimuksissa ja -laskuissa, joten voit verrata niitä suoraan omaan laskuusi.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Miksi sähkölaskuni on kalliimpi kuin pörssisähkön hinta?', a: `Pörssihinta kattaa vain energian. Laskulla on lisäksi myyjän marginaali ja perusmaksu, verkkoyhtiön siirtomaksu ja perusmaksu sekä sähkövero ${h.c(v.verot)} alv mukaan lukien. Esimerkiksi Carunan yleissiirto on ${h.c(v.caruna.tu.energia.kaikki!)}, joten pelkät siirto ja vero ovat yli kahdeksan senttiä kilowattitunnilta jo ennen kuin energiasta on maksettu senttiäkään.` },
        { q: 'Mihin aikaan huomisen pörssisähkön hinnat julkaistaan?', a: `Seuraavan vuorokauden hinnat ratkeavat sähköpörssin päivähuutokaupassa keskipäivällä Keski-Euroopan aikaa, ja ne julkaistaan Suomessa tavallisesti noin kello ${h.P.markkina.julkaisu_fi_klo}. Tämä sivu hakee ne automaattisesti. Ennen julkaisua laskuri näyttää huomiselle keskihinta-arvion, joka on merkitty selvästi arvioksi, ja vaihtaa sen oikeisiin hintoihin heti, kun ne ovat saatavilla. Sivua ei tarvitse ladata uudelleen, koska selain hakee uusimman hintatiedoston itse.` },
        { q: 'Onko pörssisähkön hinta nyt vartti- vai tuntihinta?', a: `Varttihinta. Pohjoismaiset sähköpörssit siirtyivät ${h.date(h.P.markkina.vartti_alkaen)} 15 minuutin jaksoihin, joten vuorokaudessa on 96 hintaa. Pörssisopimuksesi hinnoitellaan joko varteittain tai tunneittain sen mukaan, mitä myyjä tarjoaa ja mitä mittarisi välittää. Laskuri näyttää molemmat: vartit kaaviossa ja tuntikeskiarvot taulukossa. Jos sopimuksesi on tuntihintainen, tunnin hinta on sen neljän vartin keskiarvo.` },
        { q: 'Paljonko sähkövero on vuonna 2026?', a: `Kotitalouksien veroluokassa I sähkövero on Verohallinnon verotaulukon mukaan ${h.num(h.P.vero.sahkovero_I_c, 2)} senttiä ja huoltovarmuusmaksu ${h.num(h.P.vero.huoltovarmuus_c, 3)} senttiä kilowattitunnilta ilman arvonlisäveroa ${h.date(h.P.vero.voimassa)} alkaen. Arvonlisäveron 25,5 prosentin kanssa yhteissumma on ${h.c(v.verot, 4)}. Vero laskutetaan verkkoyhtiön laskulla, ja se on sama riippumatta siitä, onko sähkösopimuksesi pörssi- vai kiinteähintainen. Kotitaloudet kuuluvat aina veroluokkaan I.` },
        { q: 'Voiko pörssisähkön hinta olla negatiivinen?', a: `Voi. Kun tuulivoimaa on paljon ja kulutus pientä, pörssihinta painuu joskus alle nollan. Siirtomaksu ja sähkövero eivät silti katoa, joten kokonaishinta jää yleensä plussalle. Negatiivisen tunnin hyöty näkyy vain, jos sopimuksesi seuraa pörssihintaa. Laskuri näyttää negatiivisen vartin kokonaishinnan oman verkkosi siirtomaksulla, joten näet suoraan, paljonko kilowattitunti silloin todella maksaa.` },
        { q: 'Mistä tiedän, mikä verkkoyhtiö minulla on?', a: 'Verkkoyhtiö määräytyy osoitteen mukaan, eikä sitä voi kilpailuttaa. Sen nimi on siirtolaskussa. Laskurin postinumerokenttä hakee alueen verkkoyhtiön Energiaviraston hintavertailun luettelosta. Jos samalla postinumerolla toimii useampi yhtiö tai yhtiötäsi ei vielä ole laskurissa, valitse Muu ja syötä siirtomaksu ja perusmaksu viimeisimmästä siirtolaskustasi, niin laskelma on silti oikea.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      const he = v.helen;
      const ref = he.q.length ? he.q : [];
      const kaSiirto = ref.length ? ref.reduce((a, x) => a + x.siirto, 0) / ref.length : 0;
      const osat = [
        ['Pörssihinta (energia)', h.c(he.spot.ka), 'Sähkönmyyjä'],
        ['Myyjän marginaali', h.c(MARG), 'Sähkönmyyjä'],
        ['Siirtomaksu, Helen yleissiirto', h.c(kaSiirto), 'Verkkoyhtiö'],
        ['Sähkövero ja huoltovarmuusmaksu', h.c(v.verot, 4), 'Verkkoyhtiö (valtiolle)'],
        ['<strong>Yhteensä</strong>', `<strong>${h.c(he.st.ka)}</strong>`, ''],
      ];
      const verkot = v.rank.map((r) => [h.a(`siirto-${r.v.id}`, r.v.lyhyt), h.c(r.v.tuotteet[0].energia.kaikki!), h.eur(h.M.perusKk(r.v.tuotteet[0], 'kt')), h.eur(h.M.perusKk(r.v.tuotteet[0], '3x25')), h.eur(r.paras.e, 0)]);
      const p = v.prof;
      return `<h2>Mistä kilowattitunnin hinta koostuu</h2>
<p>Pörssisähkösopimuksessa maksat neljä asiaa jokaisesta kilowattitunnista. Ensimmäinen on itse energia, eli sähköpörssin hinta Suomen tarjousalueella sillä vartilla, jolla sähkö kulutetaan. Toinen on myyjän marginaali, joka on kiinteä lisä sopimuksen mukaan. Nämä kaksi tulevat sähkönmyyjän laskulla. Kolmas on verkkoyhtiön siirtomaksu, jolla maksetaan sähkön kuljettaminen kantaverkosta kotiisi. Neljäs on sähkövero ja huoltovarmuusmaksu, jotka verkkoyhtiö perii valtion puolesta. Kaikkiin lisätään arvonlisävero 25,5 prosenttia. Lisäksi molemmat yhtiöt perivät kuukausittaisen perusmaksun, joka ei riipu kulutuksesta.</p>
<p>Alla oleva taulukko purkaa ${v.pv} päivän keskimääräisen kilowattitunnin Helsingissä. Luvut tulevat samasta moottorista kuin yllä oleva laskuri, ja ne päivittyvät joka päivä.</p>
${h.table(['Osa', 'c/kWh sis. alv', 'Kuka laskuttaa'], osat, `Päivän ${v.pv} keskiarvo, Helen Sähköverkon yleissiirto, pörssisopimus ${h.c(MARG)} marginaalilla.`, ['l', 'r', 'l'])}
<p>Energian osuus kokonaishinnasta on tänään noin ${h.pct(v.spotOsuus, 0)}. Kun pörssihinta on matala, siirto ja vero ovat suurempi osa laskua kuin itse sähkö. Siksi pelkkä pörssihinta kertoo huonosti, mitä kodin sähkö maksaa, ja siksi sama pörssihinta johtaa eri hintaan Helsingissä, Espoossa ja Mikkelissä.</p>
<h2>Pörssihinta: 96 hintaa vuorokaudessa</h2>
<p>Suomen sähkön tukkuhinta muodostuu pohjoismaisessa sähköpörssissä. Seuraavan vuorokauden jokaiselle vartille lasketaan hinta päivähuutokaupassa, jossa tuottajien myyntitarjoukset ja ostajien tarjoukset kohtaavat. Huutokauppa suljetaan keskipäivällä Keski-Euroopan aikaa, ja Suomessa tulokset ovat yleensä nähtävillä noin kello ${h.P.markkina.julkaisu_fi_klo}. ${h.date(h.P.markkina.vartti_alkaen)} lähtien hinta on määritetty jokaiselle 15 minuutin jaksolle, joten vuorokaudessa on 96 hintaa ja kesäajan vaihtumispäivinä 92 tai 100.</p>
<p>Pörssihinnat ilmoitetaan euroina megawattitunnilta ilman arvonlisäveroa. Yksi euro megawattitunnilta on 0,1 senttiä kilowattitunnilta, ja arvonlisäveron kanssa 0,1255 senttiä. Tällä sivulla kaikki hinnat ovat valmiiksi senttejä kilowattitunnilta arvonlisäveron kanssa, koska kuluttajasopimuksissa hinnat ilmoitetaan niin. Hintojen lähteenä on ${h.src('nordpool', 'Nord Poolin day-ahead-hinnasto')}, ja sivuston päivitys on valmis hakemaan ne myös ${h.src('entsoe', 'ENTSO-E:n läpinäkyvyysalustalta')}.</p>
<h2>Siirtomaksu: sama sähkö, eri hinta osoitteen mukaan</h2>
<p>Sähkönmyyjän voi kilpailuttaa, verkkoyhtiötä ei. Jakeluverkko on alueellinen monopoli, jonka hinnoittelun kohtuullisuutta valvoo Energiavirasto. Siksi siirtomaksun suuruus riippuu siitä, missä asut. Taulukossa on laskurin kolmentoista verkkoyhtiön yleissiirron hinta ja perusmaksu sekä siirron vuosikustannus omakotitalolle, joka kuluttaa 5 000 kilowattituntia vuodessa ja jolla on 3 × 25 ampeerin pääsulake. Järjestys perustuu kunkin verkon edullisimpaan siirtotuotteeseen.</p>
${h.table(['Verkkoyhtiö', 'Yleissiirto', 'Perusmaksu, kerrostalo', 'Perusmaksu, 3 × 25 A', 'Siirto vuodessa, 5 000 kWh'], verkot, 'Hinnat verkkoyhtiöiden omista hinnastoista, sis. alv 25,5 %, ilman sähköveroa. Verkon nimestä pääset sen omaan laskuriin.', ['l', 'r', 'r', 'r', 'r'])}
<p>Ero on suuri. Halvimmassa verkossa siirto maksaa tällä kulutuksella ${h.eur(v.rank[0].paras.e, 0)} vuodessa, kalleimmassa ${h.eur(v.rank.at(-1)!.paras.e, 0)}. Erotus on enemmän kuin moni maksaa vuodessa pörssisopimuksen marginaalista. Yösiirto tai aikasiirto voi pienentää siirron hintaa, jos suuri osa kulutuksesta osuu iltaan kello 22 jälkeen tai yöhön, kuten varaavassa sähkölämmityksessä. Vertaa omaa verkkoasi kaikkiin muihin ${h.a('siirtohinnat', 'siirtohintojen vertailussa')}.</p>
<h2>Sähkövero ja huoltovarmuusmaksu</h2>
<p>Sähkövero kuuluu valmisteveroihin, ja sen perii verkkoyhtiö samalla laskulla kuin siirron. ${h.src('veroTaulukko', 'Verohallinnon verotaulukon')} mukaan veroluokan I sähkövero on ${h.num(h.P.vero.sahkovero_I_c, 2)} senttiä kilowattitunnilta ja huoltovarmuusmaksu ${h.num(v.huolto.nyt, 3)} senttiä ${h.date(h.P.vero.voimassa)} alkaen. Aiemmin huoltovarmuusmaksu oli ${h.num(v.huolto.ennen, 3)} senttiä. Arvonlisäveron kanssa kotitalous maksaa siis ${h.c(v.verot, 4)} jokaisesta kilowattitunnista riippumatta siitä, onko sopimus pörssi- vai kiinteähintainen. Veroluokka II on teollisuudelle, ammattimaiselle kasvihuoneviljelylle ja eräille lämpöpumpuille; kotitaloudet kuuluvat aina luokkaan I. Lisää aiheesta ${h.a('sahkovero', 'sähköveron oppaassa')}.</p>
<h2>Halvimmat ja kalleimmat tunnit</h2>
${p ? `<p>Arkipäivinä halvimmat tunnit ovat viime viikkoina olleet keskimäärin ${p.halvimmat.map(tunti).join(', ')} ja kalleimmat ${p.kalleimmat.map(tunti).join(', ')}. Laskelma perustuu ${h.num(p.paivia)} arkipäivän toteutuneisiin varttihintoihin, ja se päivittyy joka päivä. Säännöllisyys johtuu kulutuksesta: aamulla ja alkuillalla kysyntä on suurimmillaan, yöllä pienimmillään. Tuulivoima sekoittaa järjestyksen usein, joten päivän todellinen halvin jakso kannattaa katsoa laskurista.</p>` : ''}
<p>Laskuri etsii halvimman yhtenäisen jakson valitsemallesi kestolle. Jos lataat sähköautoa kolme tuntia tai lämmität saunaa puolitoista tuntia, aseta kesto ja katso, mihin aikaan aloitus on edullisin. Tänään kahden tunnin halvin jakso Helsingissä alkaa kello ${he.kello(he.ik2.i)}, ja sen keskihinta on ${h.c(he.ik2.ka)}. Laitekohtaiset laskurit näyttävät suoraan euroina, mitä ${h.a('saunan-hinta', 'saunominen')}, ${h.a('sahkoauton-lataus', 'sähköauton lataus')} tai ${h.a('pyykinpesu', 'pyykinpesu')} maksaa.</p>
<h2>Pörssisähkö vai kiinteä sopimus</h2>
<p>Viimeisen kahdentoista julkaistun kuukauden aikana pörssisähkön keskihinta on ollut ${h.c(v.v12.kaC)} arvonlisäveron kanssa. Pörssisopimuksen kokonaishinta riippuu siitä, milloin käytät sähköä, ja kiinteän sopimuksen kannattavuus siitä, mihin hintaan sen saa solmittua. ${h.a('porssi-vai-kiintea', 'Vertailulaskuri')} laskee, kumpi olisi tullut halvemmaksi omalla vuosikulutuksellasi, ja kertoo kiinteän hinnan, jolla molemmat olisivat maksaneet saman verran. Siirtomaksu ja sähkövero ovat molemmissa samat, joten ne eivät vaikuta valintaan.</p>
<p>Laskurin oletusmarginaali ${h.c(MARG)} ja perusmaksu ${h.eur(PERUS_MYYJA)} kuukaudessa ovat ${h.src('evHintavertailu', 'Energiaviraston sähkön hintavertailussa')} näkyvien ${h.num(SOP_N)} kuluttajien pörssisopimuksen mediaanit. Vaihda tilalle oman sopimuksesi luvut.</p>
<h2>Miten tämä sivu päivittyy</h2>
<p>Hinnat haetaan automaattisesti joka päivä kolmesti: iltapäivällä huomisen hintojen julkaisun jälkeen, uudelleen tuntia myöhemmin varmuuden vuoksi ja keskiyöllä, jolloin huominen vaihtuu tähän päivään. Selaimesi lukee lisäksi uusimman hintatiedoston aina, kun avaat sivun, joten laskuri näyttää oikean päivän, vaikka sivu olisi rakennettu eilen. Jos päivän hintoja ei jostain syystä ole saatavilla, laskuri näyttää tilalla keskihinta-arvion ja kertoo sen keltaisella tekstillä: arvio lasketaan saman kuukauden ja viikonpäivätyypin toteutuneista hinnoista vartti kerrallaan, tai kuukauden virallisesta keskihinnasta ja vuorokausiprofiilista. Arvio vaihtuu oikeisiin hintoihin heti, kun ne ovat saatavilla.</p>
<p>Siirtomaksut on luettu kunkin verkkoyhtiön omasta hinnastosta ja tarkistetaan ohjelmallisesti lähteestä. Verot ovat Verohallinnon taulukosta. Kaikki laskenta tapahtuu selaimessasi: postinumeroa tai kulutustasi ei lähetetä minnekään. Tarkemmin ${h.a('method', 'menetelmäsivulla')}.</p>
<h2>Eilen, tänään ja huomenna</h2>
${h.table(['Päivä', 'Pörssihinta, keskiarvo', 'Pörssi, halvin–kallein', 'Kokonaishinta Helsingissä', 'Hintatila'], v.kolme.map((k) => [h.date(k.s.pvm), k.s.hinnat.length ? h.c(k.sp.ka) : '–', k.s.hinnat.length ? `${h.num(k.sp.min, 2)}–${h.num(k.sp.max, 2)}` : '–', k.s.hinnat.length ? h.c(k.st.ka) : '–', k.s.tila === 'toteutunut' ? 'julkaistu' : k.s.tila === 'arvio' ? 'arvio' : 'ei tietoa']), 'Kokonaishinta: Helen Sähköverkon yleissiirto, pörssisopimus mediaanimarginaalilla, sähkövero ja alv mukana. Arvio tarkoittaa, että päivän hintoja ei ollut vielä julkaistu sivun päivittyessä.', ['l', 'r', 'r', 'r', 'l'])}
<p>Taulukko kertoo, miten hinnat liikkuvat päivästä toiseen. Pörssihinnan muutos välittyy kokonaishintaan täysimääräisenä, mutta suhteellinen muutos on pienempi, koska siirtomaksu ja sähkövero pysyvät samoina. Jos pörssihinta kaksinkertaistuu kahdesta neljään senttiin, kokonaishinta Helsingissä nousee noin kymmenestä kahteentoista senttiin, ei kaksinkertaiseksi. Kalliina talvipäivänä, jolloin pörssihinta on kymmeniä senttejä, tilanne kääntyy: silloin energia on laskun suurin osa ja kulutuksen ajoituksella on eniten merkitystä.</p>
<h2>Viimeisten kuukausien hintataso</h2>
${h.table(['Kuukausi', 'Pörssihinta sis. alv', 'Kokonaishinta, Helen yleissiirto'], v.kk.map((x) => [x.k, h.c(x.spot), h.c(x.tot)]), 'Kuukauden pörssihinta on Suomen tarjousalueen keskiarvo. Kokonaishinnassa ovat mukana mediaanimarginaali, Helenin yleissiirto ja sähkövero; kuukausimaksut eivät sisälly.', ['l', 'r', 'r'])}
<p>Pidempi aikasarja ja muiden verkkoyhtiöiden kokonaishinnat ovat ${h.a('kuukausihinnat', 'kuukausihintojen sivulla')}. Talvikuukausina pörssihinnat ovat tavallisesti korkeimmillaan, koska lämmitys lisää kulutusta ja aurinkosähköä on vähän, kun taas kesällä ja keväällä vesi- ja tuulivoiman runsaus laskee hintaa.</p>
<h2>Kaksi esimerkkiä vuoden sähkölaskusta</h2>
<p>Kerrostaloasunto Helsingissä, kulutus 2 000 kilowattituntia vuodessa, yleissiirto ja pörssisopimus viimeisen vuoden keskihinnalla: energia perusmaksuineen ${h.eur(v.exK.e, 0)}, siirto perusmaksuineen ${h.eur(v.exK.siirto, 0)} ja sähkövero ${h.eur(v.exK.vero, 0)}, yhteensä ${h.eur(v.exK.yht, 0)} vuodessa eli noin ${h.eur(v.exK.kk, 0)} kuukaudessa. Pienellä kulutuksella siirto ja perusmaksut ovat laskun suurin osa, ja energian osuus jää alle puoleen.</p>
<p>Sähkölämmitteinen omakotitalo Elenian alueella, 18 000 kilowattituntia vuodessa, yösiirto ja sama pörssisopimus: energia ${h.eur(v.exL.e, 0)}, siirto ${h.eur(v.exL.siirto, 0)} ja sähkövero ${h.eur(v.exL.vero, 0)}, yhteensä ${h.eur(v.exL.yht, 0)} vuodessa, keskimäärin ${h.eur(v.exL.kk, 0)} kuukaudessa. Todellisuudessa talvikuukausien laskut ovat moninkertaisia kesään verrattuna. Laske oma kuukautesi ${h.a('sahkolasku', 'sähkölaskulaskurilla')}.</p>
<h2>Viisi tapaa maksaa vähemmän</h2>
<ol>
<li><strong>Tarkista siirtotuote.</strong> Jos lämmität sähköllä ja kulutus on suuri, yö- tai kausisiirto voi olla satoja euroja vuodessa yleissiirtoa halvempi. Verkkoyhtiö vaihtaa tuotteen yleensä kerran vuodessa maksutta.</li>
<li><strong>Siirrä joustavat kulutukset halvoille tunneille.</strong> Sähköauton lataus, lämminvesivaraaja, pyykinpesu ja kuivausrumpu voi useimmiten ajastaa yöhön tai muuhun halpaan jaksoon.</li>
<li><strong>Vertaa marginaalia ja perusmaksua.</strong> Pörssisopimuksissa ne ovat ainoat asiat, joilla myyjät eroavat toisistaan. Muutaman sentin kymmenyksen ero kertautuu suurella kulutuksella.</li>
<li><strong>Älä pidä sulaketta turhan suurena.</strong> Monen verkkoyhtiön perusmaksu kasvaa jyrkästi 3 × 25 ampeerista 3 × 35 ampeeriin. Sulakkeen pienentäminen voi kuitenkin maksaa liittymän muutostyönä, joten kysy ensin verkkoyhtiöltä.</li>
<li><strong>Seuraa kulutustasi.</strong> Verkkoyhtiön palvelussa näet kulutuksesi tunneittain tai varteittain. Sen avulla löydät suurimmat kuluttajat ja näet, osuuko kulutus kalliisiin tunteihin.</li>
</ol>
<h2>Miksi muut hintasivut näyttävät eri lukua</h2>
<p>Useimmat pörssisähkösivut näyttävät pelkän pörssihinnan, joko arvonlisäveron kanssa tai ilman. Se on oikea luku energian hinnaksi, mutta se ei kerro, mitä yhden kilowattitunnin käyttäminen maksaa. Kun pörssihinta on kaksi senttiä, kuluttaja maksaa siirron ja veron kanssa tyypillisesti kymmenen senttiä tai enemmän. Halvimman tunnin valinta ei myöskään aina vaihdu, mutta säästön suuruus muuttuu: siirto ja vero ovat yleissiirrossa jokaisena vuorokauden hetkenä samat, ja aikasiirrossa yöllä halvemmat. Siksi tämä sivu laskee jokaisen vartin hinnan juuri sinun siirtotuotteellasi.</p>
<p>Huomisen hinnat kootusti ovat ${h.a('huomenna', 'huomisen pörssisähkösivulla')}, kuukausien keskihinnat ${h.a('kuukausihinnat', 'kuukausittain')} ja koko sähkölaskun arvio ${h.a('sahkolasku', 'sähkölaskulaskurissa')}.</p>`;
    },
  },
  en: {
    title: 'Spot Electricity Price Finland Today 2026: With Transfer',
    description: 'Finnish exchange electricity price today and tomorrow, 2026, by quarter hour: add your network’s transfer fee, electricity tax and 25.5% VAT for the real price.',
    h1: 'Finnish spot electricity price today, with transfer and tax',
    intro: 'The exchange price is only part of what a kilowatt-hour costs. Here you see the full price for your own network operator, quarter by quarter.',
    resume: (h) => {
      const v = V(h);
      return `${v.arvio ? `Exchange prices for ${v.pv} had not yet been published when this page was built, so the figures are average-price estimates for the same month.` : `The average exchange price on ${v.pv} in the Finnish bidding zone is ${h.c(v.helen.spot.ka)} including VAT.`} That is not the price you pay. On top of every kilowatt-hour come the retailer’s margin, your local network operator’s transfer fee, and the electricity tax and security-of-supply fee, together ${h.c(v.verot)} including VAT. In Helsinki, on Helen Sähköverkko’s general transfer, the day’s average all-in price is ${h.c(v.helen.st.ka)}; on Caruna’s general transfer it is ${h.c(v.caruna.st.ka)} and in Järvi-Suomen Energia’s area ${h.c(v.jse.st.ka)}, with a margin of ${h.c(MARG)}. The cheapest quarter hour in Helsinki costs ${h.c(v.helen.st.min)} and the dearest ${h.c(v.helen.st.max)}. Choose your postcode or operator, transfer product and contract below and the calculator shows the price of every quarter hour, the cheapest window and your monthly fees. Tomorrow’s prices appear in the afternoon, at about ${h.P.markkina.julkaisu_fi_klo} Finnish time.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Why is my electricity bill higher than the spot price?', a: `The spot price only covers energy. Your bills add the retailer’s margin and monthly fee, the network operator’s transfer and basic fees, and electricity tax of ${h.c(v.verot)} including VAT. Caruna’s general transfer alone is ${h.c(v.caruna.tu.energia.kaikki!)}, so transfer and tax already exceed eight cents a kilowatt-hour before any energy is paid for.` },
        { q: 'When are tomorrow’s Finnish electricity prices published?', a: `Next-day prices are set in the exchange’s day-ahead auction at noon Central European time and usually appear in Finland at about ${h.P.markkina.julkaisu_fi_klo}. This page fetches them automatically. Before publication the calculator shows an average-price estimate for tomorrow, clearly marked as an estimate.` },
        { q: 'Is the Finnish spot price set per hour or per quarter hour?', a: `Per quarter hour. The Nordic exchanges moved to 15-minute periods on ${h.date(h.P.markkina.vartti_alkaen)}, so each day has 96 prices. Your own spot contract is priced per quarter or per hour depending on the retailer and what your meter reports. The calculator shows both: quarters in the chart and hourly averages in the table.` },
        { q: 'How much is the Finnish electricity tax in 2026?', a: `For households (tax class I) the Tax Administration’s table sets electricity tax at ${h.num(h.P.vero.sahkovero_I_c, 2)} cents and the security-of-supply fee at ${h.num(h.P.vero.huoltovarmuus_c, 3)} cents per kilowatt-hour before VAT from ${h.date(h.P.vero.voimassa)}. With 25.5% VAT that is ${h.c(v.verot, 4)}. It is billed by the network operator.` },
        { q: 'Can the spot price in Finland go negative?', a: 'Yes. When wind output is high and demand low, the exchange price sometimes drops below zero. Transfer fees and electricity tax do not disappear, so the all-in price usually stays positive. You only benefit from a negative quarter if your contract follows the spot price. The calculator shows the all-in price of a negative quarter with your own network’s fee.' },
        { q: 'How do I find out which network operator I have?', a: 'Your operator is set by your address and cannot be changed; its name is on the transfer bill. The calculator’s postcode field looks it up in the Energy Authority comparison service list. If several operators share your postcode, or yours is not in the calculator yet, choose Other and enter the transfer fee from your bill.' },
      ];
    },
    body: (h) => {
      const v = V(h);
      const he = v.helen;
      const kaSiirto = he.q.length ? he.q.reduce((a, x) => a + x.siirto, 0) / he.q.length : 0;
      const osat = [
        ['Exchange price (energy)', h.c(he.spot.ka), 'Retailer'],
        ['Retailer margin', h.c(MARG), 'Retailer'],
        ['Transfer fee, Helen general transfer', h.c(kaSiirto), 'Network operator'],
        ['Electricity tax and security-of-supply fee', h.c(v.verot, 4), 'Network operator (for the state)'],
        ['<strong>Total</strong>', `<strong>${h.c(he.st.ka)}</strong>`, ''],
      ];
      const verkot = v.rank.map((r) => [h.a(`siirto-${r.v.id}`, r.v.lyhyt), h.c(r.v.tuotteet[0].energia.kaikki!), h.eur(h.M.perusKk(r.v.tuotteet[0], 'kt')), h.eur(h.M.perusKk(r.v.tuotteet[0], '3x25')), h.eur(r.paras.e, 0)]);
      const p = v.prof;
      return `<h2>What a kilowatt-hour is made of</h2>
<p>On a spot contract you pay for four things with every kilowatt-hour. The first is the energy itself: the exchange price in the Finnish bidding zone for the quarter hour in which you use it. The second is the retailer’s margin, a fixed add-on set in your contract. Those two come on the retailer’s bill. The third is the network operator’s transfer fee, which pays for carrying power from the national grid to your home. The fourth is electricity tax and the security-of-supply fee, collected by the network operator for the state. VAT of 25.5% is added to all of them. Both companies also charge a monthly basic fee that does not depend on how much you use.</p>
<p>The table breaks down the average kilowatt-hour in Helsinki on ${v.pv}. The figures come from the same engine as the calculator above and refresh every day.</p>
${h.table(['Part', 'c/kWh incl. VAT', 'Billed by'], osat, `Average for ${v.pv}, Helen Sähköverkko general transfer, spot contract with a ${h.c(MARG)} margin.`, ['l', 'r', 'l'])}
<p>Energy makes up about ${h.pct(v.spotOsuus, 0)} of the all-in price today. When the exchange price is low, transfer and tax weigh more on the bill than the electricity itself. That is why the spot price alone says little about what power at home costs, and why the same spot price leads to different prices in Helsinki, Espoo and Mikkeli.</p>
<h2>The exchange price: 96 prices a day</h2>
<p>The wholesale price of electricity in Finland is set on the Nordic power exchange. A price for every quarter hour of the next day is found in the day-ahead auction, where producers’ offers meet buyers’ bids. The auction closes at noon Central European time and the results are usually visible in Finland at about ${h.P.markkina.julkaisu_fi_klo}. Since ${h.date(h.P.markkina.vartti_alkaen)} a price is set for every 15-minute period, so a day has 96 prices, and 92 or 100 on the days the clocks change.</p>
<p>Exchange prices are quoted in euros per megawatt-hour before VAT. One euro per megawatt-hour is 0.1 cents per kilowatt-hour, and 0.1255 cents with VAT. On this site every price is already in cents per kilowatt-hour including VAT, because that is how consumer contracts are quoted. Prices come from ${h.src('nordpool', 'Nord Pool’s day-ahead price list')}, and the site’s updater is ready to fetch them from the ${h.src('entsoe', 'ENTSO-E Transparency Platform')} as well.</p>
<h2>Transfer fees: same power, different price by address</h2>
<p>You can switch electricity retailer but not network operator. The distribution grid is a regional monopoly whose pricing is supervised by the Energy Authority, so the transfer fee depends on where you live. The table lists the general transfer price and basic fee of the thirteen operators in the calculator, and the annual transfer cost for a house using 5,000 kilowatt-hours a year on a 3 × 25 A main fuse. They are ranked by each network’s cheapest transfer product.</p>
${h.table(['Operator', 'General transfer', 'Basic fee, flat', 'Basic fee, 3 × 25 A', 'Transfer per year, 5,000 kWh'], verkot, 'Prices from each operator’s own price list, incl. 25.5% VAT, excluding electricity tax. The operator’s name links to its own calculator.', ['l', 'r', 'r', 'r', 'r'])}
<p>The gap is large. In the cheapest network transfer costs ${h.eur(v.rank[0].paras.e, 0)} a year at this consumption, in the dearest ${h.eur(v.rank.at(-1)!.paras.e, 0)}. The difference is more than many households pay in a year of spot-contract margin. A night or time-of-day transfer product can cut the cost if much of your use falls after 22:00 or at night, as with storage electric heating. Compare your own network with all the others in the ${h.a('siirtohinnat', 'transfer fee comparison')}.</p>
<h2>Electricity tax and the security-of-supply fee</h2>
<p>Electricity tax is an excise duty, and the network operator collects it on the same bill as transfer. According to the ${h.src('veroTaulukko', 'Tax Administration’s table')}, tax class I electricity tax is ${h.num(h.P.vero.sahkovero_I_c, 2)} cents per kilowatt-hour and the security-of-supply fee ${h.num(v.huolto.nyt, 3)} cents from ${h.date(h.P.vero.voimassa)}. Before that the fee was ${h.num(v.huolto.ennen, 3)} cents. With VAT a household therefore pays ${h.c(v.verot, 4)} on every kilowatt-hour, whether the contract is spot or fixed. Tax class II applies to industry, professional greenhouses and some heat pumps; households are always in class I. More in the ${h.a('sahkovero', 'electricity tax guide')}.</p>
<h2>The cheapest and dearest hours</h2>
${p ? `<p>On weekdays the cheapest hours in recent weeks have on average been ${p.halvimmat.map(tunti).join(', ')} and the dearest ${p.kalleimmat.map(tunti).join(', ')}. The figures come from actual quarter-hour prices on ${h.num(p.paivia)} weekdays and refresh daily. The pattern follows demand: it peaks in the morning and early evening and is lowest at night. Wind power often reshuffles the order, so check the day’s real cheapest window in the calculator.</p>` : ''}
<p>The calculator finds the cheapest continuous window for the length you set. Charging a car for three hours or heating the sauna for an hour and a half? Set the length and see when starting is cheapest. Today the cheapest two-hour window in Helsinki starts at ${he.kello(he.ik2.i)} and averages ${h.c(he.ik2.ka)}. The appliance calculators show directly in euros what ${h.a('saunan-hinta', 'a sauna')}, ${h.a('sahkoauton-lataus', 'charging an electric car')} or ${h.a('pyykinpesu', 'a wash')} costs.</p>
<h2>Spot or fixed-price contract</h2>
<p>Over the last twelve published months the average spot price has been ${h.c(v.v12.kaC)} including VAT. The all-in price of a spot contract depends on when you use electricity, and a fixed contract pays off only if you sign it at the right price. The ${h.a('porssi-vai-kiintea', 'comparison calculator')} works out which would have been cheaper on your annual consumption and the fixed price at which both would have cost the same. Transfer and electricity tax are identical in both cases, so they do not affect the choice.</p>
<p>The calculator’s default margin of ${h.c(MARG)} and monthly fee of ${h.eur(PERUS_MYYJA)} are the medians of the ${h.num(SOP_N)} consumer spot contracts listed in the ${h.src('evHintavertailu', 'Energy Authority’s price comparison')}. Replace them with your own contract’s figures.</p>
<h2>How this page stays up to date</h2>
<p>Prices are fetched automatically three times a day: in the afternoon after tomorrow’s prices are published, again an hour later as a safety net, and at midnight when tomorrow becomes today. Your browser also reads the latest price file whenever you open the page, so the calculator shows the right day even if the page was built yesterday. If the day’s prices are unavailable for any reason, the calculator shows an average-price estimate instead and says so in amber: it is built from actual prices for the same month and type of day, quarter by quarter, or from the official monthly average and the daily profile. It switches to real prices as soon as they are available.</p>
<p>Transfer fees were read from each operator’s own price list and are checked against the source by a script. Taxes come from the Tax Administration’s table. All calculation runs in your browser: your postcode and consumption are sent nowhere. Details on the ${h.a('method', 'method page')}.</p>
<h2>Yesterday, today and tomorrow</h2>
${h.table(['Day', 'Spot price, average', 'Spot, cheapest–dearest', 'All-in price in Helsinki', 'Status'], v.kolme.map((k) => [h.date(k.s.pvm), k.s.hinnat.length ? h.c(k.sp.ka) : '–', k.s.hinnat.length ? `${h.num(k.sp.min, 2)}–${h.num(k.sp.max, 2)}` : '–', k.s.hinnat.length ? h.c(k.st.ka) : '–', k.s.tila === 'toteutunut' ? 'published' : k.s.tila === 'arvio' ? 'estimate' : 'no data']), 'All-in price: Helen Sähköverkko general transfer, spot contract at the median margin, electricity tax and VAT included. Estimate means the day’s prices were not yet published when the page updated.', ['l', 'r', 'r', 'r', 'l'])}
<p>The table shows how prices move from day to day. A change in the exchange price passes fully into the all-in price, but the relative change is smaller because transfer and tax stay the same. If the spot price doubles from two to four cents, the all-in price in Helsinki rises from about ten to twelve cents, not twofold. On an expensive winter day, when spot reaches tens of cents, the picture flips: energy becomes the largest part of the bill and timing your use matters most.</p>
<h2>Recent monthly price levels</h2>
${h.table(['Month', 'Spot incl. VAT', 'All-in, Helen general transfer'], v.kk.map((x) => [x.k, h.c(x.spot), h.c(x.tot)]), 'The monthly spot price is the Finnish bidding-zone average. The all-in price includes the median margin, Helen’s general transfer and electricity tax; monthly fees are excluded.', ['l', 'r', 'r'])}
<p>A longer series and all-in prices for other operators are on the ${h.a('kuukausihinnat', 'monthly prices page')}. Spot prices are usually highest in the winter months, when heating lifts demand and there is little solar power, while plentiful hydro and wind power push prices down in spring and summer.</p>
<h2>Two examples of a year’s electricity bill</h2>
<p>A flat in Helsinki using 2,000 kilowatt-hours a year, on general transfer and a spot contract at the last year’s average price: energy with monthly fee ${h.eur(v.exK.e, 0)}, transfer with basic fee ${h.eur(v.exK.siirto, 0)} and electricity tax ${h.eur(v.exK.vero, 0)}, a total of ${h.eur(v.exK.yht, 0)} a year or about ${h.eur(v.exK.kk, 0)} a month. At low consumption transfer and fixed fees are the largest part of the bill, and energy is less than half.</p>
<p>An electrically heated house in Elenia’s area using 18,000 kilowatt-hours a year, on night transfer and the same spot contract: energy ${h.eur(v.exL.e, 0)}, transfer ${h.eur(v.exL.siirto, 0)} and electricity tax ${h.eur(v.exL.vero, 0)}, a total of ${h.eur(v.exL.yht, 0)} a year, ${h.eur(v.exL.kk, 0)} a month on average. In reality winter bills are several times summer ones. Work out your own month in the ${h.a('sahkolasku', 'electricity bill calculator')}.</p>
<h2>Five ways to pay less</h2>
<ol>
<li><strong>Check your transfer product.</strong> With electric heating and high consumption, night or seasonal transfer can be hundreds of euros a year cheaper than general transfer. Operators usually switch products free once a year.</li>
<li><strong>Move flexible loads to cheap hours.</strong> Car charging, the water heater, washing and drying can usually be timed for the night or another cheap window.</li>
<li><strong>Compare margin and monthly fee.</strong> On spot contracts they are the only things that separate retailers. A difference of a few tenths of a cent adds up at high consumption.</li>
<li><strong>Do not keep a larger fuse than you need.</strong> Many operators’ basic fee jumps from 3 × 25 A to 3 × 35 A. Downsizing can itself cost a connection change, so ask your operator first.</li>
<li><strong>Follow your consumption.</strong> The operator’s portal shows your use by the hour or quarter. It reveals the biggest consumers and whether your use falls in expensive hours.</li>
</ol>
<h2>Why other price sites show a different figure</h2>
<p>Most Finnish spot-price sites show the exchange price alone, with or without VAT. That is the right figure for the energy, but it does not tell you what using a kilowatt-hour costs. When the exchange price is two cents, a consumer typically pays ten cents or more once transfer and tax are added. The cheapest hour does not always change, but the size of the saving does: on general transfer the fee and tax are the same at every hour, while on time-of-day transfer nights are cheaper. That is why this page prices every quarter hour on your own transfer product.</p>
<p>Tomorrow’s prices are on the ${h.a('huomenna', 'tomorrow page')}, monthly averages ${h.a('kuukausihinnat', 'by month')} and a full bill estimate in the ${h.a('sahkolasku', 'electricity bill calculator')}.</p>`;
    },
  },
};
