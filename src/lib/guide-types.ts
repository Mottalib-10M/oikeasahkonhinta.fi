/**
 * Un guide (ou une page outil) = UN fichier de données dans `src/content/guides/` (ou `outils/`).
 * Ce fichier porte tout : les deux langues, le texte, la FAQ, les sources, le mini-simulateur,
 * les liens. Le cœur du site (routes, menus, pied de page, sitemap, hreflang, schémas, maillage)
 * le lit seul. Notice : CONTRIBUTING-SIVUT.md à la racine du dépôt.
 */
import type { SourceKey, Params } from './engine/params';
import type { SpotData } from './engine/spot';

export type Lang = 'fi' | 'en';
export type Group = 'hinta' | 'verkko' | 'laite' | 'opas';
export interface FAQ { q: string; a: string }

/** Outils fournis pour écrire le corps : liens internes, nombres au format de la langue. */
export interface Helpers {
  lang: Lang;
  /** Lien interne vers une autre page du site, par son identifiant. */
  a: (id: string, text: string) => string;
  /** Montant en euros, 2 décimales par défaut (« 12,40 € » / « €12.40 »). */
  eur: (n: number, decimals?: number) => string;
  /** Nombre au format de la langue. */
  num: (n: number, decimals?: number) => string;
  /** Prix en c/kWh, deux décimales par défaut (« 5,26 c/kWh »). */
  c: (n: number, decimals?: number) => string;
  /** Pourcentage depuis une fraction (0,255 → « 25,5 % »). */
  pct: (x: number, decimals?: number) => string;
  /** Date ISO écrite en toutes lettres dans la langue. */
  date: (iso: string) => string;
  /** Tableau de style journal. */
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  /** Lien vers une source du fichier de paramètres (texte officiel). */
  src: (key: SourceKey, text?: string) => string;
  /** Paramètres 2026 : toute valeur réglementaire se lit ici, jamais en dur. */
  P: Params;
  /** Moteur de calcul, pour les exemples chiffrés du texte (jamais un chiffre recopié à la main). */
  M: typeof import('./engine/index');
  /** Données spot du build (jours publiés, estimation, moyennes mensuelles). */
  S: SpotData;
}

export interface PageText {
  /** Segment d'URL, sans barre. Ni année, ni nombre de 3 chiffres, ni chiffre en tête. */
  slug: string;
  /** Libellé court pour les menus et le fil d'Ariane. */
  nav: string;
  /** Une phrase pour les cartes « pages associées ». */
  card: string;
  /** 50 à 60 caractères, terme-clé en tête, année comprise (RECETTE §11). */
  title: string;
  /** 150 à 160 caractères, année comprise. */
  description: string;
  h1: string;
  /** Chapeau d'une phrase, sous le H1. */
  intro: string;
  /** Bloc citable : UN paragraphe d'au moins 120 mots, avec les chiffres (RECETTE §21). */
  resume: (h: Helpers) => string;
  /** 4 à 6 questions propres à la page, réponses de 40 à 90 mots (RECETTE §7). */
  faqs: (h: Helpers) => FAQ[];
  /** Corps HTML (h2, h3, p, ul, ol, table via h.table). `<!--mini:kind-->` insère un mini-simulateur de plus. */
  body: (h: Helpers) => string;
}

export type Tool = 'tanaan' | 'huomenna' | 'vertailu' | 'verkot' | 'laite' | 'kuukaudet' | 'lasku';
export interface PageDef {
  id: string;
  group: Group;
  /** Place dans les menus du groupe (petit = en haut). */
  order: number;
  /** Mini-simulateur placé après le bloc citable (un fichier `src/lib/minis/<kind>.ts`). Ignoré si `tool`. */
  mini?: string;
  /** Page vers laquelle renvoie le bouton du mini-simulateur (par défaut : l'accueil). */
  miniHref?: string;
  /** Outil complet de la page (pages outils seulement). */
  tool?: Tool;
  /** Réglages par défaut de l'outil propres à la page : réseau, produit, appareil. */
  toolProps?: Record<string, string | number>;
  /** Identifiants des pages liées en fin de page (3 à 6). */
  related: string[];
  /** Clés de `params-2026.json > sources` citées par la page (2 au moins). */
  sources: SourceKey[];
  fi: PageText;
  en: PageText;
}

export const defineGuide = (g: PageDef): PageDef => g;
