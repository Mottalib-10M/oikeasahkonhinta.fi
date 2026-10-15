/**
 * Comparaison annuelle pörssi / kiinteä et coût annuel du transport. Le spot de chaque mois est la
 * moyenne officielle de la zone FI sur les 12 derniers mois publiés ; la consommation se répartit
 * soit à parts égales, soit selon le profil mensuel national de Tilastokeskus (« sähkölämmitys »).
 * Hypothèse annoncée : au sein d'un mois, la consommation suit la moyenne simple des prix (pas de
 * déplacement vers les heures creuses, qui rendrait le contrat pörssi moins cher).
 */
import tk from '../../data/tilastokeskus.json';
import { spotC, eur } from './hinta';
import { VERO_C } from './params';
import { perusKk, type Sulake, type Tuote } from './verkot';
import { keskiyo, onPaiva, onTalvipaiva } from './aika';

export const KULUTUSPROFIILI = tk.kulutusprofiili.osuudet as number[];
export type Profiili = 'tasainen' | 'lammitys';
export const osuudet = (p: Profiili) => (p === 'tasainen' ? Array(12).fill(1 / 12) : KULUTUSPROFIILI);

export interface Vuosi { kk: string[]; spot: number[] }
/** Les 12 derniers mois complets d'une table « AAAA-MM → €/MWh ». */
export function viimeiset12(kuukaudet: Record<string, { keskiarvo: number }>, ennen: string): Vuosi {
  const kk = Object.keys(kuukaudet).filter((k) => k < ennen.slice(0, 7)).sort().slice(-12);
  return { kk, spot: kk.map((k) => kuukaudet[k].keskiarvo) };
}
/** Part jour (07–22) d'un mois pour le tarif aika, et part talvipäivä pour kausi, si la consommation est uniforme. */
const OSUUS = new Map<string, number>();
function osuusAjassa(kk: string, f: (t: number) => boolean): number {
  const key = `${kk}|${f === onPaiva ? 'p' : 't'}`;
  const c = OSUUS.get(key); if (c !== undefined) return c;
  const [y, m] = kk.split('-').map(Number);
  const a = keskiyo(`${kk}-01`), b = keskiyo(m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`);
  let n = 0, k = 0; for (let t = a; t < b; t += 900_000) { n++; if (f(t)) k++; }
  OSUUS.set(key, k / n);
  return k / n;
}
/** Siirtomaksu moyen du mois (c/kWh TVA comprise) pour une consommation uniforme dans le temps. */
export function siirtoKuukausi(tu: Tuote, kk: string): number {
  if (tu.tyyppi === 'yleis') return tu.energia.kaikki!;
  if (tu.tyyppi === 'aika') { const d = osuusAjassa(kk, onPaiva); return d * tu.energia.paiva! + (1 - d) * tu.energia.yo!; }
  const d = osuusAjassa(kk, onTalvipaiva); return d * tu.energia.talvipaiva! + (1 - d) * tu.energia.muu!;
}
export interface VuosiTulos { porssi: number; kiintea: number; siirto: number; vero: number; perusVerkko: number; perusMyyja: number; spotKa: number; erotus: number; kuukaudet: Array<{ kk: string; kwh: number; porssi: number; kiintea: number }> }
/**
 * Coût annuel (€, TVA comprise) d'une consommation `kwh` : énergie pörssi (spot + marge) et kiinteä,
 * transport, sähkövero, abonnements. `marginaali`, `kiintea` en c/kWh TVA comprise ; `perusMyyja` €/mois.
 */
export function vuosikustannus(o: { kwh: number; profiili: Profiili; vuosi: Vuosi; marginaali: number; kiintea: number; perusMyyjaPorssi: number; perusMyyjaKiintea: number; tuote: Tuote; sulake: Sulake; tehoKw?: number }): VuosiTulos {
  const os = osuudet(o.profiili);
  let porssi = 0, kiintea = 0, siirto = 0; const kuukaudet: VuosiTulos['kuukaudet'] = [];
  o.vuosi.kk.forEach((k, i) => {
    const m = Number(k.slice(5, 7)) - 1; const kwh = o.kwh * os[m];
    const p = eur(kwh, spotC(o.vuosi.spot[i]) + o.marginaali), f = eur(kwh, o.kiintea);
    porssi += p; kiintea += f; siirto += eur(kwh, siirtoKuukausi(o.tuote, k));
    kuukaudet.push({ kk: k, kwh, porssi: p, kiintea: f });
  });
  const vero = eur(o.kwh, VERO_C);
  const teho = o.tuote.teho && o.tehoKw ? o.tuote.teho.eurKwKk * o.tehoKw * 12 : 0;
  const perusVerkko = perusKk(o.tuote, o.sulake) * 12 + teho;
  const spotKa = o.vuosi.spot.reduce((s, x, i) => s + x * os[Number(o.vuosi.kk[i].slice(5, 7)) - 1], 0) / os.reduce((a, b) => a + b, 0);
  return { porssi: porssi + o.perusMyyjaPorssi * 12, kiintea: kiintea + o.perusMyyjaKiintea * 12, siirto, vero, perusVerkko, perusMyyja: o.perusMyyjaPorssi * 12, spotKa, erotus: kiintea + o.perusMyyjaKiintea * 12 - (porssi + o.perusMyyjaPorssi * 12), kuukaudet };
}
/** Coût annuel du réseau seul (transport + abonnement + éventuel tehomaksu), TVA comprise, profil donné. */
export function verkkoVuosi(tu: Tuote, sulake: Sulake, kwh: number, profiili: Profiili, kk: string[], tehoKw = 0): number {
  const os = osuudet(profiili);
  const energia = kk.reduce((s, k) => s + eur(kwh * os[Number(k.slice(5, 7)) - 1], siirtoKuukausi(tu, k)), 0);
  return energia + perusKk(tu, sulake) * 12 + (tu.teho ? tu.teho.eurKwKk * tehoKw * 12 : 0);
}
