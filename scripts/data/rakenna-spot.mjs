/**
 * Construit les données de prix lues par le site à partir de l'archive data/spot/*.json :
 *   src/data/spot-nyt.json   (lu au build : HTML statique du jour)
 *   public/data/spot.json    (même contenu, relu par le navigateur pour rester à jour sans rebuild)
 *
 * Contenu :
 *   paivat      — les 8 derniers jours archivés et le lendemain s'il est publié (€/MWh, quart d'heure)
 *   arvio       — l'estimation de secours, utilisée seulement pour un jour sans prix publié :
 *                 moyenne par quart d'heure × jour ouvré / week-end × mois.
 *                 · si l'archive compte au moins 8 jours du même mois et du même type de jour sur les
 *                   365 derniers jours : moyenne directe de ces jours (« suora ») ;
 *                 · sinon : niveau = moyenne officielle du même mois sur les 12 derniers mois
 *                   (agrégats Nord Pool, data/kuukausikeskiarvot.json) + profil horaire du type de jour
 *                   (écart à la moyenne, sur les jours archivés des 365 derniers jours) (« taso+profiili »).
 *   kuukaudet   — moyenne mensuelle de la zone FI (archive si le mois est complet, sinon agrégat officiel)
 *   paivakeskiarvot — moyenne de chaque jour archivé des 60 derniers jours
 * Usage : node scripts/data/rakenna-spot.mjs
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { rakennaSpot, hkiDate } from './spot-arvio.mjs';

const DIR = 'data/spot';
const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort() : [];
const days = files.map((f) => JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8')));
const kk = existsSync('data/kuukausikeskiarvot.json') ? JSON.parse(readFileSync('data/kuukausikeskiarvot.json', 'utf8')) : { kuukaudet: {}, lahde: '' };
const out = rakennaSpot({ days, kk, today: hkiDate(new Date()) });
writeFileSync('src/data/spot-nyt.json', JSON.stringify(out));
mkdirSync('public/data', { recursive: true });
writeFileSync('public/data/spot.json', JSON.stringify(out));
const a = out.arvio;
console.log(`spot-nyt : ${Object.keys(out.paivat).join(' ')} ; arvio ${Object.keys(a.suora).length} mois directs, profil ${JSON.stringify(Object.fromEntries(Object.entries(a.profiili).map(([k, v]) => [k, v.paivia])))}, niveau ${Object.keys(a.taso).length} mois`);
