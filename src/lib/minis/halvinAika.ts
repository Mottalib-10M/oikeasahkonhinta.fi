/** Mini : tämän päivän halvin jakso ja säästö päivän keskihintaan verrattuna (Helen, yleissiirto). */
import type { MiniSpec } from '../mini-types';
import { T, eur, c, type L } from './_kit';
import { SPOT } from '../spot-data';
import { sarja, vartit, halvinIkkuna, tilasto } from '../engine/spot';
import { verkko, tuote } from '../engine/verkot';
import { kello } from '../engine/aika';
import sop from '../../data/sopimukset.json';
const tu = tuote(verkko('helen')!, 'yleis')!;
const q = vartit(sarja(SPOT, SPOT.tanaan), tu, { tyyppi: 'porssi', marginaali: sop.marginaaliMediaani ?? 0, kiintea: 0 });
const tot = q.map((x) => x.yhteensa);
export default (l: L): MiniSpec => ({
  title: T(l, 'Päivän halvin jakso ja säästö', 'Today’s cheapest window and the saving'),
  cta: T(l, 'Laske oma verkkosi', 'Calculate your own network'),
  inputs: [
    { id: 'h', label: T(l, 'Kesto, tuntia', 'Length, hours'), def: 3, unit: 'h', max: 24, decimals: 1 },
    { id: 'kwh', label: T(l, 'Kulutus jaksolla, kWh', 'Use in the window, kWh'), def: 20, unit: 'kWh', max: 200 },
  ],
  run: ({ h, kwh }) => {
    const ik = halvinIkkuna(tot, Math.max(1, Math.round(h * 4)));
    const ka = tilasto(tot).ka;
    if (ik.i < 0) return { head: [T(l, 'Halvin jakso', 'Cheapest window'), '–'], rows: [] };
    return {
      head: [T(l, `Halvin jakso alkaa ${kello(q[ik.i].t)}`, `Cheapest window starts ${kello(q[ik.i].t)}`), c(ik.ka, l)],
      rows: [
        [T(l, 'Päivän keskihinta', 'Day average'), c(ka, l)],
        [T(l, 'Säästö tällä kulutuksella', 'Saving on this use'), eur((kwh * (ka - ik.ka)) / 100, l)],
      ],
      note: T(l, 'Helen Sähköverkko, yleissiirto, pörssisopimus. Sivun päivityspäivän hinnat.', 'Helen Sähköverkko, general transfer, spot contract. Prices of the page’s update day.'),
    };
  },
});
