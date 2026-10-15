/**
 * Postinumero → jakeluverkkoyhtiö, Energiaviraston sähkön hintavertailun (sahkonhinta.fi) rajapinnasta.
 * Usage : node scripts/data/hae-postinumerot.mjs  → public/data/postinumerot.json
 * Le fichier liste les 117 gestionnaires de réseau et, pour chaque code postal, les gestionnaires
 * qui y opèrent (un code peut en avoir plusieurs). Les réseaux couverts par le simulateur sont
 * reconnus par les noms `ev` de src/data/verkot-2026.json.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const API = 'https://ev-shv-prod-app-wa-consumerapi1.azurewebsites.net/api/getdsocollection';
const r = await fetch(API);
if (!r.ok) throw new Error(`Energiavirasto ${r.status}`);
const dsos = (await r.json()).filter((d) => d.PostalCodes.length).sort((a, b) => a.Name.localeCompare(b.Name, 'fi'));
const verkot = JSON.parse(readFileSync('src/data/verkot-2026.json', 'utf8')).verkot;
const idOf = (name) => verkot.find((v) => v.ev.includes(name))?.id ?? null;
const nimet = dsos.map((d) => [d.Name, idOf(d.Name)]);
const pn = {};
dsos.forEach((d, i) => { for (const c of new Set(d.PostalCodes)) { if (c === '00000') continue; (pn[c] ??= []).push(i); } });
mkdirSync('public/data', { recursive: true });
writeFileSync('public/data/postinumerot.json', JSON.stringify({ lahde: API, haettu: new Date().toISOString().slice(0, 10), yhtiot: nimet, postinumerot: pn }));
const katetut = nimet.filter((n) => n[1]).map((n) => n[0]);
console.log(`${dsos.length} verkkoyhtiötä, ${Object.keys(pn).length} postinumeroa ; simulaattorissa : ${katetut.join(', ')}`);
