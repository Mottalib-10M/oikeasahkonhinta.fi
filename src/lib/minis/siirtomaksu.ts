/** Mini : siirron vuosikustannus verkkoyhtiön yleissiirrolla. */
import type { MiniSpec } from '../mini-types';
import { T, eur, c, verkkoOptions, type L } from './_kit';
import { VERKOT, perusKk } from '../engine/verkot';
export default (l: L): MiniSpec => ({
  title: T(l, 'Paljonko siirto maksaa vuodessa?', 'What does transfer cost a year?'),
  cta: T(l, 'Vertaa kaikkia verkkoja', 'Compare all networks'),
  inputs: [
    { id: 'v', label: T(l, 'Verkkoyhtiö', 'Network operator'), def: 0, options: verkkoOptions() },
    { id: 'kwh', label: T(l, 'Kulutus, kWh vuodessa', 'Consumption, kWh a year'), def: 5000, unit: 'kWh', max: 100000 },
  ],
  run: ({ v, kwh }) => {
    const tu = (VERKOT[v] ?? VERKOT[0]).tuotteet[0];
    const perus = perusKk(tu, '3x25') * 12, siirto = (kwh * tu.energia.kaikki!) / 100;
    return {
      head: [T(l, 'Yleissiirto vuodessa, 3 × 25 A', 'General transfer per year, 3 × 25 A'), eur(perus + siirto, l, 0)],
      rows: [
        [T(l, 'Siirtomaksut', 'Transfer fees'), eur(siirto, l, 0)],
        [T(l, 'Perusmaksut', 'Basic fees'), eur(perus, l, 0)],
        [T(l, 'Keskimäärin kilowattitunnilta', 'Average per kilowatt-hour'), kwh > 0 ? c(((perus + siirto) / kwh) * 100, l) : '–'],
      ],
    };
  },
});
