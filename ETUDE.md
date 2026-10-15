# ETUDE — FI-SAHKO : pörssisähkö, prix réel avec le transport

Idée n° 11 de `reports/etude-niches-2026-10-15-B.md`, validée le 2026-10-15 (brief `BRIEF-10-SITES-2026-10-15.md`).
Volume Keyword Planner (objetech, zone Finlande) : ~1,8 M recherches/mois au relevé ; les cinq requêtes notées
100 k – 1 M (`pörssisähkö`, `pörssisähkön hinta`, `pörssisähkö hinta`, `sähkön hinta`, `sähkön hinta nyt`)
donnent à elles seules 1 581 139 (moyenne géométrique), voir `research/volumes-fi-sahko.txt`.

## SERP réel (2026-10-15/16, requêtes « pörssisähkö huomenna », « pörssisähkön hinta tänään »)

Recherche web (WebSearch) + lecture des pages par curl. Mesure : présence de mots « siirto », « vero »,
« marginaali » et des noms de réseaux (Caruna, Elenia) dans le texte servi.

| Concurrent | Ce qu'il fait | Défaut constaté |
|---|---|---|
| sahkotin.fi | graphique des quarts d'heure (page JS, 30 mots servis) | spot seul ; ni transport, ni taxe, ni marge ; aucun texte |
| porssisahkoa.fi (Pörssisähköä.fi) | prix du jour, 467 mots | 0 mention de siirto, de vero, de marginaali ou d'un réseau |
| porssisahko.fi | prix du jour avec TVA, 564 mots | 1 mention de siirto ; aucun calcul par réseau |
| pörssisähkö.net | hier/aujourd'hui/demain | 0 mention de siirto ou de taxe |
| spot-hinta.fi | API et page de démonstration | pas de prix pour le consommateur |
| sahkonhintatanaan.fi | prix horaires, 1 331 mots | 0 mention de siirto ou de taxe ; encore à l'heure |
| sähköhintavertailu.fi / sahkovertailu.fi | prix + comparateur de contrats (affiliation) | parle de marge, pas du transport par réseau ; pousse vers un contrat |
| verkkouutiset.fi, mtvuutiset.fi, yle.fi, kaleva.fi | une actualité par jour | prix « ilman siirtomaksua ja myyjän marginaalia », aucun calcul |
| oomi.fi, 1komma5.com | fournisseur, installateur | pages commerciales (Cloudflare sur oomi.fi) |

Aucun concurrent ne nomme un seul gestionnaire de réseau (0 occurrence de Caruna ou Elenia sur toutes les pages lues).

## Ce que Kokosähkö fait mieux

1. **Le prix réel au quart d'heure** : spot + marge (ou prix fixe) + siirtomaksu du réseau local + sähkövero + ALV,
   pour 13 gestionnaires (Caruna, Caruna Espoo, Elenia, Helen, Tampere, Oulu, Kymenlaakso, Järvi-Suomen Energia,
   PKS, Kuopio, Lahti, Savon Voima, Seiverkot), produits yleis / aika / kausi, tehomaksu de Helen et Kuopio.
2. **Le code postal donne le réseau** (liste Energiavirasto, 3 365 codes, 76 gestionnaires).
3. **Le coût d'un usage** (sauna, voiture électrique, lave-linge, sèche-linge) au départ le moins cher, le plus cher, maintenant.
4. **Pörssi vai kiinteä sur sa propre consommation** avec les 12 derniers mois réels et le prix fixe d'équilibre.
5. **Une page par réseau** avec l'angle propre au réseau (fusible sans effet chez Caruna Espoo, perusmaksu annuel à Oulu,
   « aikasähkö » d'hiver chez Savon Voima, tehomaksu Helen/Kuopio, nuit à 0,968 c chez KSOY…).
6. **Jamais de chiffre deviné** : si le prix du jour manque, moyenne estimée annoncée en clair, avec méthode et période.

## Données

| Donnée | Source | Script | Rythme |
|---|---|---|---|
| Spot FI au quart d'heure | ENTSO-E (si `ENTSOE_TOKEN`), sinon Nord Pool Data Portal (public) | `scripts/data/hae-spot.mjs` | Action 4×/jour |
| Moyennes mensuelles FI | Nord Pool, agrégats officiels | `hae-spot.mjs --kuukaudet` | Action |
| Estimation de secours | archive `data/spot` + agrégats | `scripts/data/rakenna-spot.mjs` | Action |
| Tarifs de transport | prix publiés par chaque verkkoyhtiö (page ou PDF) | `src/data/verkot-2026.json`, vérifiés par `scripts/data/tarkista-verkot.py` (13/13 OK le 2026-10-15) | à chaque changement de tarif |
| Code postal → réseau | Energiavirasto, API du comparateur sahkonhinta.fi | `scripts/data/hae-postinumerot.mjs` | hebdo |
| Marge et abonnement médians | Energiavirasto, comparateur (produits pörssi consommateurs) | `scripts/data/hae-sopimukset.mjs` | hebdo |
| Profil mensuel de consommation, prix moyen ménage | Tilastokeskus 12su, 13rb | `scripts/data/hae-tilastokeskus.mjs` | hebdo |
| Sähkövero, huoltovarmuusmaksu, ALV | Verohallinto (verotaulukko 1.4.2026, alv-prosentit) | `src/data/params-2026.json` | à chaque changement |

Remarque : le tableur Energiavirasto « kaikkisiirtohinnat » (moyennes par réseau) s'arrête à 2024-07 (méthode refondue,
publication annoncée « kevään 2026 aikana ») et le site energiavirasto.fi est derrière un défi Cloudflare : les tarifs
viennent donc des hinnastot des gestionnaires eux-mêmes, source primaire.

## Limites

- Licences : les prix day-ahead appartiennent aux NEMO ; Nord Pool réserve la redistribution commerciale à une licence,
  et la liste ENTSO-E de réutilisation libre ne couvre pas les prix day-ahead. À régler avant mise en ligne (voir compte rendu).
- 13 réseaux sur 76 ; les autres passent par « Muu verkkoyhtiö ».
- Jours fériés non distingués des talviarkipäivä ; produits teho de Lahti non modélisés.
- Pas de suédois (fi + en seulement).
