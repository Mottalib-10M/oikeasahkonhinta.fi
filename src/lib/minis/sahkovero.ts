/** Mini : sähkövero vuodessa kulutuksen mukaan (luokka I, alv mukana). */
import type { MiniSpec } from '../mini-types';
import { T, eur, c, type L } from './_kit';
import { VERO_C, VERO_VEROTON, ALV } from '../engine/params';
export default (l: L): MiniSpec => ({
  title: T(l, 'Paljonko maksat sähköveroa vuodessa?', 'How much electricity tax do you pay a year?'),
  cta: T(l, 'Katso koko sähkön hinta', 'See the full electricity price'),
  inputs: [{ id: 'kwh', label: T(l, 'Kulutus, kWh vuodessa', 'Consumption, kWh a year'), def: 5000, unit: 'kWh', max: 100000 }],
  run: ({ kwh }) => ({
    head: [T(l, 'Sähkövero ja huoltovarmuusmaksu vuodessa', 'Electricity tax and supply security fee per year'), eur((kwh * VERO_C) / 100, l)],
    rows: [
      [T(l, 'Ilman arvonlisäveroa', 'Before VAT'), eur((kwh * VERO_VEROTON) / 100, l)],
      [T(l, 'Arvonlisävero veron päälle', 'VAT on the tax'), eur((kwh * VERO_VEROTON * ALV) / 100, l)],
      [T(l, 'Kilowattitunnilta', 'Per kilowatt-hour'), c(VERO_C, l, 4)],
    ],
  }),
});
