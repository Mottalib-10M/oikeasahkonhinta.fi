/**
 * Pörssi vai kiinteä : coût annuel de l'énergie sur les 12 derniers mois publiés de la zone FI,
 * pour une consommation et un profil donnés, et prix fixe d'équilibre. Le transport et la taxe sont
 * identiques dans les deux cas : ils s'ajoutent au total mais ne changent pas l'écart.
 */
import { useMemo } from 'react';
import NumberField from '../ui/NumberField';
import Toggle from '../ui/Toggle';
import { Frame, ResultPanel, T, eur, c as cc, useParams, type L, type Row } from './kit';
import { VerkkoKentat, oletusVal, valittuTuote, useSpot, SULAKKEET, MARGINAALI, PERUS_MYYJA, KIINTEA } from './hinta-kit';
import { vuosikustannus, viimeiset12, spotC } from '../../lib/engine/index';
import { formatNumber } from '../../lib/format';

const KK = { fi: ['tammi', 'helmi', 'maalis', 'huhti', 'touko', 'kesä', 'heinä', 'elo', 'syys', 'loka', 'marras', 'joulu'], en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };
export const kkNimi = (k: string, l: L) => `${KK[l][Number(k.slice(5, 7)) - 1]}${l === 'fi' ? 'kuu' : ''} ${k.slice(0, 4)}`;

interface Props { lang: L; methodHref?: string; kwh?: number; profiili?: number; verkko?: string }
export default function VertailuCalc({ lang, methodHref, kwh = 5000, profiili = 0, verkko = 'helen' }: Props) {
  const [v, set] = useParams({ ...oletusVal(verkko), kwh, prof: profiili, perusK: PERUS_MYYJA });
  const { data, tanaan } = useSpot();
  const { tuote: tu } = valittuTuote(v);
  const l = lang;
  const r = useMemo(() => {
    const vuosi = viimeiset12(data.kuukaudet, `${tanaan.slice(0, 7)}-01`);
    const t = vuosikustannus({ kwh: v.kwh, profiili: v.prof ? 'lammitys' : 'tasainen', vuosi, marginaali: v.marg, kiintea: v.kiint, perusMyyjaPorssi: v.perusM, perusMyyjaKiintea: v.perusK, tuote: tu, sulake: SULAKKEET[v.sulake] });
    // Prix fixe qui donnerait le même coût annuel que le contrat pörssi (abonnements compris).
    const tasapaino = v.kwh > 0 ? ((t.porssi - v.perusK * 12) / v.kwh) * 100 : 0;
    return { vuosi, t, tasapaino };
  }, [data, tanaan, v.kwh, v.prof, v.marg, v.kiint, v.perusM, v.perusK, tu, v.sulake]);
  const { t } = r;
  const halvempi = t.erotus > 0 ? T(l, 'Pörssisähkö olisi ollut halvempi', 'Spot would have been cheaper') : T(l, 'Kiinteä olisi ollut halvempi', 'Fixed would have been cheaper');
  const jakso = r.vuosi.kk.length ? `${kkNimi(r.vuosi.kk[0], l)} – ${kkNimi(r.vuosi.kk.at(-1)!, l)}` : '';
  const rows: Row[] = [
    { label: T(l, 'Pörssisähkö: energia + perusmaksu, vuodessa', 'Spot: energy + monthly fee, per year'), value: eur(t.porssi, l, 0) },
    { label: T(l, 'Kiinteä: energia + perusmaksu, vuodessa', 'Fixed: energy + monthly fee, per year'), value: eur(t.kiintea, l, 0) },
    { label: T(l, 'Kulutuksella painotettu pörssihinta sis. alv', 'Consumption-weighted spot price incl. VAT'), value: cc(spotC(t.spotKa), l) },
    { label: T(l, 'Kiinteä hinta, jolla tulos olisi tasan', 'Fixed price that would break even'), value: cc(r.tasapaino, l), strong: true },
    { label: T(l, 'Siirto, verkon perusmaksu ja sähkövero (molemmissa samat)', 'Transfer, network fee and tax (same in both)'), value: eur(t.siirto + t.perusVerkko + t.vero, l, 0), note: true },
    { label: T(l, 'Koko sähkölasku pörssisopimuksella', 'Whole electricity bill on spot'), value: eur(t.porssi + t.siirto + t.perusVerkko + t.vero, l, 0), note: true },
  ];
  const value = eur(Math.abs(t.erotus), l, 0);
  return (
    <Frame
      form={<>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <NumberField id="v-kwh" label={T(l, 'Sähkönkulutus, kWh vuodessa', 'Consumption, kWh per year')} value={v.kwh} onChange={set('kwh')} unit="kWh" max={100000} lang={l} help={T(l, 'Laskussa tai verkkoyhtiön palvelussa. Kerrostalo noin 2 000, omakotitalo 5 000, sähkölämmitys 18 000.', 'On your bill or in the network operator’s portal. Flat about 2,000, house 5,000, electric heating 18,000.')} />
          <Toggle id="v-prof" label={T(l, 'Kulutuksen ajoitus', 'When you use it')} value={String(v.prof)} onChange={(x) => set('prof')(Number(x))} options={[{ value: '0', label: T(l, 'Tasainen', 'Even') }, { value: '1', label: T(l, 'Talvella', 'Winter-heavy') }]} />
        </div>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <NumberField id="v-marg" label={T(l, 'Pörssisähkön marginaali, c/kWh', 'Spot margin, c/kWh')} value={v.marg} onChange={set('marg')} unit="c" max={10} decimals={2} lang={l} help={T(l, `Oletus ${formatNumber(MARGINAALI, 2, l)} c (Energiaviraston hintavertailun mediaani).`, `Default ${formatNumber(MARGINAALI, 2, l)} c (Energy Authority comparison median).`)} />
          <NumberField id="v-perusm" label={T(l, 'Pörssisopimuksen perusmaksu, €/kk', 'Spot contract monthly fee, €')} value={v.perusM} onChange={set('perusM')} unit="€" max={50} decimals={2} lang={l} />
        </div>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <NumberField id="v-kiint" label={T(l, 'Kiinteä energian hinta, c/kWh', 'Fixed energy price, c/kWh')} value={v.kiint} onChange={set('kiint')} unit="c" max={60} decimals={2} lang={l} help={T(l, `Oletus ${formatNumber(KIINTEA, 2, l)} c (Tilastokeskus, kotitalouksien keskihinta).`, `Default ${formatNumber(KIINTEA, 2, l)} c (Statistics Finland household average).`)} />
          <NumberField id="v-perusk" label={T(l, 'Kiinteän sopimuksen perusmaksu, €/kk', 'Fixed contract monthly fee, €')} value={v.perusK} onChange={set('perusK')} unit="€" max={50} decimals={2} lang={l} />
        </div>
        <VerkkoKentat lang={l} v={v} set={set as never} idp="v" sopimusKentat={false} />
      </>}
      result={<ResultPanel lang={l} head={`${halvempi} · ${jakso}`} value={value} sub={T(l, 'ero vuodessa, sis. alv', 'difference per year, incl. VAT')} rows={rows} methodHref={methodHref}
        hyp={T(l, 'Pörssihinta = Suomen tarjousalueen kuukauden keskihinta viimeiseltä 12 julkaistulta kuukaudelta (Nord Pool), alv 25,5 %. Talvipainotteinen jakaa kulutuksen kuukausille Tilastokeskuksen valtakunnallisen sähkönkulutuksen mukaan. Kuukauden sisällä kulutus oletetaan tasaiseksi: kulutuksen siirto halpoihin tunteihin parantaisi pörssisopimuksen tulosta.', 'Spot = FI bidding-zone monthly average over the last 12 published months (Nord Pool), plus 25.5% VAT. Winter-heavy spreads use across months like Statistics Finland’s national consumption. Within a month use is assumed even: shifting it to cheap hours would improve the spot result.')}
        copyText={`${halvempi}: ${value}`} />}
      after={<div className="mt-6 overflow-x-auto"><table className="w-full text-sm">
        <caption className="mb-2 text-left text-sm text-navy-700">{T(l, 'Energian hinta kuukausittain, € sis. alv (ilman perusmaksuja)', 'Energy cost by month, € incl. VAT (excluding monthly fees)')}</caption>
        <thead><tr>{[T(l, 'Kuukausi', 'Month'), 'kWh', T(l, 'Pörssihinta c/kWh', 'Spot c/kWh'), T(l, 'Pörssi €', 'Spot €'), T(l, 'Kiinteä €', 'Fixed €')].map((h, i) => <th key={h} scope="col" className={`border-b border-navy-300 bg-navy-50 px-3 py-2 font-semibold text-navy-900 ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
        <tbody>{t.kuukaudet.map((m, i) => <tr key={m.kk} className={i % 2 ? 'bg-navy-50/40' : ''}><td className="border-b border-navy-100 px-3 py-1.5 text-navy-800">{kkNimi(m.kk, l)}</td><td className="tabular-nums border-b border-navy-100 px-3 py-1.5 text-right">{formatNumber(m.kwh, 0, l)}</td><td className="tabular-nums border-b border-navy-100 px-3 py-1.5 text-right">{formatNumber(spotC(r.vuosi.spot[i]), 2, l)}</td><td className="tabular-nums border-b border-navy-100 px-3 py-1.5 text-right">{formatNumber(m.porssi, 2, l)}</td><td className="tabular-nums border-b border-navy-100 px-3 py-1.5 text-right">{formatNumber(m.kiintea, 2, l)}</td></tr>)}</tbody>
      </table></div>}
    />
  );
}
