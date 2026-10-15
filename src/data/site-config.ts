/** Configuration centrale du site (générée par new-site.py). */
export const SITE_URL = "https://kokosahko.fi";
export const SITE_NAMES: Record<string, string> = {"fi": "Kokosähkö", "en": "Kokosähkö"};
export const LANG_TAGS: Record<string, string> = {"fi": "fi-FI", "en": "en-FI"};
export const OG_LOCALES: Record<string, string> = {"fi": "fi_FI", "en": "en_GB"};
export const LOCALE_TAG = 'fi-FI';
export const LOCALE_BY_LANG: Record<string, string> = { fi: 'fi-FI', en: 'en-GB' };
export const CURRENCY = 'EUR';
export const YEAR = 2026;
/** Année de création du site — signal d'ancienneté (RECETTE §8.0). */
export const SITE_FOUNDED = '2026';
/** Date de mise à jour = jour des prix publiés (le site est reconstruit chaque jour par l'Action). */
import spotNyt from './spot-nyt.json';
export const LAST_UPDATED: string = spotNyt.tanaan;
export const AUTHOR_NAME = 'Radif Partners';
export const AUTHOR_ROLE: Record<string, string> = {"fi": "Radif Partners", "en": "Radif Partners"};
export const AUTHOR_DESC: Record<string, string> = {"fi": "Radif Partners laskee pörssisähkön todellisen hinnan Suomessa: Suomen tarjousalueen vartti- ja tuntihinnat, paikallisen verkkoyhtiön siirtomaksu ja perusmaksu verkkoyhtiöiden omista hinnastoista, sähkövero ja huoltovarmuusmaksu Verohallinnon verotaulukosta sekä arvonlisävero 25,5 %. Hinnat päivittyvät joka päivä automaattisesti.", "en": "Radif Partners computes the real price of exchange electricity in Finland: quarter-hour and hourly prices for the Finnish bidding zone, the local network operator's transfer and basic fees taken from each operator's own price list, the electricity tax and security-of-supply fee from the Finnish Tax Administration's table, and 25.5% VAT. Prices refresh automatically every day."};
/** Sujets sur lesquels l'editeur est competent (schema.org knowsAbout). Ce sont les
 *  themes reellement traites par le site, pas une liste de mots-cles : un sujet
 *  declare ici sans page qui le couvre est une declaration fausse. */
export const KNOWS_ABOUT: Record<string, string[]> = {"fi": ["Pörssisähkön spot-hinta", "Sähkön varttihinta", "Sähkönsiirron hinnat verkkoyhtiöittäin", "Sähkövero ja huoltovarmuusmaksu", "Pörssisähkö vai kiinteä sopimus", "Sähkölaitteiden käyttökustannus"], "en": ["Finnish exchange electricity spot price", "Quarter-hour electricity prices", "Electricity distribution tariffs by network operator", "Finnish electricity tax", "Spot versus fixed-price contracts", "Running cost of household appliances"]};
export const CONTACT_EMAIL = "contact@kokosahko.fi";
export const THEME_COLOR = '#0B5D4B';
export const LOGO_SYMBOL = 'eclair';
export const BING_VERIFY_CODE = '';
export const GOOGLE_VERIFY_CODE = '';
/** Régime : 'none' pour tous les sites (RECETTE §15.6, décision de l'éditeur du 2026-10-06) :
 *  aucun bandeau, aucun cookie, Clarity chargé en mode sans cookie (consentv2 denied).
 *  'opt-in' / 'notice' ne servent plus qu'aux sites anciens qui les portent encore. */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';
export const GA4_ID = '';
/** Projet Microsoft Clarity (compte amradif), chargé sans cookie. Vide = aucune mesure. */
export const CLARITY_ID = '';
export const INDEXNOW_KEY = '6c564391933ccbd2a8662a33e411347c';

/* ------------------------------------------------------------------------- *
 * IDENTITÉ LÉGALE — À COMPLÉTER AVANT LA MISE EN LIGNE
 * Ces champs alimentent la mention légale du pays, la politique de confidentialité,
 * la page contact et le schema Organization. Un champ vide s'affiche en jaune
 * sur le site. Contrôle : `npm run check:legal`.
 * ------------------------------------------------------------------------- */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',  // éditeur de tous les sites du portefeuille (RECETTE §8)
  legalForm: '',
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: "France",
  phone: '',                 // ligne de contact publiée
  registerLabel: "SIREN",
  registerNumber: '',
  vatLabel: "TVA",
  vatNumber: '',             // laisser vide si non assujetti
  jurisdiction: "France",
  supervisoryAuthority: "Commission nationale de l'informatique et des libertés (CNIL)",
  supervisoryAuthorityUrl: "https://www.cnil.fr",
  hosting: { name: 'GitHub, Inc. (GitHub Pages)', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107, United States', phone: '', url: 'https://pages.github.com' },
};

/** Champs sans lesquels le site ne doit pas être mis en ligne. */
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];

/** Profils publics de l'auteur (schema.org sameAs). Laisser vide si aucun. */
export const AUTHOR_SAME_AS: string[] = [];

/** Rythme de revue éditoriale annoncé sur le site, en mois. */
export const REVIEW_CYCLE_MONTHS = 12;
