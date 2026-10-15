/**
 * Coût d'un usage (sauna, voiture électrique, lave-linge, sèche-linge) au prix réel du quart d'heure :
 * départ le moins cher et le plus cher de la journée, départ maintenant, et coût annuel à la moyenne.
 */
import { useMemo } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import Kayra from './Kayra';
import { Frame, ResultPanel, T, eur, c as cc, useParams, type L, type Row } from './kit';
import { VerkkoKentat, oletusVal, valittuTuote, sopimus, useSpot, usePaiva, Tila } from './hinta-kit';
import { vartit, halvinIkkuna, tilasto } from '../../lib/engine/spot';
import { kello } from '../../lib/engine/aika';
import { P } from '../../lib/engine/params';
import { formatNumber } from '../../lib/format';

export const LAITTEET = ['sauna', 'auto', 'pesukone', 'kuivausrumpu'] as const;
type Laite = (typeof LAITTEET)[number];
const A = P.laitteet;
const VIIKKO: Record<Laite, number> = { sauna: 2, auto: 2, pesukone: 4, kuivausrumpu: 3 };

/** Énergie (kWh) et durée (h) d'un usage selon l'appareil. */
export function kaytto(laite: Laite, kw: number, kwh: number, h: number) {
  if (laite === 'sauna') return { E: kw * h, D: h };
  if (laite === 'auto') return { E: kwh, D: kw > 0 ? kwh / kw : 0 };
  return { E: kwh, D: h };
}
/** Coût (€) d'un usage commençant au créneau i : énergie répartie également sur n créneaux. */
export const kerranHinta = (tot: number[], i: number, n: number, E: number) => { let s = 0; for (let k = i; k < i + n; k++) s += tot[k]; return (E / n) * s / 100; };

interface Props { lang: L; methodHref?: string; laite?: string; verkko?: string; tuote?: number }
export default function LaiteCalc({ lang, methodHref, laite = 'sauna', verkko = 'helen', tuote = 0 }: Props) {
  const li = Math.max(0, LAITTEET.indexOf(laite as Laite));
  const d = A[LAITTEET[li]] as { kw?: number; kwh?: number; h?: number };
  const [v, set] = useParams({ ...oletusVal(verkko, tuote), paiva: 0, laite: li, kw: d.kw ?? 6, kwh: d.kwh ?? (d.kw ?? 6) * (d.h ?? 1), h: d.h ?? 1.5, viikko: VIIKKO[LAITTEET[li]] });
  const { data, tanaan, nyt } = useSpot();
  const s = usePaiva(data, tanaan, v.paiva);
  const { tuote: tu } = valittuTuote(v);
  const sop = sopimus(v);
  const lt = LAITTEET[v.laite] ?? 'sauna';
  const { E, D } = kaytto(lt, v.kw, v.kwh, v.h);
  const r = useMemo(() => {
    const q = vartit(s, tu, sop);
    const tot = q.map((x) => x.yhteensa);
    const n = Math.max(1, Math.ceil(D * 4 - 1e-9));
    const nytI = nyt !== null && !v.paiva ? q.findIndex((x) => nyt >= x.t && nyt < x.t + 900_000) : -1;
    const alku = nytI > 0 ? nytI : 0;
    const ik = halvinIkkuna(tot, n, alku);
    let maxI = -1, maxS = -Infinity;
    for (let i = alku; i + n <= tot.length; i++) { const x = kerranHinta(tot, i, n, E); if (x > maxS) { maxS = x; maxI = i; } }
    return { q, tot, n, nytI, ik, maxI, ka: tilasto(tot).ka };
  }, [s, tu, sop.tyyppi, sop.marginaali, sop.kiintea, E, D, nyt, v.paiva]);
  const l = lang;
  const nimi = (x: Laite) => (l === 'en' ? A[x].nimi_en : A[x].nimi_fi);
  const halvin = r.ik.i >= 0 ? kerranHinta(r.tot, r.ik.i, r.n, E) : 0;
  const kallein = r.maxI >= 0 ? kerranHinta(r.tot, r.maxI, r.n, E) : 0;
  const nytHinta = r.nytI >= 0 && r.nytI + r.n <= r.tot.length ? kerranHinta(r.tot, r.nytI, r.n, E) : null;
  const keski = (E * r.ka) / 100;
  const rows: Row[] = r.q.length && r.ik.i >= 0 ? [
    { label: T(l, `Halvin aloitus ${kello(r.q[r.ik.i].t)}`, `Cheapest start ${kello(r.q[r.ik.i].t)}`), value: eur(halvin, l), strong: true },
    ...(r.maxI >= 0 ? [{ label: T(l, `Kallein aloitus ${kello(r.q[r.maxI].t)}`, `Dearest start ${kello(r.q[r.maxI].t)}`), value: eur(kallein, l) }] : []),
    ...(nytHinta !== null ? [{ label: T(l, `Aloitus nyt ${kello(r.q[r.nytI].t)}`, `Start now ${kello(r.q[r.nytI].t)}`), value: eur(nytHinta, l) }] : []),
    { label: T(l, 'Päivän keskihinnalla', 'At the day’s average price'), value: eur(keski, l) },
    { label: T(l, `Vuodessa, ${formatNumber(v.viikko, 0, l)} kertaa viikossa keskihinnalla`, `Per year, ${formatNumber(v.viikko, 0, l)} times a week at average price`), value: eur(keski * v.viikko * 52, l, 0) },
  ] : [];
  const head = T(l, `${nimi(lt)}: halvin kerta ${r.q.length ? (v.paiva ? 'huomenna' : 'tänään') : ''}`, `${nimi(lt)}: cheapest run ${v.paiva ? 'tomorrow' : 'today'}`);
  const value = rows.length ? eur(halvin, l) : '–';
  return (
    <Frame
      form={<>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <SelectField id="l-laite" label={T(l, 'Laite', 'Appliance')} value={String(v.laite)} onChange={(x) => { const k = LAITTEET[Number(x)]; const dd = A[k] as { kw?: number; kwh?: number; h?: number }; set('laite')(Number(x)); if (dd.kw) set('kw')(dd.kw); if (dd.kwh) set('kwh')(dd.kwh); if (dd.h) set('h')(dd.h); set('viikko')(VIIKKO[k]); }} options={LAITTEET.map((x, i) => ({ value: String(i), label: nimi(x) }))} />
          <Toggle id="l-paiva" label={T(l, 'Päivä', 'Day')} value={String(v.paiva)} onChange={(x) => set('paiva')(Number(x))} options={[{ value: '0', label: T(l, 'Tänään', 'Today') }, { value: '1', label: T(l, 'Huomenna', 'Tomorrow') }]} />
        </div>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          {lt === 'sauna' && <NumberField id="l-kw" label={T(l, 'Kiukaan teho, kW', 'Stove power, kW')} value={v.kw} onChange={set('kw')} unit="kW" max={30} decimals={1} lang={l} help={l === 'en' ? A.sauna.apu_en : A.sauna.apu_fi} />}
          {lt === 'sauna' && <NumberField id="l-h" label={T(l, 'Lämmitys ja saunominen, h', 'Heating and bathing, h')} value={v.h} onChange={set('h')} unit="h" max={8} decimals={2} lang={l} />}
          {lt === 'auto' && <NumberField id="l-kwh" label={T(l, 'Ladattava energia, kWh', 'Energy to charge, kWh')} value={v.kwh} onChange={set('kwh')} unit="kWh" max={200} decimals={1} lang={l} help={A.auto[l === 'en' ? 'apu_en' : 'apu_fi']} />}
          {lt === 'auto' && <NumberField id="l-kw" label={T(l, 'Latausteho, kW', 'Charging power, kW')} value={v.kw} onChange={set('kw')} unit="kW" max={50} decimals={1} lang={l} />}
          {(lt === 'pesukone' || lt === 'kuivausrumpu') && <NumberField id="l-kwh" label={T(l, 'Kulutus kerralta, kWh', 'Energy per cycle, kWh')} value={v.kwh} onChange={set('kwh')} unit="kWh" max={10} decimals={2} lang={l} help={(A[lt] as { apu_fi: string; apu_en: string })[l === 'en' ? 'apu_en' : 'apu_fi']} />}
          {(lt === 'pesukone' || lt === 'kuivausrumpu') && <NumberField id="l-h" label={T(l, 'Ohjelman kesto, h', 'Programme length, h')} value={v.h} onChange={set('h')} unit="h" max={8} decimals={2} lang={l} />}
        </div>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <NumberField id="l-viikko" label={T(l, 'Kertaa viikossa', 'Times a week')} value={v.viikko} onChange={set('viikko')} max={21} lang={l} />
        </div>
        <VerkkoKentat lang={l} v={v} set={set as never} idp="l" />
      </>}
      result={<ResultPanel lang={l} head={head} value={value} sub={T(l, `${formatNumber(E, 2, l)} kWh, kesto ${formatNumber(D, 2, l)} h`, `${formatNumber(E, 2, l)} kWh over ${formatNumber(D, 2, l)} h`)} rows={rows} methodHref={methodHref}
        hyp={T(l, 'Energia jaetaan tasan käytön varteille. Hinta = pörssihinta + marginaali (tai kiinteä hinta) + siirtomaksu + sähkövero, kaikki sis. alv 25,5 %. Todellinen kulutus vaihtelee laitteen, ohjelman ja lämpötilan mukaan.', 'Energy is spread evenly over the quarters of the run. Price = spot + margin (or fixed price) + transfer fee + electricity tax, all incl. 25.5% VAT. Real use varies with the appliance, programme and temperature.')}
        copyText={`${head}: ${value}`}>
        <Tila s={s} data={data} lang={l} />
      </ResultPanel>}
      after={r.q.length ? <Kayra v={r.q} lang={l} nytI={r.nytI} ikkuna={{ i: r.ik.i, n: r.n }} aria={T(l, 'Kokonaishinta varteittain ja halvin aloitus', 'All-in price by quarter and cheapest start')} /> : null}
    />
  );
}
