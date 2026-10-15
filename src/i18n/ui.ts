import type { Locale } from './routes';
const fi = {
  updatedOn: 'Päivitetty', editorialPolicy: 'Toimituksen periaatteet', contactLabel: 'Yhteystiedot', reviewedBy: 'Tarkistanut',
  skipToContent: 'Siirry sisältöön', mainNav: 'Päävalikko', breadcrumbLabel: 'Murupolku', breadcrumbHome: 'Etusivu', menuOpen: 'Avaa valikko',
  faqTitle: 'Usein kysyttyä', relatedCalculators: 'Liittyvät sivut ja laskurit', sourcesTitle: 'Lähteet', writtenBy: 'Kirjoittanut',
  asOf: 'Hinnat ja verot', lastUpdated: 'tarkistettu', footerValidated: 'Lähteet: Nord Pool ja ENTSO-E (pörssihinnat), Verohallinto (sähkövero ja alv), verkkoyhtiöiden hinnastot, Energiavirasto, Tilastokeskus', footerBrowser: 'Lasketaan selaimessasi · tietoja ei lähetetä · maksuton',
  footerDisclaimer: 'Riippumaton sivusto, jonka julkaisee Radif Partners. Ei yhteyttä sähkönmyyjiin, verkkoyhtiöihin, Nord Pooliin eikä viranomaisiin. Luvut ovat arvioita julkaistujen hintojen, verojen ja hinnastojen sekä itse antamiesi tietojen perusteella; sähkönmyyjän ja verkkoyhtiön laskut ratkaisevat. Emme myy sopimuksia emmekä välitä yhteystietoja.', footerPopular: '', notFound: 'Sivua ei löydy.',
  readMore: 'Lue lisää',
};
const en: typeof fi = {
  updatedOn: 'Updated', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Checked by',
  skipToContent: 'Skip to content', mainNav: 'Main menu', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Frequently asked questions', relatedCalculators: 'Related pages and calculators', sourcesTitle: 'Sources', writtenBy: 'Written by',
  asOf: 'Prices and taxes', lastUpdated: 'checked', footerValidated: 'Sources: Nord Pool and ENTSO-E (exchange prices), Finnish Tax Administration (electricity tax and VAT), network operators’ price lists, Energy Authority, Statistics Finland', footerBrowser: 'Calculated in your browser · no data sent · free',
  footerDisclaimer: 'Independent website published by Radif Partners, with no link to any electricity retailer, network operator, Nord Pool or public authority. Figures are estimates only, built from published prices, taxes and price lists and the details you enter; your retailer’s and network operator’s bills are what count. No contracts sold, no referrals.', footerPopular: '', notFound: 'This page does not exist.',
  readMore: 'Read more',
};
export function t(lang: Locale) { return lang === 'en' ? en : fi; }
