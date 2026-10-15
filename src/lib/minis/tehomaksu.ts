/** Mini : tehomaksu kuukaudessa ja vuodessa huipputehon mukaan (Helen, Kuopio). */
import type { MiniSpec } from '../mini-types';
import { T, eur, type L } from './_kit';
import { VERKOT } from '../engine/verkot';
const teho = VERKOT.flatMap((v) => v.tuotteet.filter((t) => t.teho).map((t) => ({ v, t })));
export default (l: L): MiniSpec => ({
  title: T(l, 'Paljonko tehomaksu maksaa?', 'What does the power fee cost?'),
  cta: T(l, 'Vertaa siirtohintoja', 'Compare transfer fees'),
  inputs: [
    { id: 'kw', label: T(l, 'Tunnin huipputeho, kW', 'Peak hourly power, kW'), def: 6, unit: 'kW', max: 60, decimals: 1 },
    { id: 'i', label: T(l, 'Tuote', 'Product'), def: 0, options: teho.map((x, i) => ({ value: String(i), label: `${x.v.lyhyt}, ${x.t.nimi}` })) },
  ],
  run: ({ kw, i }) => {
    const x = teho[i] ?? teho[0];
    const kk = x.t.teho!.eurKwKk * kw;
    return {
      head: [T(l, 'Tehomaksu vuodessa', 'Power fee per year'), eur(kk * 12, l, 0)],
      rows: [
        [T(l, 'Kuukaudessa', 'Per month'), eur(kk, l)],
        [T(l, 'Hinta', 'Rate'), `${eur(x.t.teho!.eurKwKk, l)}/kW/${T(l, 'kk', 'month')}`],
        [T(l, 'Jokainen kilowatti vähemmän säästää vuodessa', 'Each kW less saves per year'), eur(x.t.teho!.eurKwKk * 12, l)],
      ],
    };
  },
});
