/**
 * Calculateur principal : prix réel de l'électricité par quart d'heure, aujourd'hui ou demain,
 * avec le transport du réseau local, la sähkövero et la TVA. Premier rendu = données du build et
 * valeurs par défaut ; l'heure courante, la date et le lien partagé sont appliqués après montage.
 */
import { useMemo } from 'react';
import NumberField from '../ui/NumberField';
import Toggle from '../ui/Toggle';
import Kayra from './Kayra';
import { Frame, ResultPanel, T, eur, c as cc, useParams, type L, type Row } from './kit';
import { VerkkoKentat, oletusVal, valittuTuote, sopimus, perusYhteensa, useSpot, usePaiva, Tila } from './hinta-kit';
import { vartit, tilasto, halvinIkkuna, tunneittain } from '../../lib/engine/spot';
import { kello } from '../../lib/engine/aika';
import { VERKOT } from '../../lib/engine/verkot';
import { formatNumber, displayDate } from '../../lib/format';

interface Props { lang: L; methodHref?: string; verkko?: string; tuote?: number; sulake?: number; paiva?: number }

export default function HintaCalc({ lang, methodHref, verkko = 'helen', tuote = 0, sulake = 0, paiva = 0 }: Props) {
  const [v, set] = useParams({ ...oletusVal(verkko, tuote, sulake), paiva, kesto: 2 });
  const { data, tanaan, nyt } = useSpot();
  const s = usePaiva(data, tanaan, v.paiva);
  const { tuote: tu } = valittuTuote(v);
  const sop = sopimus(v);
  const r = useMemo(() => {
    const q = vartit(s, tu, sop);
    const tot = q.map((x) => x.yhteensa);
    const st = tilasto(tot);
    const n = Math.max(1, Math.round(v.kesto * 4));
    const nytI = nyt !== null && !v.paiva ? q.findIndex((x) => nyt >= x.t && nyt < x.t + 900_000) : -1;
    // Fenêtre : aujourd'hui, à partir du quart d'heure en cours (on ne peut plus démarrer dans le passé).
    const ik = halvinIkkuna(tot, n, nytI > 0 ? nytI : 0);
    return { q, tot, st, n, nytI, ik };
  }, [s, tu, sop.tyyppi, sop.marginaali, sop.kiintea, v.kesto, v.paiva, nyt]);
  const l = lang;
  const ref = r.nytI >= 0 ? r.q[r.nytI] : null;
  const ka = (k: 'spot' | 'siirto' | 'vero' | 'energia') => (r.q.length ? r.q.reduce((a, x) => a + x[k], 0) / r.q.length : 0);
  const pvm = displayDate(s.pvm, l === 'en' ? 'en-GB' : 'fi-FI');
  const rows: Row[] = r.q.length ? [
    { label: T(l, 'Pörssihinta sis. alv', 'Spot price incl. VAT'), value: cc(ref ? ref.spot : ka('spot'), l) },
    ...(v.sop ? [{ label: T(l, 'Kiinteä energian hinta', 'Fixed energy price'), value: cc(v.kiint, l) }] : [{ label: T(l, 'Myyjän marginaali', 'Retailer margin'), value: cc(v.marg, l) }]),
    { label: T(l, 'Siirtomaksu', 'Transfer fee'), value: cc(ref ? ref.siirto : ka('siirto'), l) },
    { label: T(l, 'Sähkövero ja huoltovarmuusmaksu', 'Electricity tax and supply security fee'), value: cc(ref ? ref.vero : ka('vero'), l) },
    { label: ref ? T(l, `Yhteensä nyt (${kello(ref.t)})`, `Total now (${kello(ref.t)})`) : T(l, 'Yhteensä, päivän keskiarvo', 'Total, day average'), value: cc(ref ? ref.yhteensa : r.st.ka, l), strong: true },
    { label: T(l, `Halvin vartti ${kello(r.q[r.st.minI].t)}`, `Cheapest quarter ${kello(r.q[r.st.minI].t)}`), value: cc(r.st.min, l) },
    { label: T(l, `Kallein vartti ${kello(r.q[r.st.maxI].t)}`, `Dearest quarter ${kello(r.q[r.st.maxI].t)}`), value: cc(r.st.max, l) },
    ...(r.ik.i >= 0 ? [{ label: T(l, `Halvin ${formatNumber(v.kesto, 2, l)} h jakso alkaa ${kello(r.q[r.ik.i].t)}`, `Cheapest ${formatNumber(v.kesto, 2, l)} h window starts ${kello(r.q[r.ik.i].t)}`), value: cc(r.ik.ka, l) }] : []),
    { label: T(l, 'Kuukausimaksut: verkko + myyjä', 'Monthly fees: network + retailer'), value: eur(perusYhteensa(v, tu), l), note: true },
  ] : [];
  const head = ref ? T(l, `Sähkön hinta nyt, kaikki mukana · ${VERKOT[v.verkko]?.lyhyt ?? T(l, 'oma verkko', 'own network')}`, `Electricity price now, all-in · ${VERKOT[v.verkko]?.lyhyt ?? 'own network'}`) : T(l, `Keskihinta ${pvm}, kaikki mukana · ${VERKOT[v.verkko]?.lyhyt ?? 'oma verkko'}`, `Average price ${pvm}, all-in · ${VERKOT[v.verkko]?.lyhyt ?? 'own network'}`);
  const value = r.q.length ? cc(ref ? ref.yhteensa : r.st.ka, l) : '–';
  const sub = r.q.length ? T(l, `päivän vaihteluväli ${formatNumber(r.st.min, 2, l)}–${formatNumber(r.st.max, 2, l)} c/kWh`, `range today ${formatNumber(r.st.min, 2, l)}–${formatNumber(r.st.max, 2, l)} c/kWh`) : undefined;
  const tunnit = tunneittain(r.tot);
  const spotT = tunneittain(r.q.map((x) => x.spot));
  return (
    <Frame
      form={<>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <Toggle id="h-paiva" label={T(l, 'Päivä', 'Day')} value={String(v.paiva)} onChange={(x) => set('paiva')(Number(x))} options={[{ value: '0', label: T(l, 'Tänään', 'Today') }, { value: '1', label: T(l, 'Huomenna', 'Tomorrow') }]} />
          <NumberField id="h-kesto" label={T(l, 'Halvin jakso, tuntia', 'Cheapest window, hours')} value={v.kesto} onChange={set('kesto')} unit="h" max={24} decimals={2} lang={l} />
        </div>
        <VerkkoKentat lang={l} v={v} set={set as never} idp="h" />
      </>}
      result={<ResultPanel lang={l} head={head} value={value} sub={sub} rows={rows} methodHref={methodHref}
        hyp={T(l, 'Pörssihinta on Suomen tarjousalueen day-ahead-hinta vartille, alv 25,5 % lisättynä (myös negatiiviseen hintaan). Siirtomaksu on verkkoyhtiön hinnaston mukainen; aika- ja kausisiirron jaksot ja arkipyhien käsittely yhtiön hinnaston sanamuodon mukaan, Suomen aikaa. Sähkövero luokka I. Kuukausimaksut eivät sisälly kWh-hintaan.', 'Spot is the FI bidding-zone day-ahead price for the quarter, plus 25.5% VAT (also on negative prices). Transfer fee per the operator’s price list; time-of-day and seasonal windows, and how public holidays count, as worded in the operator’s price list, Finnish time. Electricity tax class I. Monthly fees are not in the per-kWh price.')}
        copyText={`${head}: ${value}`}>
        <Tila s={s} data={data} lang={l} />
      </ResultPanel>}
      after={r.q.length ? <>
        <Kayra v={r.q} lang={l} nytI={r.nytI} ikkuna={{ i: r.ik.i, n: r.n }} aria={T(l, `Sähkön kokonaishinta varteittain ${pvm}`, `All-in electricity price by quarter hour, ${pvm}`)} />
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="mb-2 text-left text-sm text-navy-700">{T(l, `Tuntikeskiarvot ${pvm}, c/kWh sis. alv`, `Hourly averages ${pvm}, c/kWh incl. VAT`)}</caption>
            <thead><tr>{[T(l, 'Tunti', 'Hour'), T(l, 'Pörssihinta', 'Spot'), T(l, 'Kokonaishinta', 'All-in price')].map((h, i) => <th key={h} scope="col" className={`border-b border-navy-300 bg-navy-50 px-3 py-2 font-semibold text-navy-900 ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
            <tbody>{tunnit.map((x, h) => <tr key={h} className={h % 2 ? 'bg-navy-50/40' : ''}><td className="border-b border-navy-100 px-3 py-1.5 text-navy-800">{kello(r.q[h * 4]?.t ?? 0)}</td><td className="tabular-nums border-b border-navy-100 px-3 py-1.5 text-right text-navy-800">{formatNumber(spotT[h], 2, l)}</td><td className="tabular-nums border-b border-navy-100 px-3 py-1.5 text-right font-medium text-navy-900">{formatNumber(x, 2, l)}</td></tr>)}</tbody>
          </table>
        </div>
      </> : null}
    />
  );
}
