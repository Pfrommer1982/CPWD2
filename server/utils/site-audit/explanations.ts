import type { AuditCategoryId, AuditDifficulty, AuditImpact } from '~/types/site-audit'

export type AuditLocale = 'nl' | 'en'

export type LocalizedText = { nl: string; en: string }

export interface AuditExplanationLocalized {
  friendlyTitle: LocalizedText
  description: LocalizedText
  recommendation: LocalizedText
  category: AuditCategoryId | 'other'
  impact: AuditImpact
  difficulty: AuditDifficulty
}

export interface AuditExplanation {
  friendlyTitle: string
  description: string
  recommendation: string
  category: AuditCategoryId | 'other'
  impact: AuditImpact
  difficulty: AuditDifficulty
}

/**
 * Human-friendly NL+EN mapping for known Lighthouse audit IDs (legacy + insight audits).
 * Unknown audits use category fallbacks via getCategoryFallbackFix().
 */
export const AUDIT_EXPLANATIONS: Record<string, AuditExplanationLocalized> = {
  'render-blocking-resources': {
    friendlyTitle: { nl: 'Bestanden vertragen het eerste beeld', en: 'Files delay the first paint' },
    description: { nl: 'Je browser moet eerst een aantal bestanden downloaden en verwerken voordat hij de pagina kan laten zien. Daardoor blijft bezoekers langer op een lege of incomplete pagina kijken.', en: 'Your browser must download and process several files before it can show the page. Visitors wait longer on a blank or incomplete screen.' },
    recommendation: { nl: 'Laad kritieke CSS inline of asynchroon, stel niet-kritieke scripts uit met defer/async, en beperk grote stylesheets boven de vouw.', en: 'Inline or asynchronously load critical CSS, defer non-critical scripts with defer/async, and keep large stylesheets above the fold to a minimum.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'medium',
  },
  'unused-javascript': {
    friendlyTitle: { nl: 'Ongebruikte JavaScript wordt meegestuurd', en: 'Unused JavaScript is shipped' },
    description: { nl: 'Er wordt JavaScript geladen die bij het eerste bezoek niet nodig is. Dat kost tijd en data, vooral op mobiel.', en: 'JavaScript loads that is not needed on the first visit. That costs time and data, especially on mobile.' },
    recommendation: { nl: 'Splits code per route (code splitting), verwijder dode libraries en laad zware scripts pas wanneer ze echt nodig zijn.', en: 'Split code per route, remove dead libraries, and load heavy scripts only when they are actually needed.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'medium',
  },
  'unused-css-rules': {
    friendlyTitle: { nl: 'Ongebruikte CSS maakt de pagina zwaarder', en: 'Unused CSS makes the page heavier' },
    description: { nl: 'Stylesheets bevatten regels die op deze pagina niet gebruikt worden. De browser moet die toch downloaden en verwerken.', en: 'Stylesheets include rules this page never uses. The browser still has to download and process them.' },
    recommendation: { nl: 'Verwijder ongebruikte CSS, splits styles per component/pagina, en vermijd het laden van complete framework-CSS als je maar een klein deel nodig hebt.', en: 'Remove unused CSS, split styles per component/page, and avoid loading full framework CSS when you only need a small part.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'medium',
  },
  'uses-responsive-images': {
    friendlyTitle: { nl: 'Afbeeldingen zijn te groot voor het scherm', en: 'Images are too large for the screen' },
    description: { nl: 'Je website verstuurt afbeeldingen die groter zijn dan nodig. Bezoekers downloaden meer data en de pagina verschijnt later.', en: 'The site sends images larger than needed. Visitors download more data and the page appears later.' },
    recommendation: { nl: 'Lever afbeeldingen ongeveer op het formaat waarop ze worden getoond (srcset/sizes) en gebruik moderne formaten zoals WebP of AVIF.', en: 'Serve images roughly at the size they are shown (srcset/sizes) and use modern formats such as WebP or AVIF.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'easy',
  },
  'uses-optimized-images': {
    friendlyTitle: { nl: 'Afbeeldingen zijn niet efficiënt gecomprimeerd', en: 'Images are not efficiently compressed' },
    description: { nl: 'Beelden kunnen kleiner zonder zichtbaar kwaliteitsverlies. Nu kosten ze onnodig veel bandbreedte.', en: 'Images can be smaller without visible quality loss. Right now they waste bandwidth.' },
    recommendation: { nl: 'Comprimeer JPEG/PNG, of beter: converteer naar WebP/AVIF via je CDN of build-pipeline.', en: 'Compress JPEG/PNG, or better: convert to WebP/AVIF via your CDN or build pipeline.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'easy',
  },
  'modern-image-formats': {
    friendlyTitle: { nl: 'Oudere afbeeldingsformaten vertragen laden', en: 'Older image formats slow loading' },
    description: { nl: 'De pagina gebruikt vooral JPEG/PNG terwijl modernere formaten dezelfde kwaliteit met minder bytes kunnen leveren.', en: 'The page mostly uses JPEG/PNG while newer formats can deliver the same quality with fewer bytes.' },
    recommendation: { nl: 'Serveer WebP of AVIF met een veilige fallback voor oudere browsers.', en: 'Serve WebP or AVIF with a safe fallback for older browsers.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'easy',
  },
  'offscreen-images': {
    friendlyTitle: { nl: 'Afbeeldingen onder de vouw laden te vroeg', en: 'Below-the-fold images load too early' },
    description: { nl: 'Beelden die je eerst niet ziet, worden toch meteen opgehaald. Dat concurreert met belangrijke content bovenaan.', en: 'Images you do not see yet are fetched immediately. That competes with important content at the top.' },
    recommendation: { nl: 'Zet lazy-loading aan voor afbeeldingen buiten het eerste scherm (`loading="lazy"` of native lazy via framework).', en: 'Enable lazy-loading for images outside the first screen (`loading="lazy"` or native lazy via your framework).' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'easy',
  },
  'uses-text-compression': {
    friendlyTitle: { nl: 'Tekstbestanden worden niet gecomprimeerd', en: 'Text files are not compressed' },
    description: { nl: 'HTML, CSS en JavaScript komen ongecomprimeerd binnen. Dat maakt downloads groter dan nodig.', en: 'HTML, CSS and JavaScript arrive uncompressed. Downloads become larger than necessary.' },
    recommendation: { nl: 'Zet Gzip of Brotli aan op je hosting/CDN voor tekstuele responses.', en: 'Enable Gzip or Brotli on your hosting/CDN for text responses.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'easy',
  },
  'uses-long-cache-ttl': {
    friendlyTitle: { nl: 'Bestanden worden te kort in de cache gehouden', en: 'Files are cached for too short a time' },
    description: { nl: 'Terugkerende bezoekers moeten statische bestanden opnieuw downloaden, terwijl die zelden wijzigen.', en: 'Returning visitors must re-download static files that rarely change.' },
    recommendation: { nl: 'Stel lange cache-headers in voor gehashte assets (CSS/JS/fonts/images) via CDN of server.', en: 'Set long cache headers for hashed assets (CSS/JS/fonts/images) via CDN or server.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'easy',
  },
  'server-response-time': {
    friendlyTitle: { nl: 'De server reageert te traag', en: 'The server responds too slowly' },
    description: { nl: 'Voordat de browser iets kan tonen, wacht hij op het eerste antwoord van je server. Die wachttijd is nu te lang.', en: 'Before the browser can show anything, it waits for the first server response. That wait is too long.' },
    recommendation: { nl: 'Optimaliseer backend/TTFB: caching, snellere hosting, edge/CDN, en vermijd zware server-rendering zonder cache.', en: 'Improve backend/TTFB: caching, faster hosting, edge/CDN, and avoid heavy server rendering without cache.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'hard',
  },
  redirects: {
    friendlyTitle: { nl: 'Doorverwijzingen kosten extra tijd', en: 'Redirects cost extra time' },
    description: { nl: 'Voor de echte pagina komen er redirects. Elke hop voegt netwerkvertraging toe.', en: 'Redirects happen before the real page. Each hop adds network delay.' },
    recommendation: { nl: 'Verwijs in één stap naar de definitieve URL (https + juiste host + slash-conventie).', en: 'Point to the final URL in one step (https + correct host + slash convention).' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'easy',
  },
  'unminified-css': {
    friendlyTitle: { nl: 'CSS is niet verkleind', en: 'CSS is not minified' },
    description: { nl: 'Stylesheets bevatten nog witruimte en commentaar die in productie niet nodig zijn.', en: 'Stylesheets still contain whitespace and comments that production does not need.' },
    recommendation: { nl: 'Minify CSS in je build of via de CDN.', en: 'Minify CSS in your build or via the CDN.' },
    category: 'performance',
    impact: 'low',
    difficulty: 'easy',
  },
  'unminified-javascript': {
    friendlyTitle: { nl: 'JavaScript is niet verkleind', en: 'JavaScript is not minified' },
    description: { nl: 'Scripts zijn groter dan nodig door ontbrekende minificatie.', en: 'Scripts are larger than needed because minification is missing.' },
    recommendation: { nl: 'Minify/bundle JS in productiebuilds.', en: 'Minify/bundle JS in production builds.' },
    category: 'performance',
    impact: 'low',
    difficulty: 'easy',
  },
  'efficient-animated-content': {
    friendlyTitle: { nl: 'Animaties belasten het laden', en: 'Animations weigh down loading' },
    description: { nl: 'Grote geanimeerde beelden of GIF-achtige content kosten veel data en CPU.', en: 'Large animated images or GIF-like content cost a lot of data and CPU.' },
    recommendation: { nl: 'Vervang zware GIF’s door video (MP4/WebM) of lichtere CSS/Lottie-animaties.', en: 'Replace heavy GIFs with video (MP4/WebM) or lighter CSS/Lottie animations.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'medium',
  },
  'total-byte-weight': {
    friendlyTitle: { nl: 'De pagina is te zwaar', en: 'The page is too heavy' },
    description: { nl: 'Het totaal aan te downloaden data is hoog. Op traagere netwerken voelt de site sloom.', en: 'Total download size is high. On slower networks the site feels sluggish.' },
    recommendation: { nl: 'Verklein afbeeldingen, scripts en fonts; verwijder overbodige third-party tags.', en: 'Shrink images, scripts and fonts; remove unnecessary third-party tags.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'medium',
  },
  'dom-size': {
    friendlyTitle: { nl: 'De pagina-structuur is te complex', en: 'The page structure is too complex' },
    description: { nl: 'Er zijn erg veel HTML-elementen. Dat maakt renderen en interactie zwaarder, vooral op mobiel.', en: 'There are too many HTML elements. That makes rendering and interaction heavier, especially on mobile.' },
    recommendation: { nl: 'Vereenvoudig markup, paginaer lange lijsten, en vermijd diepe nesting zonder reden.', en: 'Simplify markup, paginate long lists, and avoid deep nesting without a reason.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'medium',
  },
  'lcp-lazy-loaded': {
    friendlyTitle: { nl: 'Belangrijkste beeld laadt te laat', en: 'The main image loads too late' },
    description: { nl: 'Het grootste zichtbare element (vaak een hero-beeld) wordt lui geladen, terwijl bezoekers dat juist meteen willen zien.', en: 'The largest visible element (often a hero image) is lazy-loaded, while visitors need it immediately.' },
    recommendation: { nl: 'Laad het LCP-element eager, geef prioriteit (`fetchpriority="high"`) en reserveer ruimte met width/height.', en: 'Load the LCP element eagerly, set priority (`fetchpriority="high"`), and reserve space with width/height.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'easy',
  },
  'prioritize-lcp-image': {
    friendlyTitle: { nl: 'Belangrijkste beeld krijgt te weinig prioriteit', en: 'The main image gets too little priority' },
    description: { nl: 'De browser weet niet dat dit beeld het belangrijkst is, dus andere downloads gaan ervoor.', en: 'The browser does not know this image matters most, so other downloads go first.' },
    recommendation: { nl: 'Markeer het LCP-beeld met hoge prioriteit en preload waar zinvol.', en: 'Mark the LCP image with high priority and preload where it helps.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'easy',
  },
  'meta-description': {
    friendlyTitle: { nl: 'Meta-beschrijving ontbreekt', en: 'Meta description is missing' },
    description: { nl: 'Zoekmachines missen een korte samenvatting. In zoekresultaten ziet je pagina er dan minder aantrekkelijk uit.', en: 'Search engines miss a short summary. Your page looks less appealing in search results.' },
    recommendation: { nl: 'Voeg per belangrijke pagina een unieke meta description toe van ongeveer 120-160 tekens.', en: 'Add a unique meta description of about 120-160 characters on every important page.' },
    category: 'seo',
    impact: 'medium',
    difficulty: 'easy',
  },
  'document-title': {
    friendlyTitle: { nl: 'Paginatitel ontbreekt of is onduidelijk', en: 'Page title is missing or unclear' },
    description: { nl: 'Zonder goede titel snappen zoekmachines en tabbladen minder goed waar de pagina over gaat.', en: 'Without a good title, search engines and browser tabs understand the page less clearly.' },
    recommendation: { nl: 'Gebruik een duidelijke, unieke `<title>` met merk + onderwerp.', en: 'Use a clear, unique `<title>` with brand + topic.' },
    category: 'seo',
    impact: 'high',
    difficulty: 'easy',
  },
  'is-crawlable': {
    friendlyTitle: { nl: 'Zoekmachines worden mogelijk geblokkeerd', en: 'Search engines may be blocked' },
    description: { nl: 'Robots-meta of headers kunnen crawlers tegenhouden. Dan verschijn je niet (goed) in zoekresultaten.', en: 'Robots meta or headers can block crawlers. Then you may not appear well in search results.' },
    recommendation: { nl: 'Controleer robots.txt en meta robots; blokkeer alleen wat bewust privé moet blijven.', en: 'Check robots.txt and meta robots; only block what must stay private.' },
    category: 'seo',
    impact: 'high',
    difficulty: 'easy',
  },
  'robots-txt': {
    friendlyTitle: { nl: 'robots.txt is problematisch', en: 'robots.txt is problematic' },
    description: { nl: 'De robots.txt is ongeldig of blokkeert te veel. Crawlers raken in de war.', en: 'robots.txt is invalid or blocks too much. Crawlers get confused.' },
    recommendation: { nl: 'Herstel de robots.txt-syntax en beperk blokkades tot echt private paden.', en: 'Fix robots.txt syntax and limit blocks to truly private paths.' },
    category: 'seo',
    impact: 'high',
    difficulty: 'easy',
  },
  hreflang: {
    friendlyTitle: { nl: 'Taal-alternatieven zijn niet goed gekoppeld', en: 'Language alternatives are not linked well' },
    description: { nl: 'Meertalige pagina’s missen correcte hreflang-signalen. Zoekmachines tonen mogelijk de verkeerde taalversie.', en: 'Multilingual pages miss correct hreflang signals. Search engines may show the wrong language version.' },
    recommendation: { nl: 'Voeg valide hreflang-links toe tussen taalvarianten, inclusief x-default waar relevant.', en: 'Add valid hreflang links between language variants, including x-default where relevant.' },
    category: 'seo',
    impact: 'medium',
    difficulty: 'medium',
  },
  canonical: {
    friendlyTitle: { nl: 'Canonical URL ontbreekt of klopt niet', en: 'Canonical URL is missing or wrong' },
    description: { nl: 'Zonder duidelijke canonical kunnen duplicate URL’s elkaar in zoekresultaten beconcurreren.', en: 'Without a clear canonical, duplicate URLs can compete with each other in search results.' },
    recommendation: { nl: 'Zet op elke indexeerbare pagina een correcte canonical naar de voorkeurs-URL.', en: 'Set a correct canonical to the preferred URL on every indexable page.' },
    category: 'seo',
    impact: 'medium',
    difficulty: 'easy',
  },
  'link-text': {
    friendlyTitle: { nl: 'Linkteksten zijn te vaag', en: 'Link text is too vague' },
    description: { nl: 'Links als “klik hier” zeggen weinig over de bestemming: slecht voor SEO én toegankelijkheid.', en: 'Links like "click here" say little about the destination: bad for SEO and accessibility.' },
    recommendation: { nl: 'Gebruik beschrijvende ankerteksten die het doel van de link samenvatten.', en: 'Use descriptive anchor text that summarizes the link target.' },
    category: 'seo',
    impact: 'low',
    difficulty: 'easy',
  },
  'crawlable-anchors': {
    friendlyTitle: { nl: 'Sommige links zijn niet crawlbaar', en: 'Some links are not crawlable' },
    description: { nl: 'Links zonder echte href (alleen JavaScript) worden door zoekmachines vaak overgeslagen.', en: 'Links without a real href (JavaScript only) are often skipped by search engines.' },
    recommendation: { nl: 'Gebruik echte `<a href="...">` voor navigatie; reserveer buttons voor acties.', en: 'Use real `<a href="...">` for navigation; reserve buttons for actions.' },
    category: 'seo',
    impact: 'medium',
    difficulty: 'medium',
  },
  'image-alt': {
    friendlyTitle: { nl: 'Afbeeldingen missen alt-tekst', en: 'Images are missing alt text' },
    description: { nl: 'Zonder alt-tekst snappen screenreaders en zoekmachines niet wat er op een beeld staat.', en: 'Without alt text, screen readers and search engines do not know what an image shows.' },
    recommendation: { nl: 'Voeg korte, beschrijvende alt-teksten toe; markeer decoratieve beelden bewust leeg (`alt=""`).', en: 'Add short, descriptive alt text; mark decorative images intentionally empty (`alt=""`).' },
    category: 'accessibility',
    impact: 'high',
    difficulty: 'easy',
  },
  'button-name': {
    friendlyTitle: { nl: 'Knoppen missen een toegankelijke naam', en: 'Buttons lack an accessible name' },
    description: { nl: 'Sommige knoppen hebben geen zichtbare of programmatische naam. Hulptechnologie weet dan niet wat ze doen.', en: 'Some buttons have no visible or programmatic name. Assistive tech cannot tell what they do.' },
    recommendation: { nl: 'Geef elke knop zichtbare tekst of een `aria-label` die de actie beschrijft.', en: 'Give every button visible text or an `aria-label` that describes the action.' },
    category: 'accessibility',
    impact: 'high',
    difficulty: 'easy',
  },
  'color-contrast': {
    friendlyTitle: { nl: 'Tekstcontrast is te laag', en: 'Text contrast is too low' },
    description: { nl: 'Tekst is moeilijk leesbaar door te weinig contrast met de achtergrond, vooral buiten in fel licht.', en: 'Text is hard to read because contrast with the background is too weak, especially outdoors.' },
    recommendation: { nl: 'Verhoog contrast tot WCAG AA (ongeveer 4.5:1 voor normale tekst).', en: 'Raise contrast to WCAG AA (about 4.5:1 for normal text).' },
    category: 'accessibility',
    impact: 'high',
    difficulty: 'easy',
  },
  'heading-order': {
    friendlyTitle: { nl: 'Koppen springen van niveau', en: 'Headings skip levels' },
    description: { nl: 'De heading-hiërarchie is rommelig (bijv. H2 → H4). Dat verwart navigatie met screenreaders.', en: 'Heading hierarchy is messy (for example H2 to H4). That confuses screen reader navigation.' },
    recommendation: { nl: 'Gebruik koppen in logische volgorde zonder niveaus over te slaan.', en: 'Use headings in logical order without skipping levels.' },
    category: 'accessibility',
    impact: 'medium',
    difficulty: 'easy',
  },
  label: {
    friendlyTitle: { nl: 'Formuliervelden missen labels', en: 'Form fields are missing labels' },
    description: { nl: 'Invoervelden zonder label zijn lastig voor screenreaders en voor iedereen die de placeholder kwijtraakt.', en: 'Inputs without a label are hard for screen readers and for anyone who loses the placeholder.' },
    recommendation: { nl: 'Koppel elk veld aan een zichtbaar `<label>` of een duidelijke `aria-label`.', en: 'Connect every field to a visible `<label>` or a clear `aria-label`.' },
    category: 'accessibility',
    impact: 'high',
    difficulty: 'easy',
  },
  'link-name': {
    friendlyTitle: { nl: 'Links missen een toegankelijke naam', en: 'Links lack an accessible name' },
    description: { nl: 'Sommige links hebben geen tekst of aria-naam. Bezoekers met hulpsoftware horen dan “link” zonder context.', en: 'Some links have no text or aria name. Assistive tech users then hear "link" with no context.' },
    recommendation: { nl: 'Zorg dat elke link begrijpelijke tekst of een aria-label heeft.', en: 'Make sure every link has understandable text or an aria-label.' },
    category: 'accessibility',
    impact: 'high',
    difficulty: 'easy',
  },
  'html-has-lang': {
    friendlyTitle: { nl: 'Taal van de pagina ontbreekt', en: 'Page language is missing' },
    description: { nl: 'Zonder `lang` op `<html>` weten browsers en screenreaders niet in welke taal ze moeten voorlezen.', en: 'Without `lang` on `<html>`, browsers and screen readers do not know which language to use.' },
    recommendation: { nl: 'Zet `lang="nl"` (of de juiste taalcode) op het html-element.', en: 'Set `lang="en"` (or the correct language code) on the html element.' },
    category: 'accessibility',
    impact: 'medium',
    difficulty: 'easy',
  },
  'meta-viewport': {
    friendlyTitle: { nl: 'Mobiele viewport ontbreekt', en: 'Mobile viewport is missing' },
    description: { nl: 'Zonder viewport-meta schaalt de pagina slecht op telefoons.', en: 'Without a viewport meta tag, the page scales poorly on phones.' },
    recommendation: { nl: 'Voeg `<meta name="viewport" content="width=device-width, initial-scale=1">` toe.', en: 'Add `<meta name="viewport" content="width=device-width, initial-scale=1">`.' },
    category: 'accessibility',
    impact: 'high',
    difficulty: 'easy',
  },
  'is-on-https': {
    friendlyTitle: { nl: 'De site gebruikt geen HTTPS', en: 'The site does not use HTTPS' },
    description: { nl: 'Zonder HTTPS is verkeer niet versleuteld. Browsers markeren de site als onveilig.', en: 'Without HTTPS traffic is not encrypted. Browsers mark the site as unsafe.' },
    recommendation: { nl: 'Activeer HTTPS (Let’s Encrypt/CDN) en redirect HTTP naar HTTPS.', en: 'Enable HTTPS (Let\'s Encrypt/CDN) and redirect HTTP to HTTPS.' },
    category: 'best-practices',
    impact: 'high',
    difficulty: 'medium',
  },
  'errors-in-console': {
    friendlyTitle: { nl: 'Er verschijnen fouten in de browserconsole', en: 'Errors appear in the browser console' },
    description: { nl: 'JavaScript-fouten wijzen op kapotte functionaliteit of verouderde code.', en: 'JavaScript errors point to broken features or outdated code.' },
    recommendation: { nl: 'Open DevTools, reproduceer de fouten, en los de onderliggende JS-problemen op.', en: 'Open DevTools, reproduce the errors, and fix the underlying JS problems.' },
    category: 'best-practices',
    impact: 'medium',
    difficulty: 'medium',
  },
  'geolocation-on-start': {
    friendlyTitle: { nl: 'Locatie wordt meteen gevraagd', en: 'Location is requested immediately' },
    description: { nl: 'De site vraagt geolocation bij het laden. Dat voelt opdringerig en schrikt bezoekers af.', en: 'The site asks for geolocation on load. That feels pushy and scares visitors away.' },
    recommendation: { nl: 'Vraag locatie pas na een duidelijke gebruikersactie.', en: 'Ask for location only after a clear user action.' },
    category: 'best-practices',
    impact: 'medium',
    difficulty: 'easy',
  },
  'notification-on-start': {
    friendlyTitle: { nl: 'Notificaties worden meteen gevraagd', en: 'Notifications are requested immediately' },
    description: { nl: 'Een prompt voor pushmeldingen bij aankomst frustreert bezoekers.', en: 'A push-notification prompt on arrival frustrates visitors.' },
    recommendation: { nl: 'Vraag notificaties pas nadat de waarde duidelijk is en de gebruiker instemt.', en: 'Ask for notifications only after the value is clear and the user opts in.' },
    category: 'best-practices',
    impact: 'medium',
    difficulty: 'easy',
  },
  viewport: {
    friendlyTitle: { nl: 'Viewport-instelling ontbreekt', en: 'Viewport setting is missing' },
    description: { nl: 'Zonder juiste viewport gedraagt de layout zich slecht op mobiel.', en: 'Without a proper viewport, layout behaves poorly on mobile.' },
    recommendation: { nl: 'Voeg een standaard viewport meta-tag toe.', en: 'Add a standard viewport meta tag.' },
    category: 'best-practices',
    impact: 'high',
    difficulty: 'easy',
  },
  'third-party-cookies': {
    friendlyTitle: { nl: 'Third-party cookies worden gebruikt', en: 'Third-party cookies are used' },
    description: { nl: 'Cookies van derden raken beperkt in moderne browsers en kunnen tracking/functionaliteit breken.', en: 'Third-party cookies are limited in modern browsers and can break tracking or features.' },
    recommendation: { nl: 'Verminder third-party cookies; gebruik privacyvriendelijke alternatieven of first-party setups.', en: 'Reduce third-party cookies; use privacy-friendly alternatives or first-party setups.' },
    category: 'best-practices',
    impact: 'low',
    difficulty: 'medium',
  },
  charset: {
    friendlyTitle: { nl: 'Tekencodering ontbreekt', en: 'Character encoding is missing' },
    description: { nl: 'Zonder duidelijke charset kunnen speciale tekens verkeerd worden weergegeven.', en: 'Without a clear charset, special characters can render incorrectly.' },
    recommendation: { nl: 'Voeg `<meta charset="utf-8">` vroeg in de `<head>` toe.', en: 'Add `<meta charset="utf-8">` early in the `<head>`.' },
    category: 'best-practices',
    impact: 'low',
    difficulty: 'easy',
  },
  doctype: {
    friendlyTitle: { nl: 'HTML doctype ontbreekt', en: 'HTML doctype is missing' },
    description: { nl: 'Zonder doctype kan de browser in quirks mode belanden met onvoorspelbare layout.', en: 'Without a doctype the browser may enter quirks mode with unpredictable layout.' },
    recommendation: { nl: 'Zet `<!DOCTYPE html>` helemaal bovenaan het document.', en: 'Put `<!DOCTYPE html>` at the very top of the document.' },
    category: 'best-practices',
    impact: 'medium',
    difficulty: 'easy',
  },
  'render-blocking-insight': {
    friendlyTitle: { nl: 'Render-blocking bestanden houden de pagina tegen', en: 'Render-blocking files hold the page back' },
    description: { nl: 'CSS of JavaScript blokkeert het eerste beeld. Bezoekers wachten langer op zichtbare content.', en: 'CSS or JavaScript blocks the first paint. Visitors wait longer for visible content.' },
    recommendation: { nl: 'Zet niet-kritieke scripts op `defer`/`async`, inline alleen kritieke CSS, en splits grote stylesheets zodat boven-de-vouw sneller kan renderen.', en: 'Put non-critical scripts on `defer`/`async`, inline only critical CSS, and split large stylesheets so above-the-fold can render faster.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'medium',
  },
  'image-delivery-insight': {
    friendlyTitle: { nl: 'Afbeeldingen worden inefficiënt aangeleverd', en: 'Images are delivered inefficiently' },
    description: { nl: 'Beelden zijn te groot, in een ouder formaat, of niet afgestemd op het scherm. Dat kost bandbreedte en laadtijd.', en: 'Images are too large, in an older format, or not matched to the screen. That costs bandwidth and load time.' },
    recommendation: { nl: 'Serveer moderne formaten (WebP/AVIF), juiste afmetingen via `srcset`/`sizes`, en comprimeer agressief via CDN of build-pipeline.', en: 'Serve modern formats (WebP/AVIF), correct dimensions via `srcset`/`sizes`, and compress aggressively via CDN or build pipeline.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'easy',
  },
  'network-dependency-tree-insight': {
    friendlyTitle: { nl: 'Kritieke verzoeken staan te diep in de keten', en: 'Critical requests are chained too deeply' },
    description: { nl: 'Belangrijke bestanden laden pas nadat andere requests klaar zijn. Elke schakel verlengt de wachttijd tot de pagina zichtbaar is.', en: 'Important files only load after other requests finish. Each link lengthens the wait until the page is visible.' },
    recommendation: { nl: 'Verkort de kritieke keten: minder afhankelijkheden, kleinere kritieke bytes, en laad top-resources eerder (preload/priority waar zinvol).', en: 'Shorten the critical chain: fewer dependencies, smaller critical bytes, and load top resources earlier (preload/priority where useful).' },
    category: 'performance',
    impact: 'high',
    difficulty: 'medium',
  },
  'cls-culprits-insight': {
    friendlyTitle: { nl: 'Layout verspringt tijdens het laden', en: 'Layout shifts while loading' },
    description: { nl: 'Elementen schuiven onverwacht. Bezoekers mis-klikken of verliezen hun plek op de pagina.', en: 'Elements jump unexpectedly. Visitors mis-click or lose their place on the page.' },
    recommendation: { nl: 'Reserveer ruimte met width/height of aspect-ratio, vermijd late fonts/ads zonder placeholder, en laad hero-media stabiel in.', en: 'Reserve space with width/height or aspect-ratio, avoid late fonts/ads without placeholders, and load hero media stably.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'medium',
  },
  'lcp-breakdown-insight': {
    friendlyTitle: { nl: 'Het belangrijkste element laadt te traag', en: 'The main element loads too slowly' },
    description: { nl: 'Largest Contentful Paint is te hoog. Bezoekers zien het kernbeeld of de kerntekst te laat.', en: 'Largest Contentful Paint is too high. Visitors see the key image or text too late.' },
    recommendation: { nl: 'Versnel het LCP-element: snellere server/CDN, geen lazy-load op de hero, `fetchpriority="high"`, en minder render-blocking CSS/JS ervoor.', en: 'Speed up the LCP element: faster server/CDN, no lazy-load on the hero, `fetchpriority="high"`, and less render-blocking CSS/JS ahead of it.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'medium',
  },
  'lcp-discovery-insight': {
    friendlyTitle: { nl: 'Het LCP-element wordt te laat ontdekt', en: 'The LCP element is discovered too late' },
    description: { nl: 'De browser vindt het belangrijkste beeld of tekstblok pas laat in de laadtijdlijn.', en: 'The browser finds the main image or text block late in the load timeline.' },
    recommendation: { nl: 'Zorg dat het LCP-element vroeg in de HTML staat, preload het hero-beeld indien nodig, en vermijd dat het achter client-side rendering schuilgaat.', en: 'Put the LCP element early in the HTML, preload the hero image if needed, and avoid hiding it behind client-side rendering.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'medium',
  },
  'document-latency-insight': {
    friendlyTitle: { nl: 'Het HTML-document komt te traag binnen', en: 'The HTML document arrives too slowly' },
    description: { nl: 'De eerste HTML-response duurt te lang (redirects, trage server of zware backend).', en: 'The first HTML response takes too long (redirects, slow server, or heavy backend).' },
    recommendation: { nl: 'Verwijder onnodige redirects, cache HTML of edge-render waar mogelijk, en verkort server-TTFB (hosting, DB, CDN).', en: 'Remove unnecessary redirects, cache HTML or edge-render where possible, and shorten server TTFB (hosting, DB, CDN).' },
    category: 'performance',
    impact: 'high',
    difficulty: 'hard',
  },
  'third-parties-insight': {
    friendlyTitle: { nl: 'Third-party scripts belasten de laadtijd', en: 'Third-party scripts hurt load time' },
    description: { nl: 'Scripts van derden (analytics, chat, ads, embeds) concurreren met jouw eigen content.', en: 'Third-party scripts (analytics, chat, ads, embeds) compete with your own content.' },
    recommendation: { nl: 'Laad third-parties later of conditioneel, verwijder ongebruikte tags, en kies lichtere alternatieven of tag managers met strikte control.', en: 'Load third parties later or conditionally, remove unused tags, and pick lighter alternatives or tightly controlled tag managers.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'medium',
  },
  'duplicated-javascript-insight': {
    friendlyTitle: { nl: 'Dubbele JavaScript wordt meegestuurd', en: 'Duplicate JavaScript is shipped' },
    description: { nl: 'Dezelfde code of libraries laden meerdere keren. Dat vergroot de bundle zonder extra waarde.', en: 'The same code or libraries load multiple times. That grows the bundle without extra value.' },
    recommendation: { nl: 'Dedupliceer dependencies in je bundler, deel één versie van libraries, en vermijd het laden van dezelfde SDK via meerdere tags.', en: 'Deduplicate dependencies in your bundler, share one library version, and avoid loading the same SDK via multiple tags.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'medium',
  },
  'font-display-insight': {
    friendlyTitle: { nl: 'Fonts blokkeren of vertragen tekst', en: 'Fonts block or delay text' },
    description: { nl: 'Webfonts zorgen voor onzichtbare of late tekst (FOIT/FOUT) tijdens het laden.', en: 'Web fonts cause invisible or late text (FOIT/FOUT) while loading.' },
    recommendation: { nl: 'Gebruik `font-display: swap` (of optional), preload kritieke fonts, en beperk het aantal font-varianten.', en: 'Use `font-display: swap` (or optional), preload critical fonts, and limit font variants.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'easy',
  },
  'forced-reflow-insight': {
    friendlyTitle: { nl: 'Gedwongen layout-herberekeningen vertragen interactie', en: 'Forced layout recalculations slow interaction' },
    description: { nl: 'JavaScript leest en schrijft layout om beurten, waardoor de browser extra reflow-werk doet.', en: 'JavaScript reads and writes layout in turns, forcing extra browser reflow work.' },
    recommendation: { nl: 'Batch DOM-reads en -writes, vermijd layout thrashing in scroll/resize-handlers, en meet eerst met Performance-panel.', en: 'Batch DOM reads and writes, avoid layout thrashing in scroll/resize handlers, and measure first in the Performance panel.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'hard',
  },
  'legacy-javascript-insight': {
    friendlyTitle: { nl: 'Verouderde JavaScript maakt bundles zwaarder', en: 'Legacy JavaScript makes bundles heavier' },
    description: { nl: 'Er wordt polyfill/transpile-code meegestuurd die moderne browsers niet nodig hebben.', en: 'Polyfill/transpile code ships that modern browsers do not need.' },
    recommendation: { nl: 'Stel modernere browser-targets in, schakel onnodige polyfills uit, en lever differential serving of native ES-modules waar mogelijk.', en: 'Set modern browser targets, disable unnecessary polyfills, and serve differential builds or native ES modules where possible.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'medium',
  },
  'modern-http-insight': {
    friendlyTitle: { nl: 'HTTP-protocol is niet optimaal', en: 'HTTP protocol is not optimal' },
    description: { nl: 'De site mist voordelen van modernere HTTP (bijv. HTTP/2 of HTTP/3) voor parallel laden.', en: 'The site misses benefits of modern HTTP (for example HTTP/2 or HTTP/3) for parallel loading.' },
    recommendation: { nl: 'Activeer HTTP/2 of HTTP/3 op je hosting/CDN en lever assets via die stack.', en: 'Enable HTTP/2 or HTTP/3 on your hosting/CDN and serve assets over that stack.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'easy',
  },
  'cache-insight': {
    friendlyTitle: { nl: 'Caching van assets is te zwak', en: 'Asset caching is too weak' },
    description: { nl: 'Terugkerende bezoekers downloaden te vaak dezelfde bestanden opnieuw.', en: 'Returning visitors re-download the same files too often.' },
    recommendation: { nl: 'Zet lange cache-TTL op gehashte static assets en gebruik immutable cache-headers via CDN/server.', en: 'Set long cache TTL on hashed static assets and use immutable cache headers via CDN/server.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'easy',
  },
  'viewport-insight': {
    friendlyTitle: { nl: 'Mobiele viewport is niet goed ingesteld', en: 'Mobile viewport is not set correctly' },
    description: { nl: 'Zonder correcte viewport schaalt de pagina slecht op telefoons en voelt de layout verkeerd.', en: 'Without a correct viewport the page scales poorly on phones and layout feels wrong.' },
    recommendation: { nl: 'Voeg `<meta name="viewport" content="width=device-width, initial-scale=1">` toe in de `<head>`.', en: 'Add `<meta name="viewport" content="width=device-width, initial-scale=1">` in the `<head>`.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'easy',
  },
  'dom-size-insight': {
    friendlyTitle: { nl: 'De DOM is te groot of te diep', en: 'The DOM is too large or too deep' },
    description: { nl: 'Te veel HTML-nodes maken renderen en interactie zwaarder, vooral op mobiel.', en: 'Too many HTML nodes make rendering and interaction heavier, especially on mobile.' },
    recommendation: { nl: 'Vereenvoudig markup, paginaer lange lijsten, virtualiseer zware views, en vermijd diepe nesting zonder reden.', en: 'Simplify markup, paginate long lists, virtualize heavy views, and avoid deep nesting without a reason.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'medium',
  },
  'inp-breakdown-insight': {
    friendlyTitle: { nl: 'Interacties reageren te traag', en: 'Interactions respond too slowly' },
    description: { nl: 'Na klikken of typen duurt het te lang voordat de pagina visueel reageert (INP).', en: 'After clicks or typing it takes too long before the page responds visually (INP).' },
    recommendation: { nl: 'Splits lange taken, stel zwaar werk uit tot na interactie, en beperk main-thread werk van third-party scripts.', en: 'Split long tasks, defer heavy work until after interaction, and reduce main-thread work from third-party scripts.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'hard',
  },
  'bootup-time': {
    friendlyTitle: { nl: 'JavaScript-start kost te veel tijd', en: 'JavaScript startup takes too long' },
    description: { nl: 'Scripts hebben te lang nodig om te parsen en uit te voeren voordat de pagina bruikbaar is.', en: 'Scripts take too long to parse and run before the page is usable.' },
    recommendation: { nl: 'Verklein bundles, split code per route, en laad niet-kritieke JS pas na interactie of idle time.', en: 'Shrink bundles, split code per route, and load non-critical JS after interaction or idle time.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'medium',
  },
  'mainthread-work-breakdown': {
    friendlyTitle: { nl: 'De main thread is te druk', en: 'The main thread is too busy' },
    description: { nl: 'Te veel script-, style- of layout-werk op de main thread houdt interactie en rendering tegen.', en: 'Too much script, style, or layout work on the main thread blocks interaction and rendering.' },
    recommendation: { nl: 'Verminder JS-uitvoering, vereenvoudig CSS, en verplaats zwaar werk naar Web Workers waar het kan.', en: 'Reduce JS execution, simplify CSS, and move heavy work to Web Workers where you can.' },
    category: 'performance',
    impact: 'high',
    difficulty: 'hard',
  },
  'font-display': {
    friendlyTitle: { nl: 'Font-weergave blokkeert tekst', en: 'Font display blocks text' },
    description: { nl: 'Webfonts houden tekst onzichtbaar of laten hem laat verschijnen.', en: 'Web fonts keep text invisible or make it appear late.' },
    recommendation: { nl: 'Zet `font-display: swap` (of optional) en preload alleen de fonts die boven de vouw nodig zijn.', en: 'Set `font-display: swap` (or optional) and preload only fonts needed above the fold.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'easy',
  },
  'uses-rel-preconnect': {
    friendlyTitle: { nl: 'Belangrijke origins missen preconnect', en: 'Important origins miss preconnect' },
    description: { nl: 'Verbindingen naar kritieke third-party origins starten te laat.', en: 'Connections to critical third-party origins start too late.' },
    recommendation: { nl: 'Voeg `rel="preconnect"` toe voor origins die vroeg nodig zijn (fonts, CDN, kritieke API).', en: 'Add `rel="preconnect"` for origins needed early (fonts, CDN, critical API).' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'easy',
  },
  'unsized-images': {
    friendlyTitle: { nl: 'Afbeeldingen missen vaste afmetingen', en: 'Images lack fixed dimensions' },
    description: { nl: 'Beelden zonder width/height veroorzaken layout shifts wanneer ze binnenkomen.', en: 'Images without width/height cause layout shifts when they arrive.' },
    recommendation: { nl: 'Zet width en height (of CSS aspect-ratio) op elke content-afbeelding.', en: 'Set width and height (or CSS aspect-ratio) on every content image.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'easy',
  },
  'bf-cache': {
    friendlyTitle: { nl: 'Back/forward cache wordt geblokkeerd', en: 'Back/forward cache is blocked' },
    description: { nl: 'De pagina kan niet uit de bfcache komen, waardoor terug-navigatie trager aanvoelt.', en: 'The page cannot restore from bfcache, so back navigation feels slower.' },
    recommendation: { nl: 'Vermijd unload-handlers en andere bfcache-blockers; test terug-navigatie in DevTools Application > Cache.', en: 'Avoid unload handlers and other bfcache blockers; test back navigation in DevTools Application > Cache.' },
    category: 'performance',
    impact: 'medium',
    difficulty: 'medium',
  },
  'target-size': {
    friendlyTitle: { nl: 'Klikvlakken zijn te klein', en: 'Tap targets are too small' },
    description: { nl: 'Knoppen of links zijn te klein of te dicht op elkaar voor comfortabel tippen op mobiel.', en: 'Buttons or links are too small or too close for comfortable tapping on mobile.' },
    recommendation: { nl: 'Maak interactieve elementen minstens ongeveer 48x48 CSS-pixels en geef voldoende tussenruimte.', en: 'Make interactive elements about 48x48 CSS pixels and give enough spacing.' },
    category: 'accessibility',
    impact: 'medium',
    difficulty: 'easy',
  },
  list: {
    friendlyTitle: { nl: 'Lijsten zijn semantisch niet correct', en: 'Lists are not semantically correct' },
    description: { nl: 'Lijst-markup klopt niet (bijv. verkeerde child-elementen). Hulptechnologie navigeert dan slechter.', en: 'List markup is invalid (for example wrong child elements). Assistive tech navigates worse.' },
    recommendation: { nl: 'Gebruik valide `<ul>`/`<ol>`/`<li>`-structuren of rol-equivalenten die bij de inhoud passen.', en: 'Use valid `<ul>`/`<ol>`/`<li>` structures or role equivalents that match the content.' },
    category: 'accessibility',
    impact: 'medium',
    difficulty: 'easy',
  },
  listitem: {
    friendlyTitle: { nl: 'Lijstitems staan buiten een lijst', en: 'List items sit outside a list' },
    description: { nl: '`<li>`-elementen horen in een lijstcontainer. Anders faalt semantiek voor screenreaders.', en: '`<li>` elements belong in a list container. Otherwise semantics break for screen readers.' },
    recommendation: { nl: 'Plaats elk `<li>` binnen `<ul>` of `<ol>`, of herstructureer de markup.', en: 'Place each `<li>` inside `<ul>` or `<ol>`, or restructure the markup.' },
    category: 'accessibility',
    impact: 'medium',
    difficulty: 'easy',
  },
  'aria-allowed-attr': {
    friendlyTitle: { nl: 'ARIA-attributen kloppen niet', en: 'ARIA attributes are incorrect' },
    description: { nl: 'Er staan ARIA-attributen op elementen waar ze niet bij horen. Dat verwart hulptechnologie.', en: 'ARIA attributes appear on elements where they do not belong. That confuses assistive tech.' },
    recommendation: { nl: 'Verwijder ongeldige ARIA of pas rol/attributen aan volgens de ARIA-specificatie.', en: 'Remove invalid ARIA or adjust role/attributes to match the ARIA specification.' },
    category: 'accessibility',
    impact: 'medium',
    difficulty: 'medium',
  },
  'aria-required-attr': {
    friendlyTitle: { nl: 'Verplichte ARIA-attributen ontbreken', en: 'Required ARIA attributes are missing' },
    description: { nl: 'Custom widgets missen verplichte ARIA-props, waardoor de staat onduidelijk is.', en: 'Custom widgets miss required ARIA props, so state is unclear.' },
    recommendation: { nl: 'Voeg de vereiste ARIA-attributen toe voor de gekozen rol (bijv. `aria-expanded` op disclosures).', en: 'Add the required ARIA attributes for the chosen role (for example `aria-expanded` on disclosures).' },
    category: 'accessibility',
    impact: 'high',
    difficulty: 'medium',
  },
  'aria-valid-attr-value': {
    friendlyTitle: { nl: 'ARIA-waarden zijn ongeldig', en: 'ARIA values are invalid' },
    description: { nl: 'ARIA-attributen hebben waarden die niet worden herkend.', en: 'ARIA attributes have values that are not recognized.' },
    recommendation: { nl: 'Corrigeer ARIA-waarden naar toegestane tokens/booleans/ids uit de specificatie.', en: 'Correct ARIA values to allowed tokens/booleans/ids from the specification.' },
    category: 'accessibility',
    impact: 'medium',
    difficulty: 'medium',
  },
  'duplicate-id-aria': {
    friendlyTitle: { nl: 'Dubbele IDs breken ARIA-referenties', en: 'Duplicate IDs break ARIA references' },
    description: { nl: 'Meerdere elementen delen dezelfde id. Labels en aria-controls wijzen dan verkeerd.', en: 'Multiple elements share the same id. Labels and aria-controls then point to the wrong place.' },
    recommendation: { nl: 'Maak elke `id` uniek op de pagina en werk aria-verwijzingen bij.', en: 'Make every `id` unique on the page and update aria references.' },
    category: 'accessibility',
    impact: 'high',
    difficulty: 'easy',
  },
  'frame-title': {
    friendlyTitle: { nl: 'Frames missen een titel', en: 'Frames are missing a title' },
    description: { nl: 'Iframes zonder title zijn lastig te begrijpen voor screenreader-gebruikers.', en: 'Iframes without a title are hard to understand for screen reader users.' },
    recommendation: { nl: 'Geef elke iframe een korte, beschrijvende `title`.', en: 'Give every iframe a short, descriptive `title`.' },
    category: 'accessibility',
    impact: 'medium',
    difficulty: 'easy',
  },
  'html-xml-lang-mismatch': {
    friendlyTitle: { nl: 'Taalattributen komen niet overeen', en: 'Language attributes do not match' },
    description: { nl: '`lang` en `xml:lang` wijzen verschillende talen aan.', en: '`lang` and `xml:lang` point to different languages.' },
    recommendation: { nl: 'Zorg dat `lang` en eventueel `xml:lang` dezelfde taalcode gebruiken.', en: 'Make sure `lang` and any `xml:lang` use the same language code.' },
    category: 'accessibility',
    impact: 'low',
    difficulty: 'easy',
  },
  'meta-refresh': {
    friendlyTitle: { nl: 'Meta refresh wordt gebruikt', en: 'Meta refresh is used' },
    description: { nl: 'Automatische refreshes zijn verwarrend en slecht voor toegankelijkheid.', en: 'Automatic refreshes are confusing and bad for accessibility.' },
    recommendation: { nl: 'Vervang meta refresh door een gewone navigatie of een duidelijke gebruikersactie.', en: 'Replace meta refresh with normal navigation or a clear user action.' },
    category: 'best-practices',
    impact: 'medium',
    difficulty: 'easy',
  },
  'js-libraries': {
    friendlyTitle: { nl: 'JavaScript-libraries zijn verouderd', en: 'JavaScript libraries are outdated' },
    description: { nl: 'Bekende libraries met security- of onderhoudsproblemen staan nog op de pagina.', en: 'Known libraries with security or maintenance issues are still on the page.' },
    recommendation: { nl: 'Update of vervang verouderde libraries en verwijder wat je niet meer gebruikt.', en: 'Update or replace outdated libraries and remove what you no longer use.' },
    category: 'best-practices',
    impact: 'medium',
    difficulty: 'medium',
  },
  'inspector-issues': {
    friendlyTitle: { nl: 'De browser meldt inspector-issues', en: 'The browser reports inspector issues' },
    description: { nl: 'Chrome markeert problemen zoals mixed content of cookie-issues die betrouwbaarheid raken.', en: 'Chrome flags problems such as mixed content or cookie issues that hurt reliability.' },
    recommendation: { nl: 'Open DevTools Issues, los de gemelde problemen op (HTTPS, cookies, deprecated API’s).', en: 'Open DevTools Issues and fix the reported problems (HTTPS, cookies, deprecated APIs).' },
    category: 'best-practices',
    impact: 'medium',
    difficulty: 'medium',
  },
  'valid-source-maps': {
    friendlyTitle: { nl: 'Source maps ontbreken of zijn ongeldig', en: 'Source maps are missing or invalid' },
    description: { nl: 'Zonder bruikbare source maps is debuggen van productie-JS lastiger.', en: 'Without usable source maps, debugging production JS is harder.' },
    recommendation: { nl: 'Publiceer geldige source maps voor productiebuilds of lever ze veilig aan je error-monitoring.', en: 'Publish valid source maps for production builds or supply them safely to your error monitoring.' },
    category: 'best-practices',
    impact: 'low',
    difficulty: 'easy',
  },
  'http-status-code': {
    friendlyTitle: { nl: 'De pagina geeft geen succesvolle HTTP-status', en: 'The page does not return a successful HTTP status' },
    description: { nl: 'Een 4xx/5xx-status schaadt SEO en gebruikersvertrouwen.', en: 'A 4xx/5xx status hurts SEO and user trust.' },
    recommendation: { nl: 'Zorg dat indexeerbare pagina’s 200 teruggeven en foutpagina’s bewust als 404/410 serveren.', en: 'Make sure indexable pages return 200 and serve error pages intentionally as 404/410.' },
    category: 'seo',
    impact: 'high',
    difficulty: 'easy',
  },
  plugins: {
    friendlyTitle: { nl: 'Browserplugins worden gevraagd', en: 'Browser plugins are requested' },
    description: { nl: 'Oude plugin-embeds (zoals Flash-achtige patronen) zijn verouderd en onbetrouwbaar.', en: 'Old plugin embeds are outdated and unreliable.' },
    recommendation: { nl: 'Vervang plugin-content door moderne HTML5/video/JS-oplossingen.', en: 'Replace plugin content with modern HTML5/video/JS solutions.' },
    category: 'seo',
    impact: 'low',
    difficulty: 'medium',
  },
}

const CATEGORY_FALLBACK_FIX: Record<AuditCategoryId | 'other', LocalizedText> = {
  performance: {
    nl: 'Verklein wat boven de vouw laadt: comprimeer media, splits/defer JavaScript, beperk render-blocking CSS, en versnel de server-/CDN-response.',
    en: 'Shrink what loads above the fold: compress media, split/defer JavaScript, limit render-blocking CSS, and speed up the server/CDN response.',
  },
  seo: {
    nl: 'Maak de pagina eenduidig vindbaar: unieke title en meta description, crawlbare links met echte hrefs, correcte canonical, en geen onbedoelde noindex.',
    en: 'Make the page clearly discoverable: unique title and meta description, crawlable links with real hrefs, a correct canonical, and no accidental noindex.',
  },
  accessibility: {
    nl: 'Verbeter bedienbaarheid: voldoende contrast, labels op formuliervelden, beschrijvende link-/knopnamen, en een logische koppenstructuur.',
    en: 'Improve usability: enough contrast, labels on form fields, descriptive link/button names, and a logical heading structure.',
  },
  'best-practices': {
    nl: 'Ruim betrouwbaarheidsproblemen op: forceer HTTPS, los console-/inspector-fouten op, en vermijd opdringerige prompts of verouderde patronen bij het laden.',
    en: 'Clean up reliability issues: enforce HTTPS, fix console/inspector errors, and avoid pushy prompts or outdated patterns on load.',
  },
  other: {
    nl: 'Pak de oorzaak gericht aan: reproduceer het issue in Chrome DevTools, meet het effect, en pas de concrete oorzaak (code, media, server of third-party) aan tot de score structureel verbetert.',
    en: 'Fix the root cause directly: reproduce the issue in Chrome DevTools, measure the impact, and change the concrete cause (code, media, server, or third party) until the score improves structurally.',
  },
}

const METRIC_EXPLANATIONS: Record<string, LocalizedText> = {
  'first-contentful-paint': {
    nl: 'Hoe snel het eerste tekst- of beeldelement verschijnt.',
    en: 'How quickly the first text or image element appears.',
  },
  'largest-contentful-paint': {
    nl: 'Hoe lang het duurt voordat het belangrijkste zichtbare onderdeel van je pagina verschijnt.',
    en: 'How long it takes before the main visible part of your page appears.',
  },
  'total-blocking-time': {
    nl: 'Hoe lang de pagina geblokkeerd wordt door zwaar werk, waardoor klikken traag aanvoelen.',
    en: 'How long the page is blocked by heavy work, which makes clicks feel slow.',
  },
  'cumulative-layout-shift': {
    nl: 'Hoeveel de layout onverwacht verspringt tijdens het laden.',
    en: 'How much the layout shifts unexpectedly while loading.',
  },
  'speed-index': {
    nl: 'Hoe snel de inhoud van de pagina visueel wordt opgebouwd.',
    en: 'How quickly page content is visually built up.',
  },
  'interaction-to-next-paint': {
    nl: 'Hoe snel de pagina reageert nadat iemand ergens op klikt of typt.',
    en: 'How quickly the page responds after someone clicks or types.',
  },
}

export function resolveLocalizedText(text: LocalizedText, locale: AuditLocale): string {
  return text[locale] || text.nl
}

export function getAuditExplanation(id: string, locale: AuditLocale = 'nl'): AuditExplanation | null {
  const mapped = AUDIT_EXPLANATIONS[id]
  if (!mapped) return null
  return {
    friendlyTitle: resolveLocalizedText(mapped.friendlyTitle, locale),
    description: resolveLocalizedText(mapped.description, locale),
    recommendation: resolveLocalizedText(mapped.recommendation, locale),
    category: mapped.category,
    impact: mapped.impact,
    difficulty: mapped.difficulty,
  }
}

export function getCategoryFallbackFix(category: AuditCategoryId | 'other', locale: AuditLocale = 'nl'): string {
  return resolveLocalizedText(CATEGORY_FALLBACK_FIX[category], locale)
}

export function getMetricExplanation(id: string, locale: AuditLocale = 'nl'): string | null {
  const mapped = METRIC_EXPLANATIONS[id]
  if (!mapped) return null
  return resolveLocalizedText(mapped, locale)
}

export function normalizeAuditLocale(value: unknown): AuditLocale {
  return value === 'en' ? 'en' : 'nl'
}
