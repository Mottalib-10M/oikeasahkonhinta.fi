/** Données spot figées au build (src/data/spot-nyt.json, écrit par scripts/data/rakenna-spot.mjs). */
import raw from '../data/spot-nyt.json';
import type { SpotData } from './engine/spot';
export const SPOT = raw as unknown as SpotData;
