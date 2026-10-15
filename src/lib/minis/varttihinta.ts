/** Mini : säästö, kun kulutusta siirretään kalliilta vartilta halvalle. */
import type { MiniSpec } from '../mini-types';
import { T, eur, c, type L } from './_kit';
import { spotC } from '../engine/hinta';
export default (l: L): MiniSpec => ({
  title: T(l, 'Paljonko kulutuksen siirtäminen säästää?', 'How much does shifting use save?'),
  cta: T(l, 'Katso päivän vartit', 'See today’s quarters'),
  inputs: [
    { id: 'kwh', label: T(l, 'Siirrettävä kulutus, kWh viikossa', 'Use shifted, kWh a week'), def: 20, unit: 'kWh', max: 1000 },
    { id: 'ero', label: T(l, 'Pörssihinnan ero, €/MWh', 'Spot price gap, €/MWh'), def: 50, unit: '€', max: 2000 },
  ],
  run: ({ kwh, ero }) => ({
    head: [T(l, 'Säästö vuodessa', 'Saving per year'), eur((kwh * spotC(ero) * 52) / 100, l, 0)],
    rows: [
      [T(l, 'Ero kilowattitunnilta alv:n kanssa', 'Gap per kWh incl. VAT'), c(spotC(ero), l)],
      [T(l, 'Säästö viikossa', 'Saving per week'), eur((kwh * spotC(ero)) / 100, l)],
    ],
    note: T(l, 'Yleissiirrossa siirto ja vero eivät muutu kellonajan mukaan, joten säästö syntyy pörssihinnasta.', 'On general transfer, transfer and tax do not change by hour, so the saving comes from the spot price.'),
  }),
});
