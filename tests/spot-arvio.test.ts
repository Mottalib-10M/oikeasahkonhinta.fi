/**
 * Repli « keskihinta-arvio » : quand le prix d'un jour n'est pas publié (source en panne, licence
 * coupée, lendemain pas encore publié), le site affiche une estimation moyenne signalée comme telle.
 * Ces tests construisent les données comme l'Action (scripts/data/spot-arvio.mjs) puis les lisent
 * comme le site (moteur `sarja`).
 */
import { describe, expect, it } from 'vitest';
// @ts-expect-error module JS sans types
import { rakennaSpot } from '../scripts/data/spot-arvio.mjs';
import * as M from '../src/lib/engine/index';
import { SPOT } from '../src/lib/spot-data';

const paiva = (pvm: string, arvo: (q: number) => number) => {
  const alku = M.keskiyo(pvm), n = M.varttejaPaivassa(pvm);
  return { pvm, lahde: 'nordpool', alku: new Date(alku).toISOString(), hinnat: Array.from({ length: n }, (_, i) => arvo(i)) };
};
const paivat = (alku: string, n: number) => Array.from({ length: n }, (_, i) => M.lisaaPaivia(alku, i));
const KK = { lahde: 'Nord Pool, aggregaatit', kuukaudet: { '2025-10': 40, '2025-11': 50 } as Record<string, number> };

describe('keskihinta-arvio : construction et lecture', () => {
  it('archive suffisante (≥ 8 jours ouvrés du mois) : moyenne directe quart d’heure par quart d’heure', () => {
    const days = paivat('2026-10-01', 15).map((p) => paiva(p, (i) => (i < 48 ? 10 : 30)));
    const d = rakennaSpot({ days, kk: KK, today: '2026-10-15' }) as M.SpotData;
    expect(d.arvio.suora[10].arki.paivia).toBeGreaterThanOrEqual(8);
    const s = M.sarja(d, '2026-10-21'); // mercredi sans prix publié
    expect(s.tila).toBe('arvio');
    expect(s.menetelma).toBe('suora');
    expect(s.hinnat).toHaveLength(96);
    expect(s.hinnat[0]).toBe(10);
    expect(s.hinnat[95]).toBe(30);
  });
  it('archive courte : niveau mensuel officiel + profil horaire (« taso+profiili »)', () => {
    const days = paivat('2026-10-12', 3).map((p) => paiva(p, (i) => (i === 0 ? 20 : 10)));
    const d = rakennaSpot({ days, kk: { ...KK, kuukaudet: { ...KK.kuukaudet, '2025-11': 50 } }, today: '2026-10-15' }) as M.SpotData;
    expect(d.arvio.suora).toEqual({});
    const s = M.sarja(d, '2026-11-04'); // mercredi de novembre : niveau de novembre 2025
    expect(s.tila).toBe('arvio');
    expect(s.menetelma).toBe('taso+profiili');
    const ka = s.hinnat.reduce((a, b) => a + b, 0) / s.hinnat.length;
    expect(ka).toBeCloseTo(50, 0);
    expect(s.hinnat[0]).toBeGreaterThan(s.hinnat[1]); // le profil (premier quart plus cher) est conservé
  });
  it('jour publié : jamais remplacé par l’estimation', () => {
    const days = paivat('2026-10-01', 15).map((p) => paiva(p, () => 12));
    const d = rakennaSpot({ days, kk: KK, today: '2026-10-15' }) as M.SpotData;
    expect(M.sarja(d, '2026-10-15').tila).toBe('toteutunut');
    expect(M.sarja(d, '2026-10-16').tila).toBe('arvio');
  });
  it('changement d’heure : l’estimation du 25.10.2026 compte 100 quarts d’heure', () => {
    const days = paivat('2026-10-01', 15).map((p) => paiva(p, () => 12));
    const d = rakennaSpot({ days, kk: KK, today: '2026-10-15' }) as M.SpotData;
    const s = M.sarja(d, '2026-10-25');
    expect(s.tila).toBe('arvio');
    expect(s.hinnat).toHaveLength(100);
  });
  it('aucune archive ni agrégat : « puuttuu », aucun chiffre inventé', () => {
    const d = rakennaSpot({ days: [], kk: { lahde: '', kuukaudet: {} }, today: '2026-10-15' }) as M.SpotData;
    const s = M.sarja(d, '2026-10-16');
    expect(s.tila).toBe('puuttuu');
    expect(s.hinnat).toEqual([]);
  });
  it('données réelles du build : un jour sans prix publié donne une estimation complète et finie', () => {
    let pvm = M.lisaaPaivia(SPOT.tanaan, 1);
    while (SPOT.paivat[pvm]) pvm = M.lisaaPaivia(pvm, 1);
    const s = M.sarja(SPOT, pvm);
    expect(s.tila).toBe('arvio');
    expect(s.hinnat.length).toBe(M.varttejaPaivassa(pvm));
    expect(s.hinnat.every((x) => Number.isFinite(x))).toBe(true);
    const tu = M.tuote(M.verkko('helen')!, 'yleis')!;
    const q = M.vartit(s, tu, { tyyppi: 'porssi', marginaali: 0.5, kiintea: 0 });
    expect(q.every((x) => x.yhteensa > x.siirto + x.vero - 50)).toBe(true);
  });
  it('données réelles : sans la journée publiée (source coupée), aujourd’hui bascule sur l’estimation', () => {
    const { [SPOT.tanaan]: _pois, ...muut } = SPOT.paivat;
    const s = M.sarja({ ...SPOT, paivat: muut }, SPOT.tanaan);
    expect(s.tila).toBe('arvio');
    expect(s.hinnat.length).toBe(M.varttejaPaivassa(SPOT.tanaan));
  });
});
