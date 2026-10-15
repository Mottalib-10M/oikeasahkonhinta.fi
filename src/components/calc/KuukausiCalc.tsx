/**
 * Prix spot mensuels de la zone FI (archive complète, sinon moyenne officielle Nord Pool) convertis
 * en prix réel : TVA, marge ou prix fixe, transport moyen du mois pour le réseau choisi, sähkövero.
 * Calculateur de facture : la note d'un mois pour une consommation donnée.
 */
import { useMemo } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { Frame, ResultPanel, T, eur, c as cc, useParams, type L, type Row } from './kit';
import { VerkkoKentat, oletusVal, valittuTuote, useSpot, perusYhteensa, SULAKKEET } from './hinta-kit';
import { spotC, siirtoKuukausi, VERO_C, perusKk } from '../../lib/engine/index';
import { kkNimi } from './VertailuCalc';
import { formatNumber } from '../../lib/format';

interface Props { lang: L; methodHref?: string; verkko?: string; tila?: 'kuukaudet' | 'lasku' }
export default function KuukausiCalc({ lang, methodHref, verkko = 'helen', tila = 'kuukaudet' }: Props) {
  const { data, tanaan } = useSpot();
  const kuukaudet = useMemo(() => Object.keys(data.kuukaudet).filter((k) => k < tanaan.slice(0, 7)).sort(), [data, tanaan]);
  const [v, set] = useParams({ ...oletusVal(verkko), kwh: 400, kk: -1 });
  const { tuote: tu } = valittuTuote(v);
  const l = lang;
  const kki = v.kk >= 0 && v.kk < kuukaudet.length ? v.kk : kuukaudet.length - 1;
  const rivit = useMemo(() => kuukaudet.map((k) => {
    const spot = spotC(data.kuukaudet[k].keskiarvo);
    const energia = v.sop ? v.kiint : spot + v.marg;
    const siirto = siirtoKuukausi(tu, k);
    return { k, spot, energia, siirto, yhteensa: energia + siirto + VERO_C };
  }), [kuukaudet, data, v.sop, v.kiint, v.marg, tu]);
  const m = rivit[kki];
  if (!m) return null;
  const vuosi = rivit.slice(-12);
  const ka12 = vuosi.reduce((a, x) => a + x.yhteensa, 0) / vuosi.length;
  const perus = perusYhteensa(v, tu);
  const verkkoPerus = perusKk(tu, SULAKKEET[v.sulake]);
  const lasku = { energia: (v.kwh * m.energia) / 100, myyja: v.sop ? 0 : v.perusM, siirto: (v.kwh * m.siirto) / 100, verkko: verkkoPerus, vero: (v.kwh * VERO_C) / 100 };
  const summa = lasku.energia + lasku.myyja + lasku.siirto + lasku.verkko + lasku.vero;
  const lt = tila === 'lasku';
  const rows: Row[] = lt ? [
    { label: T(l, 'Energia (myyjän lasku)', 'Energy (retailer bill)'), value: eur(lasku.energia, l) },
    ...(v.sop ? [] : [{ label: T(l, 'Myyjän perusmaksu', 'Retailer monthly fee'), value: eur(lasku.myyja, l) }]),
    { label: T(l, 'Siirtomaksu (verkkoyhtiön lasku)', 'Transfer fee (network bill)'), value: eur(lasku.siirto, l) },
    { label: T(l, 'Verkon perusmaksu', 'Network basic fee'), value: eur(lasku.verkko, l) },
    { label: T(l, 'Sähkövero ja huoltovarmuusmaksu', 'Electricity tax and supply security fee'), value: eur(lasku.vero, l) },
    { label: T(l, 'Keskihinta kaikkine maksuineen', 'Average price with all fees'), value: v.kwh > 0 ? cc((summa / v.kwh) * 100, l) : '–', strong: true },
  ] : [
    { label: T(l, 'Pörssihinta sis. alv', 'Spot incl. VAT'), value: cc(m.spot, l) },
    { label: v.sop ? T(l, 'Kiinteä energian hinta', 'Fixed energy price') : T(l, 'Energia: pörssi + marginaali', 'Energy: spot + margin'), value: cc(m.energia, l) },
    { label: T(l, 'Siirtomaksu, kuukauden keskiarvo', 'Transfer fee, month average'), value: cc(m.siirto, l) },
    { label: T(l, 'Sähkövero', 'Electricity tax'), value: cc(VERO_C, l) },
    { label: T(l, '12 kuukauden keskiarvo, kaikki mukana', '12-month average, all-in'), value: cc(ka12, l), strong: true },
    { label: T(l, 'Kuukausimaksut (eivät kWh-hinnassa)', 'Monthly fees (not in the kWh price)'), value: eur(perus, l), note: true },
  ];
  const max = Math.max(...rivit.map((x) => x.yhteensa), 1);
  return (
    <Frame
      form={<>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <SelectField id="k-kk" label={T(l, 'Kuukausi', 'Month')} value={String(kki)} onChange={(x) => set('kk')(Number(x))} options={kuukaudet.map((k, i) => ({ value: String(i), label: kkNimi(k, l) }))} />
          {lt && <NumberField id="k-kwh" label={T(l, 'Kulutus kuukaudessa, kWh', 'Consumption in the month, kWh')} value={v.kwh} onChange={set('kwh')} unit="kWh" max={10000} lang={l} help={T(l, 'Laskussa tai verkkoyhtiön palvelussa.', 'On your bill or the network operator’s portal.')} />}
        </div>
        <VerkkoKentat lang={l} v={v} set={set as never} idp="k" />
      </>}
      result={<ResultPanel lang={l} head={lt ? T(l, `Sähkölasku ${kkNimi(m.k, l)}`, `Electricity bill, ${kkNimi(m.k, l)}`) : T(l, `Sähkön hinta ${kkNimi(m.k, l)}, kaikki mukana`, `Electricity price ${kkNimi(m.k, l)}, all-in`)} value={lt ? eur(summa, l) : cc(m.yhteensa, l)} rows={rows} methodHref={methodHref}
        bar={lt ? { total: summa, aria: T(l, 'Laskun osuudet', 'Bill breakdown'), segments: [{ label: T(l, 'Energia', 'Energy'), value: lasku.energia + lasku.myyja, color: '#0B5D4B' }, { label: T(l, 'Siirto', 'Transfer'), value: lasku.siirto + lasku.verkko, color: '#5fa894' }, { label: T(l, 'Vero', 'Tax'), value: lasku.vero, color: '#cbd5e1' }] } : undefined}
        hyp={T(l, 'Kuukauden pörssihinta on Suomen tarjousalueen keskihinta (oma vartti-arkisto, kun kuukausi on kokonaan siinä, muuten Nord Poolin kuukausikeskiarvo), alv 25,5 %. Todellinen pörssilasku riippuu siitä, minä tunteina sähköä käytit: kulutuksella painotettu hinta on yleensä hieman keskiarvoa korkeampi.', 'The month’s spot is the FI bidding-zone average (our quarter-hour archive when the month is complete, otherwise Nord Pool’s monthly average), plus 25.5% VAT. A real spot bill depends on when you used power: the consumption-weighted price is usually a little above the simple average.')}
        copyText={`${kkNimi(m.k, l)}: ${lt ? eur(summa, l) : cc(m.yhteensa, l)}`} />}
      after={<div className="mt-6 overflow-x-auto"><table className="w-full text-sm">
        <caption className="mb-2 text-left text-sm text-navy-700">{T(l, 'Kuukausittain, c/kWh sis. alv', 'By month, c/kWh incl. VAT')}</caption>
        <thead><tr>{[T(l, 'Kuukausi', 'Month'), T(l, 'Pörssi', 'Spot'), T(l, 'Kaikki mukana', 'All-in'), ''].map((h, i) => <th key={i} scope="col" className={`border-b border-navy-300 bg-navy-50 px-3 py-2 font-semibold text-navy-900 ${i && i < 3 ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
        <tbody>{[...rivit].reverse().map((x, i) => <tr key={x.k} className={i % 2 ? 'bg-navy-50/40' : ''}><td className="border-b border-navy-100 px-3 py-1.5 text-navy-800">{kkNimi(x.k, l)}</td><td className="tabular-nums border-b border-navy-100 px-3 py-1.5 text-right">{formatNumber(x.spot, 2, l)}</td><td className="tabular-nums border-b border-navy-100 px-3 py-1.5 text-right font-medium">{formatNumber(x.yhteensa, 2, l)}</td><td className="w-1/3 border-b border-navy-100 px-3 py-1.5"><div className="h-2.5 rounded-sm bg-accent-500" style={{ width: `${Math.max(1, (x.yhteensa / max) * 100)}%` }} /></td></tr>)}</tbody>
      </table></div>}
    />
  );
}
