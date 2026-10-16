/** Moteur : cas de référence recalculés à la main (TVA 25,5 %, sähkövero 2,24 + 0,085 c/kWh hors TVA). */
import { describe, expect, it } from 'vitest';
import * as M from './index';

const caruna = M.verkko('caruna')!, elenia = M.verkko('elenia')!, oulu = M.verkko('oulu')!, helen = M.verkko('helen')!;
const utc = (s: string) => Date.parse(s);

describe('verot', () => {
  it('sähkövero luokka I TVA comprise = 2,325 × 1,255 = 2,917875 c/kWh (tarifs Elenia, Tampere, Helen)', () => {
    expect(M.VERO_VEROTON).toBeCloseTo(2.325, 9);
    expect(M.VERO_C).toBeCloseTo(2.917875, 9);
  });
  it('spot 100 €/MWh = 10 c/kWh hors TVA = 12,55 c/kWh TVA comprise', () => expect(M.spotC(100)).toBeCloseTo(12.55, 9));
  it('spot négatif −20 €/MWh = −2,51 c/kWh TVA comprise', () => expect(M.spotC(-20)).toBeCloseTo(-2.51, 9));
});

describe('prix total', () => {
  it('pörssi : 100 €/MWh + marge 0,51 + Caruna yleissiirto 5,26 + vero = 21,237875', () => {
    const o = M.kwhHinta(100, 5.26, { tyyppi: 'porssi', marginaali: 0.51, kiintea: 0 });
    expect(o.yhteensa).toBeCloseTo(12.55 + 0.51 + 5.26 + 2.917875, 9);
    expect(o.energia).toBeCloseTo(13.06, 9);
  });
  it('kiinteä 8 c/kWh : le spot est ignoré, 8 + 5,26 + 2,917875 = 16,177875', () => {
    expect(M.kwhHinta(250, 5.26, { tyyppi: 'kiintea', marginaali: 0.51, kiintea: 8 }).yhteensa).toBeCloseTo(16.177875, 9);
  });
  it('coût d’un usage : 9 kWh à 20 c/kWh = 1,80 €', () => expect(M.eur(9, 20)).toBeCloseTo(1.8, 9));
});

describe('heure de Finlande', () => {
  it('minuit d’Helsinki : 21 h UTC en heure d’été, 22 h UTC en hiver', () => {
    expect(new Date(M.keskiyo('2026-10-16')).toISOString()).toBe('2026-10-15T21:00:00.000Z');
    expect(new Date(M.keskiyo('2026-12-01')).toISOString()).toBe('2026-11-30T22:00:00.000Z');
  });
  it('changements d’heure : 100 quarts le 25.10.2026, 92 le 29.3.2026, 96 sinon', () => {
    expect(M.varttejaPaivassa('2026-10-25')).toBe(100);
    expect(M.varttejaPaivassa('2026-03-29')).toBe(92);
    expect(M.varttejaPaivassa('2026-10-16')).toBe(96);
  });
  it('kello : 05:00 UTC le 16.10. = 08:00 à Helsinki', () => expect(M.kello(utc('2026-10-16T05:00:00Z'))).toBe('08:00'));
});

describe('siirtomaksu par créneau', () => {
  const yo = M.tuote(elenia, 'aika')!, kausi = M.tuote(elenia, 'kausi')!;
  it('Elenia yösiirto : 4,53 à 08:00, 2,76 à 23:00 et à 06:45', () => {
    expect(M.siirtoC(yo, utc('2026-10-16T05:00:00Z'))).toBe(4.53);
    expect(M.siirtoC(yo, utc('2026-10-16T20:00:00Z'))).toBe(2.76);
    expect(M.siirtoC(yo, utc('2026-10-16T03:45:00Z'))).toBe(2.76);
  });
  it('Elenia vuodenaikasiirto : 5,56 un mardi de décembre à 10:00, 2,76 le dimanche et en octobre', () => {
    expect(M.siirtoC(kausi, utc('2026-12-01T08:00:00Z'))).toBe(5.56);
    expect(M.siirtoC(kausi, utc('2026-12-06T08:00:00Z'))).toBe(2.76);
    expect(M.siirtoC(kausi, utc('2026-10-16T07:00:00Z'))).toBe(2.76);
  });
  it('perusmaksu : Oulun Energia publie 83,88 €/an → 6,99 €/mois ; Caruna 3x25 A 29,71', () => {
    expect(M.perusKk(M.tuote(oulu, 'yleis')!, '3x25')).toBeCloseTo(6.99, 9);
    expect(M.perusKk(M.tuote(caruna, 'yleis')!, '3x25')).toBe(29.71);
    expect(M.perusKk(M.tuote(elenia, 'aika')!, 'kt')).toBe(39.58); // pas de tarif kt : repli 3x25
  });
});

describe('fenêtre la moins chère', () => {
  it('[5,4,1,2,9] sur 2 créneaux → indice 2, moyenne 1,5', () => expect(M.halvinIkkuna([5, 4, 1, 2, 9], 2)).toEqual({ i: 2, ka: 1.5 }));
  it('fenêtre plus longue que la série → −1', () => expect(M.halvinIkkuna([1, 2], 3).i).toBe(-1));
  it('à partir de l’indice 3 → [2,9] seule fenêtre', () => expect(M.halvinIkkuna([5, 4, 1, 2, 9], 2, 3)).toEqual({ i: 3, ka: 5.5 }));
  it('statistiques : min ≤ moyenne ≤ max', () => { const s = M.tilasto([3, -1, 7]); expect([s.min, s.minI, s.max, s.maxI]).toEqual([-1, 1, 7, 2]); expect(s.ka).toBeCloseTo(3, 9); });
});

describe('estimation de secours', () => {
  const a: M.Arvio = { jakso: null, tasoJakso: null, tasoLahde: '', taso: { 10: 40 }, profiili: { arki: { paivia: 30, poikkeama: Array.from({ length: 96 }, (_, i) => (i === 0 ? 5 : 0)) } }, suora: {} };
  it('niveau d’octobre 40 €/MWh + écart du profil : 45 au premier quart, 40 ensuite (mercredi 14.10.)', () => {
    const s = M.arvioPaiva(a, '2026-10-14')!;
    expect(s.tila).toBe('arvio'); expect(s.menetelma).toBe('taso+profiili');
    expect(s.hinnat.length).toBe(96); expect(s.hinnat[0]).toBe(45); expect(s.hinnat[1]).toBe(40);
  });
  it('sans profil du week-end → pas d’estimation (samedi)', () => expect(M.arvioPaiva(a, '2026-10-17')).toBeNull());
  it('moyenne directe prioritaire quand elle existe', () => {
    const b = { ...a, suora: { 10: { arki: { paivia: 9, hinnat: Array(96).fill(33) } } } };
    expect(M.arvioPaiva(b, '2026-10-14')!.hinnat[50]).toBe(33);
  });
  it('un jour publié l’emporte sur l’estimation', () => {
    const d: M.SpotData = { paivitetty: '', tanaan: '2026-10-14', paivat: { '2026-10-14': { lahde: 'nordpool', alku: '2026-10-13T21:00:00.000Z', hinnat: Array(96).fill(12) } }, arvio: a, kuukaudet: {}, paivakeskiarvot: [] };
    expect(M.sarja(d, '2026-10-14').tila).toBe('toteutunut');
    expect(M.sarja(d, '2026-10-15').tila).toBe('arvio');
  });
});

describe('année pörssi / kiinteä', () => {
  const vuosi = { kk: Array.from({ length: 12 }, (_, i) => `2025-${String(i + 1).padStart(2, '0')}`), spot: Array(12).fill(50) };
  const tu = M.tuote(caruna, 'yleis')!;
  const r = M.vuosikustannus({ kwh: 12000, profiili: 'tasainen', vuosi, marginaali: 0.5, kiintea: 10, perusMyyjaPorssi: 0, perusMyyjaKiintea: 0, tuote: tu, sulake: '3x25' });
  it('12 000 kWh à 50 €/MWh + 0,5 c : 12 000 × (6,275 + 0,5) / 100 = 813 €', () => expect(r.porssi).toBeCloseTo(813, 6));
  it('kiinteä 10 c : 1 200 € ; écart 387 €', () => { expect(r.kiintea).toBeCloseTo(1200, 6); expect(r.erotus).toBeCloseTo(387, 6); });
  it('transport Caruna 5,26 c : 631,20 € ; abonnement 29,71 × 12 = 356,52 € ; vero 350,145 €', () => {
    expect(r.siirto).toBeCloseTo(631.2, 6); expect(r.perusVerkko).toBeCloseTo(356.52, 6); expect(r.vero).toBeCloseTo(350.145, 6);
  });
  it('Helen aikasiirto : tehomaksu 1,97 €/kW/mois × 5 kW × 12 = 118,20 € dans l’abonnement', () => {
    const h = M.vuosikustannus({ kwh: 1000, profiili: 'tasainen', vuosi, marginaali: 0, kiintea: 0, perusMyyjaPorssi: 0, perusMyyjaKiintea: 0, tuote: M.tuote(helen, 'aika')!, sulake: '3x25', tehoKw: 5 });
    expect(h.perusVerkko).toBeCloseTo(20.46 * 12 + 118.2, 6);
  });
  it('part de jour 07–22 d’un mois uniforme = 15/24 (aika)', () => {
    const t = M.tuote(elenia, 'aika')!;
    expect(M.siirtoKuukausi(t, '2026-05')).toBeCloseTo((15 / 24) * 4.53 + (9 / 24) * 2.76, 6);
  });
  it('profil chauffage : les 12 parts Tilastokeskus somment à 1', () => expect(M.KULUTUSPROFIILI.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 3));
});

describe('jours fériés et plages propres à chaque réseau', () => {
  it('pyhäpäivät 2026 : pâques 5.4., pitkäperjantai 3.4., helatorstai 14.5., juhannuspäivä 20.6., pyhäinpäivä 31.10.', () => {
    expect(M.paasiainen(2026)).toEqual([4, 5]);
    for (const p of ['2026-01-01', '2026-01-06', '2026-04-03', '2026-04-06', '2026-05-01', '2026-05-14', '2026-06-20', '2026-10-31', '2026-12-06', '2026-12-25', '2026-12-26']) expect(M.onPyha(p)).toBe(true);
    expect(M.onPyha('2026-12-24')).toBe(false); // jouluaatto n'est pas un jour férié officiel
    expect(M.pyhanNimi('2027-01-06')).toBe('loppiainen');
    expect(M.paasiainen(2027)).toEqual([3, 28]);
  });
  const oulu = M.verkko('oulu')!, tampere = M.verkko('tampere')!;
  const loppiainen10 = utc('2026-01-06T08:00:00Z'); // mardi 6.1.2026, 10:00 à Helsinki
  it('Oulun Energia kausisähkö : talviarkipäivä « arkipäivisin » → loppiainen au tarif muu (1,95), mercredi 7.1. au tarif talvi (2,91)', () => {
    const k = M.tuote(oulu, 'kausi')!;
    expect(M.siirtoC(k, loppiainen10)).toBe(1.95);
    expect(M.siirtoC(k, utc('2026-01-07T08:00:00Z'))).toBe(2.91);
  });
  it('Tampere kausisiirto : « mukaan lukien arkipyhien päiväaika » → loppiainen au tarif talviarkipäivä (5,57)', () => {
    expect(M.siirtoC(M.tuote(tampere, 'kausi')!, loppiainen10)).toBe(5.57);
  });
  it('Oulun Energia aikasähkö : jour 07–22 (2,69), nuit (1,63)', () => {
    const a = M.tuote(oulu, 'aika')!;
    expect(M.siirtoC(a, utc('2026-10-16T05:00:00Z'))).toBe(2.69);
    expect(M.siirtoC(a, utc('2026-10-16T20:00:00Z'))).toBe(1.63);
  });
  it('part talviarkipäivä de janvier 2026 chez Oulu : 27 jours ma–la moins 2 fériés (1.1., 6.1.) = 25 × 15 h', () => {
    const k = M.tuote(oulu, 'kausi')!;
    const d = 25 * 15 / (31 * 24);
    expect(M.siirtoKuukausi(k, '2026-01')).toBeCloseTo(d * 2.91 + (1 - d) * 1.95, 6);
  });
  it('plage ma–pe et début à 6 h : un produit fictif', () => {
    const tu: M.Tuote = { tyyppi: 'kausi', nimi: 'x', perus: { kt: 1 }, energia: { talvipaiva: 9, muu: 1 }, ajat: { kuukaudet: [12, 1, 2], paivat: 'ma-pe', tunnit: [6, 21], lainaus: 'x' } };
    expect(M.siirtoC(tu, utc('2026-12-05T08:00:00Z'))).toBe(1); // samedi
    expect(M.siirtoC(tu, utc('2026-12-07T04:30:00Z'))).toBe(9); // lundi 06:30
    expect(M.siirtoC(tu, utc('2026-12-07T19:00:00Z'))).toBe(1); // lundi 21:00
    expect(M.siirtoC(tu, utc('2026-11-09T08:00:00Z'))).toBe(1); // novembre hors saison
  });
  it('Lahti : en maison (3 × 25 A) seuls les produits teho sont proposés ; en appartement les quatre', () => {
    const l = M.verkko('lahti')!;
    expect(M.tuotteetSulakkeelle(l, '3x25').map((t) => t.nimi)).toEqual(['Yleissiirto teho', 'Yösiirto teho']);
    expect(M.tuotteetSulakkeelle(l, 'kt')).toHaveLength(4);
    const t = M.tuotteetSulakkeelle(l, '3x25')[0];
    expect(M.verkkoVuosi(t, '3x25', 5000, 'tasainen', Array.from({ length: 12 }, (_, i) => `2026-${String(i + 1).padStart(2, '0')}`), 5)).toBeCloseTo(5000 * 2.95 / 100 + 7.22 * 12 + 1 * 5 * 12, 6);
  });
});

describe('données réseau', () => {
  it('chaque réseau a sa source, sa date de lecture et au moins un produit', () => {
    for (const v of M.VERKOT) { expect(v.lahde).toMatch(/^https:\/\//); expect(v.haettu).toMatch(/^\d{4}-\d{2}-\d{2}$/); expect(v.tuotteet.length).toBeGreaterThan(0); }
  });
  it('chaque produit aika / kausi porte sa plage horaire citée', () => {
    for (const v of M.VERKOT) for (const t of v.tuotteet) if (t.tyyppi !== 'yleis') expect(t.ajat?.lainaus?.length ?? 0).toBeGreaterThan(11);
  });
  it(`une page réseau seulement pour ≥ ${M.SIVU_KYNNYS} clients publiés`, () => {
    for (const v of M.VERKOT.filter((x) => x.sivu)) expect(v.asiakkaat?.maara ?? 0).toBeGreaterThanOrEqual(M.SIVU_KYNNYS);
  });
  it('ids uniques', () => expect(new Set(M.VERKOT.map((v) => v.id)).size).toBe(M.VERKOT.length));
});
