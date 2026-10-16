/**
 * Comparaison du coût annuel du transport (siirto + perusmaksu, TVA comprise) entre les réseaux du
 * simulateur, pour une consommation, un profil et un calibre donnés, produit par produit.
 */
import { useMemo } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { Frame, ResultPanel, T, eur, c as cc, useParams, type L, type Row } from './kit';
import { useSpot, SULAKKEET, sulakeNimi, verkkoIndex } from './hinta-kit';
import { VERKOT, verkkoVuosi, viimeiset12, VERO_C, tuotteetSulakkeelle, tehoVerkot } from '../../lib/engine/index';
import { formatNumber } from '../../lib/format';

const TEHO = tehoVerkot().map((x) => x.lyhyt);
interface Props { lang: L; methodHref?: string; kwh?: number; profiili?: number; sulake?: number; verkko?: string }
export default function VerkotCalc({ lang, methodHref, kwh = 5000, profiili = 0, sulake = 1, verkko = 'helen' }: Props) {
  const [v, set] = useParams({ kwh, prof: profiili, sulake, teho: 5, oma: verkkoIndex(verkko) });
  const { data, tanaan } = useSpot();
  const l = lang;
  const rivit = useMemo(() => {
    const kk = viimeiset12(data.kuukaudet, `${tanaan.slice(0, 7)}-01`).kk;
    return VERKOT.map((vk, i) => {
      const tuotteet = tuotteetSulakkeelle(vk, SULAKKEET[v.sulake]).map((tu) => ({ tu, e: verkkoVuosi(tu, SULAKKEET[v.sulake], v.kwh, v.prof ? 'lammitys' : 'tasainen', kk, v.teho) }));
      const paras = tuotteet.reduce((a, b) => (b.e < a.e ? b : a));
      return { i, vk, tuotteet, paras };
    }).sort((a, b) => a.paras.e - b.paras.e);
  }, [data, tanaan, v.kwh, v.prof, v.sulake, v.teho]);
  const oma = rivit.find((x) => x.i === v.oma) ?? rivit[0];
  const sija = rivit.indexOf(oma) + 1;
  const halvin = rivit[0], kallein = rivit.at(-1)!;
  const rows: Row[] = [
    { label: T(l, `Edullisin tuote: ${oma.paras.tu.nimi}`, `Cheapest product: ${oma.paras.tu.nimi}`), value: eur(oma.paras.e, l, 0), strong: true },
    { label: T(l, 'Keskimäärin, perusmaksu mukana', 'On average, basic fee included'), value: v.kwh > 0 ? cc((oma.paras.e / v.kwh) * 100, l) : '–' },
    { label: T(l, `Sija ${rivit.length} verkon joukossa`, `Rank among ${rivit.length} networks`), value: `${sija}.` },
    { label: T(l, `Halvin: ${halvin.vk.lyhyt}`, `Cheapest: ${halvin.vk.lyhyt}`), value: eur(halvin.paras.e, l, 0) },
    { label: T(l, `Kallein: ${kallein.vk.lyhyt}`, `Dearest: ${kallein.vk.lyhyt}`), value: eur(kallein.paras.e, l, 0) },
    { label: T(l, 'Sähkövero vuodessa (sama kaikissa verkoissa)', 'Electricity tax per year (same everywhere)'), value: eur((v.kwh * VERO_C) / 100, l, 0), note: true },
  ];
  return (
    <Frame
      form={<>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <NumberField id="n-kwh" label={T(l, 'Sähkönkulutus, kWh vuodessa', 'Consumption, kWh per year')} value={v.kwh} onChange={set('kwh')} unit="kWh" max={100000} lang={l} />
          <SelectField id="n-oma" label={T(l, 'Oma verkkoyhtiösi', 'Your network operator')} value={String(v.oma)} onChange={(x) => set('oma')(Number(x))} options={VERKOT.map((x, i) => ({ value: String(i), label: x.lyhyt })).sort((a, b) => a.label.localeCompare(b.label, 'fi'))} />
        </div>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <SelectField id="n-sulake" label={T(l, 'Asunto ja pääsulake', 'Home and main fuse')} value={String(v.sulake)} onChange={(x) => set('sulake')(Number(x))} options={SULAKKEET.map((s, i) => ({ value: String(i), label: sulakeNimi(l, s) }))} />
          <Toggle id="n-prof" label={T(l, 'Kulutuksen ajoitus', 'When you use it')} value={String(v.prof)} onChange={(x) => set('prof')(Number(x))} options={[{ value: '0', label: T(l, 'Tasainen', 'Even') }, { value: '1', label: T(l, 'Talvella', 'Winter-heavy') }]} />
        </div>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <NumberField id="n-teho" label={T(l, 'Huipputeho tehomaksullisiin tuotteisiin, kW', 'Peak power for products with a power fee, kW')} value={v.teho} onChange={set('teho')} unit="kW" max={60} decimals={1} lang={l} help={T(l, `Koskee vain tehomaksullisia tuotteita (${TEHO.length} verkkoa, mm. ${TEHO.slice(0, 3).join(', ')}). Näet oman huippusi verkkoyhtiön palvelusta.`, `Only for products with a power fee (${TEHO.length} networks, incl. ${TEHO.slice(0, 3).join(', ')}). See your peak in the operator’s portal.`)} />
        </div>
      </>}
      result={<ResultPanel lang={l} head={T(l, `Siirron hinta vuodessa · ${oma.vk.lyhyt}`, `Transfer cost per year · ${oma.vk.lyhyt}`)} value={eur(oma.paras.e, l, 0)} sub={T(l, 'siirtomaksu + perusmaksu, sis. alv', 'transfer fee + basic fee, incl. VAT')} rows={rows} methodHref={methodHref}
        hyp={T(l, 'Hinnat verkkoyhtiöiden omista hinnastoista, sis. alv 25,5 %. Aika- ja kausisiirron päivä- ja talviosuus lasketaan Suomen aikaa tasaisella kulutuksella kuukauden sisällä. Sähkövero ei kuulu siirron hintaan mutta näkyy samalla laskulla.', 'Prices from each operator’s own price list, incl. 25.5% VAT. Day and winter shares of time-of-day and seasonal products use even consumption within each month, Finnish time. Electricity tax is not part of the transfer price but is on the same bill.')}
        copyText={`${oma.vk.lyhyt}: ${eur(oma.paras.e, l, 0)}`} />}
      after={<div className="mt-6 overflow-x-auto"><table className="w-full text-sm">
        <caption className="mb-2 text-left text-sm text-navy-700">{T(l, `Siirron vuosikustannus, ${formatNumber(v.kwh, 0, l)} kWh, € sis. alv`, `Annual transfer cost, ${formatNumber(v.kwh, 0, l)} kWh, € incl. VAT`)}</caption>
        <thead><tr>{[T(l, 'Verkkoyhtiö', 'Operator'), T(l, 'Yleissiirto', 'General'), T(l, 'Aika- / yösiirto', 'Time-of-day'), T(l, 'Kausisiirto', 'Seasonal')].map((h, i) => <th key={h} scope="col" className={`border-b border-navy-300 bg-navy-50 px-3 py-2 font-semibold text-navy-900 ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
        <tbody>{rivit.map((x, k) => <tr key={x.vk.id} className={x.i === v.oma ? 'bg-accent-50 font-semibold' : k % 2 ? 'bg-navy-50/40' : ''}><td className="border-b border-navy-100 px-3 py-1.5 text-navy-800">{x.vk.lyhyt}</td>
          {(['yleis', 'aika', 'kausi'] as const).map((ty) => { const p = x.tuotteet.filter((t) => t.tu.tyyppi === ty).reduce<typeof x.tuotteet[number] | undefined>((a, b) => (!a || b.e < a.e ? b : a), undefined); return <td key={ty} className={`tabular-nums border-b border-navy-100 px-3 py-1.5 text-right ${p && p === x.paras ? 'text-accent-700' : ''}`}>{p ? formatNumber(p.e, 0, l) : '–'}</td>; })}</tr>)}</tbody>
      </table></div>}
    />
  );
}
