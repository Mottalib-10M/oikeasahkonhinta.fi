/** Mini : kahden marginaalin ja perusmaksun ero vuodessa. */
import type { MiniSpec } from '../mini-types';
import { T, eur, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Paljonko marginaalin ero maksaa vuodessa?', 'What does a margin gap cost a year?'),
  cta: T(l, 'Vertaa pörssiä ja kiinteää', 'Compare spot and fixed'),
  inputs: [
    { id: 'kwh', label: T(l, 'Kulutus, kWh vuodessa', 'Consumption, kWh a year'), def: 5000, unit: 'kWh', max: 100000 },
    { id: 'm1', label: T(l, 'Nykyinen marginaali, c/kWh', 'Current margin, c/kWh'), def: 0.79, unit: 'c', max: 10, decimals: 2 },
    { id: 'm2', label: T(l, 'Vertailtava marginaali, c/kWh', 'Margin to compare, c/kWh'), def: 0.39, unit: 'c', max: 10, decimals: 2 },
  ],
  run: ({ kwh, m1, m2 }) => ({
    head: [T(l, 'Ero vuodessa', 'Difference per year'), eur((kwh * (m1 - m2)) / 100, l)],
    rows: [
      [T(l, 'Nykyinen marginaali vuodessa', 'Current margin per year'), eur((kwh * m1) / 100, l)],
      [T(l, 'Vertailtava marginaali vuodessa', 'Compared margin per year'), eur((kwh * m2) / 100, l)],
    ],
    note: T(l, 'Muista lisätä perusmaksujen ero: 1 €/kk on 12 € vuodessa.', 'Remember the monthly fee gap too: €1 a month is €12 a year.'),
  }),
});
