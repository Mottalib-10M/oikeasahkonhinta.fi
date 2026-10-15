/** Mini : kokonaishinta, kun pörssihinta on negatiivinen. */
import type { MiniSpec } from '../mini-types';
import { T, c, verkkoOptions, type L } from './_kit';
import { VERKOT } from '../engine/verkot';
import { kwhHinta } from '../engine/hinta';
export default (l: L): MiniSpec => ({
  title: T(l, 'Mitä kilowattitunti maksaa negatiivisella hinnalla?', 'What does a kWh cost at a negative price?'),
  cta: T(l, 'Katso tämän päivän hinnat', 'See today’s prices'),
  inputs: [
    { id: 'spot', label: T(l, 'Pörssihinta, €/MWh (miinus = negatiivinen)', 'Spot price, €/MWh (minus = negative)'), def: -5, unit: '€', max: 1000 },
    { id: 'v', label: T(l, 'Verkkoyhtiö', 'Network operator'), def: 0, options: verkkoOptions() },
  ],
  run: ({ spot, v }) => {
    const tu = (VERKOT[v] ?? VERKOT[0]).tuotteet[0];
    const o = kwhHinta(spot, tu.energia.kaikki!, { tyyppi: 'porssi', marginaali: 0.51, kiintea: 0 });
    return {
      head: [T(l, 'Kokonaishinta yleissiirrolla', 'All-in price on general transfer'), c(o.yhteensa, l)],
      rows: [
        [T(l, 'Pörssihinta alv:n kanssa', 'Spot incl. VAT'), c(o.spot, l)],
        [T(l, 'Marginaali (esimerkki)', 'Margin (example)'), c(o.marginaali, l)],
        [T(l, 'Siirto ja sähkövero', 'Transfer and electricity tax'), c(o.siirto + o.vero, l)],
      ],
    };
  },
});
