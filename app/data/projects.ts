export interface ProjectGalleryItem {
  src: string
  alt: string
  layout: 'full' | 'half-left' | 'half-right' | 'duo'
  type?: 'image' | 'video'
  fit?: 'cover' | 'contain'
  caption?: string
}

export interface ProjectImageGroup {
  id: string
  title: { nl: string; en: string }
  body: { nl: string; en: string }
  images: { src: string; alt: string }[]
}

export interface ProjectShowcase {
  tagline: { nl: string[]; en: string[] }
  intro: { nl: string; en: string }
  devices: { src: string; alt: string }[]
  custom: {
    title: { nl: string; en: string }
    body: { nl: string; en: string }
  }
  video?: {
    src: string
    poster?: string
    caption?: { nl: string; en: string }
    title?: { nl: string; en: string }
    body?: { nl: string; en: string }
  }
  imageGroups: ProjectImageGroup[]
  stack: string[]
}

export interface ProjectStat {
  value: string
  label: string | { nl: string; en: string }
}

export function getStatLabel(stat: ProjectStat, locale: string): string {
  if (typeof stat.label === 'string') return stat.label
  return locale === 'nl' ? stat.label.nl : stat.label.en
}

export interface Project {
  slug: string
  title: string
  subtitle: string
  category: string
  year: number
  role: string[]
  technologies: string[]
  thumbnail: string
  heroImage: string
  /** Hero for `/work/:slug/legacy` showcase when it differs from the new-version hero. */
  legacyHeroImage?: string
  accentColor: string
  /** Optional chip on Recent werk / work index cards (NL + EN). */
  badge?: { nl: string; en: string }
  /**
   * When true, `/work/:slug` shows the lean case frame (hero + story).
   * Deep showcase/gallery lives at `/work/:slug/legacy`.
   */
  hasLegacy?: boolean
  /** Why this case got a new version - shown on the lean `/work/:slug` page. */
  refresh?: {
    title: { nl: string; en: string }
    body: { nl: string; en: string }
  }
  /** Featured media for the lean new-version page (not shown on legacy). */
  featureVideo?: {
    src: string
    poster?: string
    caption?: { nl: string; en: string }
  }
  challenge: {
    nl: string
    en: string
  }
  solution: {
    nl: string
    en: string
  }
  results?: ProjectStat[]
  gallery: ProjectGalleryItem[]
  showcase?: ProjectShowcase
  liveUrl?: string
  featured: boolean
  order: number
}

const ACC = '/cpwd/projects/AccurateBlack'
const CP = '/cpwd/projects/CareerPulse'

export const projects: Project[] = [
  {
    slug: 'accurate-black',
    title: 'Accurate Black',
    subtitle: 'Een premium webplatform dat de sound van een techno-label vertaalt naar een meeslepende online ervaring',
    category: 'Web Design & Development',
    year: 2025,
    role: ['Art direction', 'Development', 'CMS', 'Motion design'],
    technologies: ['Nuxt', 'Vue 3', 'SCSS', 'Firebase', 'ImageKit', 'GSAP'],
    thumbnail: `${ACC}/AccurateBlack-hero-image.png`,
    heroImage: `${ACC}/AccurateBlack-hero-image.png`,
    legacyHeroImage: `${ACC}/Acc Macbook.png`,
    accentColor: '#38965A',
    badge: { nl: 'Nieuwe versie', en: 'New version' },
    hasLegacy: true,
    refresh: {
      title: {
        nl: 'Opnieuw scherp gezet',
        en: 'Sharpened again',
      },
      body: {
        nl: 'Het internet staat nooit stil. De Accurate Black-site begon grafisch weer te verouderen, en de klant vroeg om een frisse, moderne versie. Op verzoek tillen we het platform opnieuw naar het nu, en dat doen we zo vaak als het merk erom vraagt.',
        en: 'The internet never stands still. The Accurate Black site was becoming graphically outdated again, and the client asked for a fresh, modern version. On request we bring the platform back up to date, and we can do it again whenever the brand needs it.',
      },
    },
    featureVideo: {
      src: `${ACC}/AccurateBlack-laptop-mockup.mp4`,
      caption: {
        nl: 'Nieuwe site in beeld',
        en: 'New site in motion',
      },
    },
    challenge: {
      nl: 'Accurate Black wilde online net zo onderscheidend zijn als hun releases: donker, krachtig en authentiek. De uitdaging? Een digitale ervaring die het karakter van het label voelbaar maakt, en fans, artiesten en partners direct het merk in trekt.',
      en: 'Accurate Black wanted to stand out online the way their releases do, dark, powerful and unmistakably authentic. The challenge: create a digital experience that captures the label\'s character and pulls fans, artists and partners straight into the brand.',
    },
    solution: {
      nl: 'CPWD ontwierp en bouwde een volledig custom platform met dedicated pagina\'s per artiest en release, Spotify-embeds, vloeiende animaties en een schaalbaar CMS. Het resultaat: een website die er premium uitziet, snel laadt en het label zelfstandig kan laten publiceren.',
      en: 'We designed and built a fully custom platform with dedicated artist and release pages, Spotify embeds, fluid animations and a scalable CMS. The result: a premium-looking site that loads fast and lets the label publish on their own terms.',
    },
    results: [
      { value: '17+', label: { nl: 'Visuele assets', en: 'Visual assets' } },
      { value: 'CMS', label: { nl: 'Zelf content beheren', en: 'Self-managed content' } },
      { value: '100%', label: { nl: 'Mobiel-first', en: 'Mobile-first' } },
    ],
    showcase: {
      tagline: {
        nl: ['DEEP. DARK.', 'AUTHENTIC. PROFOUND.', 'Waar sound en design samenkomen.'],
        en: ['DEEP. DARK.', 'AUTHENTIC. PROFOUND.', 'Where sound meets design.'],
      },
      intro: {
        nl: 'Accurate Black vroeg om meer dan een website, om een digitaal podium dat de intensiteit van hun techno-sound vertaalt naar pixels. CPWD ontwikkelde een donker, premium platform waar artiesten, releases en merkidentiteit samensmelten tot één meeslepende ervaring, op elk scherm.',
        en: 'Accurate Black needed more than a website, they needed a digital stage that matches the intensity of their techno sound. We developed a dark, premium platform where artists, releases and brand identity merge into one immersive experience on every screen.',
      },
      devices: [
        { src: `${ACC}/screenshot iphone acc.png`, alt: 'Accurate Black, mobiele homepage' },
        { src: `${ACC}/phone_mockup_3 ACC.png`, alt: 'Accurate Black, responsive device mockup' },
      ],
      custom: {
        title: { nl: 'Details die het verschil maken', en: 'Details that make the difference' },
        body: {
          nl: 'Van geanimeerde logo-reveals tot hover-interacties en naadloze page transitions: elk detail versterkt het donkere karakter van het merk en houdt bezoekers langer in de flow.',
          en: 'From animated logo reveals to hover interactions and seamless page transitions, every detail reinforces the brand\'s dark character and keeps visitors in the flow longer.',
        },
      },
      video: {
        src: `${ACC}/Screen Recording 2025-02-14 at 10.12.40 (1).mp4`,
        poster: `${ACC}/Screenshot 2025-02-11 at 15.16.37.png`,
        caption: { nl: 'Bekijk de scroll-ervaring in actie', en: 'See the scroll experience in action' },
      },
      imageGroups: [
        {
          id: 'artists',
          title: { nl: 'Artists & Releases', en: 'Artists & Releases' },
          body: {
            nl: 'Elke artiest krijgt een eigen verhaal. Biografie, socials, discografie en embedded players, alles op één plek, ontworpen om fans direct dieper het label in te trekken.',
            en: 'Every artist gets their own story. Bio, social links, discography and embedded players, all in one place, designed to pull fans deeper into the label from the first click.',
          },
          images: [
            { src: `${ACC}/Screenshot 2025-02-11 at 15.23.00.png`, alt: 'Artiestenoverzicht' },
            { src: `${ACC}/Screenshot 2025-02-11 at 15.17.58.png`, alt: 'Artiestprofiel met bio en player' },
            { src: `${ACC}/Screenshot 2025-02-11 at 15.16.37.png`, alt: 'Homepage met release-grid' },
            { src: `${ACC}/Screenshot 2025-02-11 at 15.17.08.png`, alt: 'Releasedetailpagina' },
          ],
        },
        {
          id: 'releases',
          title: { nl: 'Dynamic Releases', en: 'Dynamic Releases' },
          body: {
            nl: 'Nieuwe tracks, nieuwe visuals, zonder gedoe. Met een custom CMS op Firebase Firestore en ImageKit publiceert Accurate Black releases snel, consistent en visueel sterk.',
            en: 'New tracks, new visuals, without the friction. With a custom CMS on Firebase Firestore and ImageKit, Accurate Black publishes releases fast, consistently and with real visual impact.',
          },
          images: [
            { src: `${ACC}/Screenshot 2025-02-11 at 15.18.46.png`, alt: 'Releasepagina met artwork' },
            { src: `${ACC}/Screenshot 2025-02-11 at 15.19.03.png`, alt: 'Spotify-embed en trackinfo' },
            { src: `${ACC}/Screenshot 2025-02-11 at 15.20.02.png`, alt: 'Links naar streamingplatforms' },
            { src: `${ACC}/table.png`, alt: 'Charts & release-overzicht' },
          ],
        },
      ],
      stack: ['Nuxt', 'Vue 3', 'SCSS', 'Firebase', 'ImageKit', 'Vercel', 'GSAP'],
    },
    gallery: [
      { src: `${ACC}/Screenshot 2025-02-12 at 15.54.03.png`, alt: 'Detailpagina', layout: 'full', fit: 'contain' },
      { src: `${ACC}/Screenshot 2025-02-11 at 15.33.04.png`, alt: 'Footer & contact', layout: 'full', fit: 'contain' },
      { src: `${ACC}/Screenshot 2025-02-11 at 15.17.22.png`, alt: 'Artiestenpagina', layout: 'full', fit: 'contain' },
      { src: `${ACC}/Screenshot 2025-02-11 at 15.23.44.png`, alt: 'Navigatie', layout: 'full', fit: 'contain' },
    ],
    liveUrl: 'https://accurateblack.nl',
    featured: true,
    order: 1,
  },
  {
    slug: 'careerpulse',
    title: 'CareerPulse',
    subtitle: 'Gratis CV-maker, motivatiebrieven en vacatures in één platform',
    category: 'Web Design & Development',
    year: 2026,
    role: ['Product design', 'Development', 'AI integration', 'UX'],
    technologies: ['Nuxt', 'Vue 3', 'TypeScript', 'AI', 'ImageKit'],
    thumbnail: `${CP}/Screenshot 2026-09-22 at 14.32.37.png`,
    heroImage: `${CP}/Screenshot 2026-09-22 at 14.32.37.png`,
    accentColor: '#38965A',
    challenge: {
      nl: 'De meeste CV-makers laten je eerst alles invullen en vragen daarna om te betalen of een account. CareerPulse wilde het omgekeerde: solliciteren zonder gedoe, echt gratis, en met één plek voor CV, motivatiebrief en vacatures. De uitdaging was een product dat helder, snel en professioneel voelt, zonder paywall of gimmick-AI.',
      en: 'Most CV makers let you fill everything in first, then ask you to pay or create an account. CareerPulse wanted the opposite: apply without friction, genuinely free, with one place for CVs, cover letters and jobs. The challenge was a product that feels clear, fast and professional, without a paywall or gimmick AI.',
    },
    solution: {
      nl: 'CPWD ontwierp en bouwde CareerPulse opnieuw als volledig gratis platform. Upload een oud CV of begin leeg, kies uit 20 professioneel gestylde templates die je volledig kunt customizen, download direct als PDF, schrijf AI-motivatiebrieven en stem je CV af op vacatures. Donker en licht, NL en EN, met een groeiende templatebibliotheek.',
      en: 'CPWD redesigned and rebuilt CareerPulse as a fully free platform. Upload an old CV or start blank, pick from 20 professionally styled templates you can fully customize, download straight as PDF, write AI cover letters and tailor your CV to jobs. Light and dark modes, NL and EN, with a growing template library.',
    },
    results: [
      { value: '100%', label: { nl: 'Gratis, altijd', en: 'Free, always' } },
      { value: '20', label: { nl: 'Professionele templates', en: 'Professional templates' } },
      { value: 'NL/EN', label: { nl: 'Tweetalige interface', en: 'Bilingual interface' } },
    ],
    showcase: {
      tagline: {
        nl: ['CareerPulse'],
        en: ['CareerPulse'],
      },
      intro: {
        nl: 'CareerPulse is volledig gratis: geen creditcard, geen verplichte account, wel een echt PDF-download. Je krijgt 20 professioneel gestylde templates die je volledig kunt aanpassen, en er komen er steeds meer bij. CPWD bouwde CV-wizard, live studio, motivatiebrief-generator, vacaturepagina en beheer-stats tot één scherpe flow.',
        en: 'CareerPulse is fully free: no credit card, no forced account, and a real PDF download. You get 20 professionally styled templates you can fully customize, with more added over time. CPWD built the CV wizard, live studio, cover letter generator, jobs page and admin stats into one sharp flow.',
      },
      devices: [
        { src: `${CP}/Screenshot 2026-09-22 at 14.32.37.png`, alt: 'CareerPulse, homepage hero' },
        { src: `${CP}/Screenshot 2026-09-22 at 14.34.38.png`, alt: 'CareerPulse, live CV studio' },
      ],
      custom: {
        title: { nl: 'Twintig templates, volledig jouw look', en: 'Twenty templates, fully your look' },
        body: {
          nl: 'Elke template is professioneel gestyled en klaar voor ATS. Kleur, layout en inhoud pas je zelf aan. De bibliotheek groeit door, zodat sollicitanten altijd een frisse, passende uitstraling kunnen kiezen.',
          en: 'Every template is professionally styled and ATS-ready. You customize colour, layout and content yourself. The library keeps growing, so applicants can always pick a fresh look that fits.',
        },
      },
      imageGroups: [
        {
          id: 'cv-maker',
          title: { nl: 'CV Maker & Studio', en: 'CV Maker & Studio' },
          body: {
            nl: 'Van wizard tot live preview. Upload je oude CV of begin leeg, vul je gegevens in en zie meteen hoe 20 customizable templates eruitzien. Download direct als PDF, zonder betaalstap.',
            en: 'From wizard to live preview. Upload your old CV or start blank, fill in your details and instantly see how 20 customizable templates look. Download straight as PDF, with no payment step.',
          },
          images: [
            { src: `${CP}/Screenshot 2026-09-22 at 14.33.08.png`, alt: 'CareerPulse CV-wizard' },
            { src: `${CP}/Screenshot 2026-09-22 at 14.34.38.png`, alt: 'CareerPulse live CV studio' },
          ],
        },
        {
          id: 'apply',
          title: { nl: 'Motivatiebrief & Vacatures', en: 'Cover letter & Jobs' },
          body: {
            nl: 'Schrijf een AI-motivatiebrief in jouw toon, afgestemd op de vacature. Browse actuele functies, stem je CV af en open daarna de originele listing om te solliciteren.',
            en: 'Write an AI cover letter in your own voice, tailored to the vacancy. Browse current roles, tailor your CV, then open the original listing to apply.',
          },
          images: [
            { src: `${CP}/Screenshot 2026-09-22 at 14.35.39.png`, alt: 'CareerPulse motivatiebrief-generator' },
            { src: `${CP}/Screenshot 2026-09-22 at 14.35.10.png`, alt: 'CareerPulse vacaturepagina' },
          ],
        },
        {
          id: 'ops',
          title: { nl: 'Beheer & inzicht', en: 'Ops & insights' },
          body: {
            nl: 'Voor de beheerder: een stats-pagina om te zien hoe het platform loopt. Gebruik, downloads en groei in één overzicht, zodat CareerPulse kan blijven verbeteren.',
            en: 'For admins: a stats page to see how the platform is performing. Usage, downloads and growth in one view, so CareerPulse can keep improving.',
          },
          images: [
            { src: `${CP}/Screenshot 2026-09-22 at 14.37.28.png`, alt: 'CareerPulse stats-pagina voor beheerders' },
          ],
        },
      ],
      stack: ['Nuxt', 'Vue 3', 'TypeScript', 'AI', 'ImageKit', 'Vercel'],
    },
    gallery: [
      { src: `${CP}/Screenshot 2026-09-22 at 14.32.37.png`, alt: 'Homepage', layout: 'full', fit: 'contain' },
      { src: `${CP}/Screenshot 2026-09-22 at 14.33.08.png`, alt: 'CV-wizard', layout: 'full', fit: 'contain' },
      { src: `${CP}/Screenshot 2026-09-22 at 14.34.38.png`, alt: 'CV-studio', layout: 'full', fit: 'contain' },
      { src: `${CP}/Screenshot 2026-09-22 at 14.35.10.png`, alt: 'Vacaturepagina', layout: 'full', fit: 'contain' },
      { src: `${CP}/Screenshot 2026-09-22 at 14.35.39.png`, alt: 'Motivatiebrief-generator', layout: 'full', fit: 'contain' },
      { src: `${CP}/Screenshot 2026-09-22 at 14.37.28.png`, alt: 'Stats-pagina', layout: 'full', fit: 'contain' },
    ],
    liveUrl: 'https://careerpulse.nl',
    featured: true,
    order: 2,
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug)
}

export function getNextProject(currentSlug: string): Project | undefined {
  const sorted = [...projects].sort((a, b) => a.order - b.order)
  const idx = sorted.findIndex(p => p.slug === currentSlug)
  if (idx === -1) return undefined
  return sorted[idx + 1]
}

export function getAllSlugs(): string[] {
  return projects.map(p => p.slug)
}

export function getFeaturedProjects(): Project[] {
  return projects
    .filter(p => p.featured)
    .sort((a, b) => a.order - b.order)
}
