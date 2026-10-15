/**
 * Barres du prix total par quart d'heure (SVG, sans bibliothèque). Une seule série : le prix total
 * TVA comprise ; la part énergie est foncée, transport + taxe en clair (empilées, écart de 1 px).
 * La fenêtre la moins chère est cerclée, le quart d'heure en cours marqué d'un trait. Survol ou
 * toucher : l'heure et les montants s'affichent au-dessus du graphique.
 */
import { useEffect, useRef, useState } from 'react';
import { kello } from '../../lib/engine/aika';
import { formatNumber } from '../../lib/format';
import type { Vartti } from '../../lib/engine/spot';

interface Props { v: Vartti[]; lang: 'fi' | 'en'; nytI?: number; ikkuna?: { i: number; n: number }; aria: string }
const C = { energia: '#0B5D4B', muu: '#9cc9bd', ikkuna: '#b45309', akseli: '#64748b', teksti: '#334155', nyt: '#0f172a' };

export default function Kayra({ v, lang, nytI = -1, ikkuna, aria }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  // Largeur réelle mesurée après montage : le texte des axes garde 11 px à l'écran (720 au build).
  const box = useRef<HTMLElement>(null);
  const [W, setW] = useState(720);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(300, Math.round(el.clientWidth))));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  if (!v.length) return null;
  const H = W < 500 ? 200 : 220, padL = 34, padB = 22, top = 10;
  const max = Math.max(...v.map((x) => x.yhteensa), 1), min = Math.min(0, ...v.map((x) => Math.min(x.energia, x.yhteensa)));
  const span = max - min || 1;
  const y = (val: number) => top + ((max - val) / span) * (H - top - padB);
  const bw = (W - padL) / v.length;
  const y0 = y(0);
  const f = (x: number) => formatNumber(x, 2, lang);
  const sel = hover ?? (nytI >= 0 ? nytI : null);
  const ticks = [0, max / 2, max].map((t) => Math.round(t));
  return (
    <figure className="mt-6" ref={box}>
      <p className="tabular-nums min-h-[1.25rem] text-sm text-navy-800" aria-live="polite">
        {sel !== null && v[sel] ? `${kello(v[sel].t)}–${kello(v[sel].t + 900_000)} · ${lang === 'fi' ? 'yhteensä' : 'total'} ${f(v[sel].yhteensa)} c/kWh · ${lang === 'fi' ? 'pörssi' : 'spot'} ${f(v[sel].spot)} · ${lang === 'fi' ? 'siirto' : 'transfer'} ${f(v[sel].siirto)} · ${lang === 'fi' ? 'vero' : 'tax'} ${f(v[sel].vero)}` : ' '}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="h-auto w-full touch-none" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => <g key={t}><line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth="1" /><text x={padL - 4} y={y(t) + 4} fontSize="11" fill={C.teksti} textAnchor="end">{t}</text></g>)}
        <line x1={padL} x2={W} y1={y0} y2={y0} stroke={C.akseli} strokeWidth="1" />
        {v.map((x, i) => {
          const inW = ikkuna && ikkuna.i >= 0 && i >= ikkuna.i && i < ikkuna.i + ikkuna.n;
          const e = x.energia, rest = x.yhteensa - x.energia;
          const xe = padL + i * bw, w = Math.max(1, bw - 1);
          const eTop = Math.min(y(e), y0), eH = Math.max(0.5, Math.abs(y(e) - y0));
          const base = e >= 0 ? e : 0;
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)}>
              <rect x={xe} y={top} width={bw} height={H - top - padB} fill="transparent" />
              <rect x={xe} y={eTop} width={w} height={eH} fill={inW ? C.ikkuna : C.energia} opacity={hover === i ? 0.75 : 1} />
              <rect x={xe} y={y(base + rest)} width={w} height={Math.max(0.5, y(base) - y(base + rest) - 1)} fill={inW ? '#f5c99a' : C.muu} />
            </g>
          );
        })}
        {nytI >= 0 && <line x1={padL + (nytI + 0.5) * bw} x2={padL + (nytI + 0.5) * bw} y1={top} y2={H - padB} stroke={C.nyt} strokeWidth="1.5" strokeDasharray="3 3" />}
        {v.map((x, i) => (i % (W < 500 ? 24 : 12) === 0 ? <text key={`t${i}`} x={padL + i * bw} y={H - 6} fontSize="11" fill={C.teksti}>{kello(x.t)}</text> : null))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-700">
        <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: C.energia }} />{lang === 'fi' ? 'Energia (pörssi + marginaali tai kiinteä)' : 'Energy (spot + margin, or fixed)'}</span>
        <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: C.muu }} />{lang === 'fi' ? 'Siirto ja sähkövero' : 'Transfer and electricity tax'}</span>
        <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ background: C.ikkuna }} />{lang === 'fi' ? 'Halvin jakso' : 'Cheapest window'}</span>
        <span>{lang === 'fi' ? 'c/kWh sis. alv 25,5 %' : 'c/kWh incl. 25.5% VAT'}</span>
      </figcaption>
    </figure>
  );
}
