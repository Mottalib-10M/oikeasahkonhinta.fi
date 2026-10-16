/**
 * Temps de Finlande (Europe/Helsinki). Un jour = 96 quarts d'heure (92 ou 100 aux changements d'heure).
 * Les créneaux sont repérés par leur début en UTC ; l'heure locale sert aux tarifs jour/nuit et hiver.
 */
const TZ = 'Europe/Helsinki';
const fmtDate = new Intl.DateTimeFormat('sv-SE', { timeZone: TZ });
const fmtParts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', weekday: 'short', month: 'numeric', hourCycle: 'h23' });
/** Date civile d'Helsinki (AAAA-MM-JJ) d'un instant. */
export const hkiPvm = (t: number | Date) => fmtDate.format(typeof t === 'number' ? new Date(t) : t);
export interface Paikallinen { tunti: number; minuutti: number; viikonpaiva: number; kuukausi: number }
const WD: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
/** Heure, minute, jour de semaine (0 = dimanche) et mois (1–12) locaux d'un instant UTC. */
export function paikallinen(t: number): Paikallinen {
  const p = fmtParts.formatToParts(new Date(t));
  const g = (k: string) => p.find((x) => x.type === k)!.value;
  return { tunti: Number(g('hour')), minuutti: Number(g('minute')), viikonpaiva: WD[g('weekday')], kuukausi: Number(g('month')) };
}
/** « 07:15 » : heure locale de début d'un créneau. */
export const kello = (t: number) => { const l = paikallinen(t); return `${String(l.tunti).padStart(2, '0')}:${String(l.minuutti).padStart(2, '0')}`; };
/** Jour 07–22 (valeur par défaut des tarifs aika ; chaque produit peut préciser ses plages, voir verkot.ts). */
export const onPaiva = (t: number) => { const h = paikallinen(t).tunti; return h >= 7 && h < 22; };
/** Talviarkipäivä par défaut des tarifs kausi : 1.11.–31.3., lundi à samedi, 07–22, sans tenir compte des jours fériés (la règle propre à chaque produit est dans verkot.ts). */
export const onTalvipaiva = (t: number) => { const l = paikallinen(t); return (l.kuukausi >= 11 || l.kuukausi <= 3) && l.viikonpaiva !== 0 && l.tunti >= 7 && l.tunti < 22; };
export const onViikonloppu = (pvm: string) => { const w = new Date(`${pvm}T12:00:00Z`).getUTCDay(); return w === 0 || w === 6; };
export const lisaaPaivia = (pvm: string, n: number) => { const d = new Date(`${pvm}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
/** Premier instant UTC du jour civil d'Helsinki. */
export function keskiyo(pvm: string): number {
  for (const h of [20, 21, 22, 23]) {
    const t = Date.parse(`${lisaaPaivia(pvm, -1)}T${h}:00:00Z`);
    if (hkiPvm(t) === pvm && hkiPvm(t - 1) !== pvm) return t;
  }
  throw new Error(`keskiyo ${pvm}`);
}
/** Nombre de quarts d'heure du jour civil (96, ou 92/100 aux changements d'heure). */
export const varttejaPaivassa = (pvm: string) => Math.round((keskiyo(lisaaPaivia(pvm, 1)) - keskiyo(pvm)) / 900_000);
