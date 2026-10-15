/** Réglages par défaut d'un outil (`toolProps` d'une page) → props des composants. */
import { VERKOT } from './engine/verkot';
export const STANDARD_VERKKO = 'helen';
export function verktygProps(tp: Record<string, string | number> = {}) {
  const verkko = String(tp.verkko ?? STANDARD_VERKKO);
  if (!VERKOT.some((v) => v.id === verkko)) throw new Error(`toolProps.verkko inconnu : ${verkko}`);
  return { verkko, tuote: Number(tp.tuote ?? 0), sulake: Number(tp.sulake ?? 0), laite: String(tp.laite ?? 'sauna'), tila: String(tp.tila ?? 'tanaan') };
}
