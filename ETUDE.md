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
   pour tous les gestionnaires dont le hinnasto est publié et lisible (voir `src/data/verkot-2026.json`, liste `puuttuu`
   pour les autres), produits yleis / aika / kausi avec la plage horaire propre à chaque produit (heures, jours, mois,
   heure normale), jours fériés officiels traités selon le hinnasto, produits avec tehomaksu (Helen, Kuopio, Lahti…).
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
| Tarifs de transport | prix publiés par chaque verkkoyhtiö (page ou PDF), plages horaires citées mot pour mot (`ajat.lainaus`), clients (`asiakkaat`) | `src/data/verkot-2026.json`, vérifiés par `scripts/data/tarkista-verkot.py` (prix, citations, structure) | à chaque changement de tarif |
| Jours fériés | calendrier officiel (Pohjoismaiden ministerineuvosto, « Suomen pyhäpäivät »), calculé | `src/lib/engine/pyhat.ts` | — |
| Code postal → réseau | Energiavirasto, API du comparateur sahkonhinta.fi | `scripts/data/hae-postinumerot.mjs` | hebdo |
| Marge et abonnement médians | Energiavirasto, comparateur (produits pörssi consommateurs) | `scripts/data/hae-sopimukset.mjs` | hebdo |
| Profil mensuel de consommation, prix moyen ménage | Tilastokeskus 12su, 13rb | `scripts/data/hae-tilastokeskus.mjs` | hebdo |
| Sähkövero, huoltovarmuusmaksu, ALV | Verohallinto (verotaulukko 1.4.2026, alv-prosentit) | `src/data/params-2026.json` | à chaque changement |

Remarque : le tableur Energiavirasto « kaikkisiirtohinnat » (moyennes par réseau) s'arrête à 2024-07 (méthode refondue,
publication annoncée « kevään 2026 aikana ») et le site energiavirasto.fi est derrière un défi Cloudflare : les tarifs
viennent donc des hinnastot des gestionnaires eux-mêmes, source primaire.

## Limites

Passe qualité du 2026-10-16 (brief `BRIEF-QUALITE-2026-10-16.md`) :

- Réseaux : 13 → **72 sur 76** gestionnaires de la liste Energiavirasto, chacun avec l'URL de son hinnasto, sa date
  d'entrée en vigueur, sa date de lecture, la citation mot pour mot de chaque plage horaire et, pour 38, le nombre de clients
  publié ; `tarkista-verkot.py` : 72/72 OK. Manquent (liste `puuttuu` du JSON, affichée sur la page méthode) : Paneliankosken
  Voima (PDF sans texte), Muonion Sähköosuuskunta et Tornion Energia (siirtomaksu publié seulement hors TVA ou avec sähkövero),
  Rantakairan Sähkö (hinnasto du 1.11.2026 pas encore en vigueur, l'actuel sans prix TTC seul).
- Pages réseau : une page seulement à partir de 30 000 clients publiés (`SIVU_KYNNYS`, testé) : 12 pages gardées + 9 nouvelles
  (Vantaa, Turku, Vaasa, Kajave, Pori, KSS, Porvoo, Herrfors, Rovakaira) ; Seiverkot (28 280 clients) passe dans l'outil et
  le comparatif. 80 pages indexables fi + en.
- Lahti : Yleissiirto teho et Yösiirto teho modélisés (tehomaksu sur la pointe des 12 derniers mois) ; les produits sans
  tehomaksu réservés aux logements collectifs (`kohde`). Oulu : aikasähkö et kausisähkö ajoutés, heures publiées sur la page
  hinnasto officielle.
- Jours fériés : calendrier officiel calculé (`pyhat.ts`) ; traitement par produit selon le hinnasto (`ajat.pyhat`) : Oulu
  (arkipyhät = muu aika), Tampere et Keminmaa (arkipyhät = talviarkipäivä) ; ailleurs le hinnasto ne cite que des jours de
  semaine et le calcul les suit tels quels. Heure normale toute l'année gérée (KSS Verkko, Raahe).
- Repli « keskihinta-arvio » : logique extraite dans `scripts/data/spot-arvio.mjs` et testée de bout en bout
  (`tests/spot-arvio.test.ts` : moyenne directe, niveau + profil, jour publié prioritaire, changement d'heure, rien d'inventé
  sans données, source coupée sur les données réelles).

Restent :
- Licences : les prix day-ahead appartiennent aux NEMO ; Nord Pool réserve la redistribution commerciale à une licence,
  et la liste ENTSO-E de réutilisation libre ne couvre pas les prix day-ahead. Décision de l'éditeur (choix actuel inchangé).
- Clients non publiés pour 34 réseaux (dont Lappeenranta, Imatra) : pas de page tant qu'aucun chiffre officiel n'existe.
- Produits non modélisés, décrits dans `huom` : plages à trois tarifs, horaires de samedi particuliers (Kajave), heures non
  publiées (Keuruu, Herrfors vuodenaikasähkö), Yleissähkö de Haukiputaan (prix illisibles par extraction PDF).
- Pas de suédois (fi + en seulement).
