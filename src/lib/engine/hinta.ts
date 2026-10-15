/**
 * Le prix réel d'un kWh : énergie (spot + marge, ou prix fixe) + transport du réseau local + sähkövero,
 * TVA 25,5 % comprise partout. Le spot arrive en €/MWh hors TVA : 1 €/MWh = 0,1 c/kWh.
 * La TVA s'applique aussi à un spot négatif (crédit) : c'est la règle de calcul retenue et annoncée.
 */
import { ALV, VERO_C } from './params';

export interface Sopimus { tyyppi: 'porssi' | 'kiintea'; marginaali: number; kiintea: number }
export interface Osat { energia: number; spot: number; marginaali: number; siirto: number; vero: number; yhteensa: number }
/** €/MWh hors TVA → c/kWh TVA comprise. */
export const spotC = (eurMwh: number) => (eurMwh / 10) * (1 + ALV);
/** Décomposition du prix d'un kWh, en c/kWh TVA comprise. `marginaali` et `kiintea` sont saisis TVA comprise. */
export function kwhHinta(eurMwh: number, siirto: number, s: Sopimus, vero = VERO_C): Osat {
  const spot = s.tyyppi === 'porssi' ? spotC(eurMwh) : 0;
  const marginaali = s.tyyppi === 'porssi' ? s.marginaali : 0;
  const energia = s.tyyppi === 'porssi' ? spot + marginaali : s.kiintea;
  return { energia, spot, marginaali, siirto, vero, yhteensa: energia + siirto + vero };
}
/** Coût en euros d'une consommation `kwh` au prix `c` c/kWh. */
export const eur = (kwh: number, c: number) => (kwh * c) / 100;
