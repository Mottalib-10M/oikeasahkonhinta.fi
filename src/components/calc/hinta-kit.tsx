/**
 * Briques communes aux calculateurs : données spot (build puis /data/spot.json relu au montage),
 * choix du réseau local (postinumero → verkkoyhtiö, liste Energiavirasto), du produit de transport,
 * du calibre et du contrat (pörssi + marge ou kiinteä). Premier rendu = données et valeurs du build
 * (RECETTE §17.5) ; la date du jour, l'heure courante et l'URL partagée ne sont lues qu'après montage.
 */
import { useEffect, useMemo, useState } from 'react';
import SelectField from '../ui/SelectField';
import NumberField from '../ui/NumberField';
import Toggle from '../ui/Toggle';
import { SPOT } from '../../lib/spot-data';
import { VERKOT, tuote as tuoteOf, omaTuote, perusKk, type Tuote, type Sulake, type Tyyppi } from '../../lib/engine/verkot';
import { hkiPvm, lisaaPaivia } from '../../lib/engine/aika';
import { sarja, type SpotData, type Sarja } from '../../lib/engine/spot';
import { formatNumber, displayDate } from '../../lib/format';
import sop from '../../data/sopimukset.json';
import tk from '../../data/tilastokeskus.json';
import { P } from '../../lib/engine/params';
import { T, type L } from './kit';

export const MUU = VERKOT.length; // index de « autre réseau »
export const TYYPIT: Tyyppi[] = ['yleis', 'aika', 'kausi'];
export const SULAKKEET: Sulake[] = ['kt', '3x25', '3x35'];
export const MARGINAALI = sop.marginaaliMediaani ?? 0;
export const PERUS_MYYJA = sop.perusmaksuMediaani ?? 0;
const tkViim = tk.kotitalousD.kuukaudet.at(-1)!;
/** Valeur par défaut du prix fixe : prix moyen de l'énergie d'un ménage 5 000–15 000 kWh (Tilastokeskus), TVA comprise. */
export const KIINTEA = Math.round(tkViim.energiaVeroton * (1 + P.vero.alv) * 100) / 100;
export const KIINTEA_KK = tkViim.kk;
export const verkkoIndex = (id: string) => Math.max(0, VERKOT.findIndex((v) => v.id === id));

/** Données spot : celles du build au premier rendu, puis la version publiée la plus récente. */
export function useSpot() {
  const [data, setData] = useState<SpotData>(SPOT);
  const [tanaan, setTanaan] = useState(SPOT.tanaan);
  const [nyt, setNyt] = useState<number | null>(null);
  useEffect(() => {
    setTanaan(hkiPvm(Date.now())); setNyt(Date.now());
    fetch('/data/spot.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).then((j) => { if (j && j.paivat) setData(j); }).catch(() => {});
    const id = setInterval(() => { setNyt(Date.now()); setTanaan(hkiPvm(Date.now())); }, 60_000);
    return () => clearInterval(id);
  }, []);
  return { data, tanaan, nyt, huomenna: lisaaPaivia(tanaan, 1) };
}

export interface Val { verkko: number; tuote: number; sulake: number; sop: number; marg: number; kiint: number; perusM: number; omaC: number; omaKk: number }
/** Produit de transport choisi (ou saisi pour « autre réseau »). */
export function valittuTuote(v: Val): { tuote: Tuote; tyypit: Tyyppi[] } {
  if (v.verkko >= MUU) return { tuote: omaTuote(v.omaC, v.omaKk), tyypit: ['yleis'] };
  const vk = VERKOT[v.verkko] ?? VERKOT[0];
  const tyypit = TYYPIT.filter((t) => tuoteOf(vk, t));
  const t = tuoteOf(vk, tyypit[Math.min(v.tuote, tyypit.length - 1)] ?? 'yleis')!;
  return { tuote: t, tyypit };
}
export const sopimus = (v: Val) => ({ tyyppi: (v.sop ? 'kiintea' : 'porssi') as 'porssi' | 'kiintea', marginaali: v.marg, kiintea: v.kiint });
export const perusYhteensa = (v: Val, t: Tuote) => perusKk(t, SULAKKEET[v.sulake] ?? 'kt') + (v.sop ? 0 : v.perusM);

export const tyyppiNimi = (l: L, t: Tyyppi, nimi?: string) => nimi ?? T(l, { yleis: 'Yleissiirto', aika: 'Aikasiirto (yö halvempi)', kausi: 'Kausisiirto (talviarki kalliimpi)' }[t], { yleis: 'General transfer', aika: 'Time-of-day (cheaper nights)', kausi: 'Seasonal (winter weekdays dearer)' }[t]);
export const sulakeNimi = (l: L, s: Sulake) => T(l, { kt: 'Kerrostalo tai 1-vaiheinen', '1x25': '1 × 25 A', '3x25': 'Omakotitalo 3 × 25 A', '3x35': 'Omakotitalo 3 × 35 A' }[s], { kt: 'Flat or single-phase', '1x25': '1 × 25 A', '3x25': 'House, 3 × 25 A', '3x35': 'House, 3 × 35 A' }[s]);

/** Recherche du réseau par code postal (fichier public/data/postinumerot.json, chargé à la demande). */
type PN = { yhtiot: Array<[string, string | null]>; postinumerot: Record<string, number[]> };
let pnCache: Promise<PN> | null = null;
function PostinumeroHaku({ lang, idp, onVerkko }: { lang: L; idp: string; onVerkko: (i: number) => void }) {
  const [pn, setPn] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (!/^\d{5}$/.test(pn)) { setMsg(''); return; }
    (pnCache ??= fetch('/data/postinumerot.json').then((r) => r.json())).then((d) => {
      const ids = d.postinumerot[pn];
      if (!ids) { setMsg(T(lang, 'Postinumeroa ei löytynyt Energiaviraston luettelosta.', 'Postcode not found in the Energy Authority list.')); return; }
      const nimet = ids.map((i) => d.yhtiot[i]);
      const ok = nimet.find((n) => n[1]);
      if (ok) onVerkko(verkkoIndex(ok[1]!));
      else onVerkko(MUU);
      const lista = nimet.map((n) => n[0]).join(', ');
      setMsg(ok ? T(lang, `Alueen verkkoyhtiö: ${lista}.`, `Network operator for this area: ${lista}.`) : T(lang, `Alueen verkkoyhtiö: ${lista}. Sitä ei ole vielä laskurissa: syötä siirtomaksu laskustasi.`, `Network operator: ${lista}. Not yet in the calculator: enter the transfer fee from your bill.`));
    }).catch(() => setMsg(''));
  }, [pn]);
  return (
    <div className="grid grid-rows-subgrid row-span-3 content-start gap-y-0">
      <label htmlFor={`${idp}-pn`} className="mb-1 block text-sm font-medium text-navy-700">{T(lang, 'Postinumero (valinnainen)', 'Postcode (optional)')}</label>
      <input id={`${idp}-pn`} inputMode="numeric" autoComplete="postal-code" maxLength={5} value={pn} onChange={(e) => setPn(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="00100"
        className="h-12 w-full rounded-lg border border-navy-300 bg-white px-3 text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20" />
      <p id={`${idp}-pn-help`} className="mt-1 text-xs text-navy-600" aria-live="polite">{msg || T(lang, 'Hakee verkkoyhtiön Energiaviraston postinumeroluettelosta.', 'Finds your network operator from the Energy Authority postcode list.')}</p>
    </div>
  );
}

interface FProps { lang: L; v: Val; set: (k: keyof Val) => (x: number) => void; idp: string; sopimusKentat?: boolean; sulakeKentta?: boolean }
/** Réseau, produit, calibre, puis contrat. */
export function VerkkoKentat({ lang, v, set, idp, sopimusKentat = true, sulakeKentta = true }: FProps) {
  const { tyypit } = valittuTuote(v);
  const vk = VERKOT[v.verkko];
  const verkot = [...VERKOT.map((x, i) => ({ value: String(i), label: x.lyhyt })), { value: String(MUU), label: T(lang, 'Muu verkkoyhtiö (syötän hinnan)', 'Other operator (enter price)') }];
  return (
    <>
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <PostinumeroHaku lang={lang} idp={idp} onVerkko={(i) => set('verkko')(i)} />
        <SelectField id={`${idp}-verkko`} label={T(lang, 'Verkkoyhtiö', 'Network operator')} value={String(v.verkko)} onChange={(x) => { set('verkko')(Number(x)); set('tuote')(0); }} options={verkot} />
      </div>
      {v.verkko >= MUU ? (
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <NumberField id={`${idp}-omac`} label={T(lang, 'Siirtomaksu, c/kWh sis. alv', 'Transfer fee, c/kWh incl. VAT')} value={v.omaC} onChange={set('omaC')} unit="c" max={30} decimals={2} lang={lang} />
          <NumberField id={`${idp}-omakk`} label={T(lang, 'Verkon perusmaksu, €/kk', 'Network basic fee, €/month')} value={v.omaKk} onChange={set('omaKk')} unit="€" max={500} decimals={2} lang={lang} />
        </div>
      ) : (
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <SelectField id={`${idp}-tuote`} label={T(lang, 'Siirtotuote', 'Transfer product')} value={String(Math.min(v.tuote, tyypit.length - 1))} onChange={(x) => set('tuote')(Number(x))} options={tyypit.map((t, i) => ({ value: String(i), label: tuoteOf(vk, t)!.nimi }))} />
          {sulakeKentta && <SelectField id={`${idp}-sulake`} label={T(lang, 'Asunto ja pääsulake', 'Home and main fuse')} value={String(v.sulake)} onChange={(x) => set('sulake')(Number(x))} options={SULAKKEET.map((s, i) => ({ value: String(i), label: sulakeNimi(lang, s) }))} />}
        </div>
      )}
      {sopimusKentat && <SopimusKentat lang={lang} v={v} set={set} idp={idp} />}
    </>
  );
}

export function SopimusKentat({ lang, v, set, idp }: FProps) {
  return (
    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
      <Toggle id={`${idp}-sop`} label={T(lang, 'Sähkösopimus', 'Electricity contract')} value={String(v.sop)} onChange={(x) => set('sop')(Number(x))} options={[{ value: '0', label: T(lang, 'Pörssisähkö', 'Spot') }, { value: '1', label: T(lang, 'Kiinteä', 'Fixed') }]} />
      {v.sop === 0
        ? <NumberField id={`${idp}-marg`} label={T(lang, 'Myyjän marginaali, c/kWh sis. alv', 'Retailer margin, c/kWh incl. VAT')} value={v.marg} onChange={set('marg')} unit="c" max={10} decimals={2} lang={lang}
            help={T(lang, `Sopimuksessasi. Oletus ${formatNumber(MARGINAALI, 2, lang)} c: Energiaviraston hintavertailun kuluttajien pörssisopimusten mediaani.`, `In your contract. Default ${formatNumber(MARGINAALI, 2, lang)} c: median of consumer spot contracts in the Energy Authority comparison.`)} />
        : <NumberField id={`${idp}-kiint`} label={T(lang, 'Kiinteä energian hinta, c/kWh sis. alv', 'Fixed energy price, c/kWh incl. VAT')} value={v.kiint} onChange={set('kiint')} unit="c" max={60} decimals={2} lang={lang}
            help={T(lang, `Sopimuksessasi. Oletus ${formatNumber(KIINTEA, 2, lang)} c: kotitalouksien keskimääräinen energian hinta (Tilastokeskus ${KIINTEA_KK}).`, `In your contract. Default ${formatNumber(KIINTEA, 2, lang)} c: average household energy price (Statistics Finland ${KIINTEA_KK}).`)} />}
    </div>
  );
}

export const oletusVal = (verkko = 'helen', tuote = 0, sulake = 0): Val => ({ verkko: verkkoIndex(verkko), tuote, sulake, sop: 0, marg: MARGINAALI, kiint: KIINTEA, perusM: PERUS_MYYJA, omaC: 4, omaKk: 10 });

/** Libellé de l'état des prix : publiés (source) ou estimation moyenne (méthode, période). */
export function Tila({ s, data, lang }: { s: Sarja; data: SpotData; lang: L }) {
  const pvm = displayDate(s.pvm, lang === 'en' ? 'en-GB' : 'fi-FI');
  if (s.tila === 'toteutunut') {
    const src = s.lahde === 'entsoe' ? 'ENTSO-E' : 'Nord Pool';
    return <p className="mt-3 rounded-lg bg-white/70 p-3 text-xs text-navy-700">{T(lang, `Pörssin julkaisemat hinnat ${pvm}, tarjousalue FI, lähde ${src}${s.alustava ? ' (alustava)' : ''}.`, `Exchange prices published for ${pvm}, FI bidding zone, source ${src}${s.alustava ? ' (preliminary)' : ''}.`)}</p>;
  }
  if (s.tila === 'arvio') {
    const a = data.arvio;
    const jakso = s.menetelma === 'suora' && a.jakso ? `${a.jakso.alku} – ${a.jakso.loppu}` : a.tasoJakso ? `${a.tasoJakso.alku} – ${a.tasoJakso.loppu}` : '';
    return <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900"><strong>{T(lang, 'Keskihinta-arvio, ei päivän tarkka hinta.', 'Estimated average price, not the exact price of the day.')}</strong> {T(lang, `Päivän ${pvm} hintoja ei ole vielä saatavilla. Luvut ovat saman kuukauden ja viikonpäivätyypin keskiarvoja vartti kerrallaan (${s.menetelma === 'suora' ? 'toteutuneet päivät' : 'kuukauden keskihinta ja vuorokausiprofiili'}, jakso ${jakso}). Ne vaihtuvat oikeisiin hintoihin automaattisesti.`, `Prices for ${pvm} are not available yet. Figures are averages for the same month and day type, quarter by quarter (${s.menetelma === 'suora' ? 'actual past days' : 'monthly average plus daily profile'}, period ${jakso}). They switch to real prices automatically.`)}</p>;
  }
  return <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">{T(lang, 'Hintoja ei ole saatavilla tälle päivälle.', 'No prices available for this day.')}</p>;
}

/** Série du jour choisi (0 = aujourd'hui, 1 = demain), mémorisée. */
export function usePaiva(data: SpotData, tanaan: string, paiva: number) {
  return useMemo(() => sarja(data, paiva ? lisaaPaivia(tanaan, 1) : tanaan), [data, tanaan, paiva]);
}
