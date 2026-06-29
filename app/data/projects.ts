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
  video: {
    src: string
    poster?: string
    caption?: { nl: string; en: string }
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
  accentColor: string
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

export const projects: Project[] = [
  {
    slug: 'accurate-black',
    title: 'Accurate Black',
    subtitle: 'Een premium webplatform dat de sound van een techno-label vertaalt naar een meeslepende online ervaring',
    category: 'Web Design & Development',
    year: 2025,
    role: ['Art direction', 'Development', 'CMS', 'Motion design'],
    technologies: ['Nuxt', 'Vue 3', 'SCSS', 'Firebase', 'ImageKit', 'GSAP'],
    thumbnail: `${ACC}/phone_mockup_3 ACC.png`,
    heroImage: `${ACC}/Acc Macbook.png`,
    accentColor: '#38965A',
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
    slug: 'restaurant-de-nieuwe-wereld',
    title: 'Restaurant De Nieuwe Wereld',
    subtitle: 'Brand identity & website voor een fine dining restaurant in Amsterdam',
    category: 'Web Design & Development',
    year: 2024,
    role: ['Design', 'Development', 'CMS integratie'],
    technologies: ['Nuxt 3', 'GSAP', 'Sanity CMS', 'SCSS'],
    thumbnail: '/cpwd/projects/nieuwe-wereld/thumb.jpg',
    heroImage: '/cpwd/projects/nieuwe-wereld/hero.jpg',
    accentColor: '#C4A882',
    challenge: {
      nl: 'Een fine dining restaurant dat zijn verfijnde wereld wilde vertalen naar een digitale ervaring die net zo meeslepend aanvoelt als een avond in het restaurant zelf. De website moest reserveringen stimuleren zonder de elegantie van het merk aan te tasten.',
      en: 'A fine dining restaurant wanted to translate its refined world into a digital experience as immersive as an evening at the restaurant itself. The website needed to drive reservations without compromising the elegance of the brand.',
    },
    solution: {
      nl: 'We ontwierpen een cinematische scroll-ervaring met zwarte achtergronden, goudkleurige typografie en parallax-beelden die de ambiance van het restaurant overbrengen. GSAP ScrollTrigger stuurt elke animatie zodat de bezoeker meegesleurd wordt in het verhaal.',
      en: 'We designed a cinematic scroll experience with dark backgrounds, gold typography and parallax imagery that conveys the ambiance of the restaurant. GSAP ScrollTrigger drives every animation, pulling the visitor into the story.',
    },
    results: [
      { value: '+68%', label: 'Reserveringen online' },
      { value: '2.4×', label: 'Langere sessieduur' },
      { value: '97', label: 'Lighthouse score' },
    ],
    gallery: [
      { src: '/cpwd/projects/nieuwe-wereld/img-01.jpg', alt: 'Homepage hero', layout: 'full' },
      { src: '/cpwd/projects/nieuwe-wereld/img-02.jpg', alt: 'Menu sectie', layout: 'half-left' },
      { src: '/cpwd/projects/nieuwe-wereld/img-03.jpg', alt: 'Over de chef', layout: 'half-right' },
      { src: '/cpwd/projects/nieuwe-wereld/img-04.jpg', alt: 'Reserveringen', layout: 'full' },
      { src: '/cpwd/projects/nieuwe-wereld/img-05.jpg', alt: 'Mobile view', layout: 'duo' },
      { src: '/cpwd/projects/nieuwe-wereld/img-06.jpg', alt: 'Detailpagina', layout: 'duo' },
    ],
    liveUrl: 'https://example.com',
    featured: true,
    order: 2,
  },
  {
    slug: 'maison-vandenbergh',
    title: 'Maison Vandenbergh',
    subtitle: 'Luxe interior design studio, digitale identiteit en portfolio',
    category: 'Branding & Web Development',
    year: 2024,
    role: ['Art Direction', 'Web Development'],
    technologies: ['Nuxt 3', 'Three.js', 'GSAP', 'ImageKit'],
    thumbnail: '/cpwd/projects/vandenbergh/thumb.jpg',
    heroImage: '/cpwd/projects/vandenbergh/hero.jpg',
    accentColor: '#B8A090',
    challenge: {
      nl: 'Een gevestigde interior design studio in Rotterdam wilde haar papieren portfolio omzetten naar een digitale showroom die recht doet aan de kwaliteit van haar werk. De uitdaging: luxe uitstraling zonder clichés.',
      en: 'An established interior design studio in Rotterdam wanted to transform its printed portfolio into a digital showroom that does justice to the quality of its work. The challenge: luxury feel without clichés.',
    },
    solution: {
      nl: 'Een minimalistische, beeldgedreven website waarbij de projecten het woord voeren. Grote foto\'s, subtiele hover-interacties en een custom gallery-viewer zorgen dat het werk centraal staat. Three.js geeft de hero een rustige, sfeervolle achtergrond.',
      en: 'A minimalist, image-driven website where the projects do the talking. Large photos, subtle hover interactions and a custom gallery viewer keep the work front and centre. Three.js gives the hero a calm, atmospheric background.',
    },
    results: [
      { value: '4×', label: 'Meer aanvragen' },
      { value: '100%', label: 'Mobiel geoptimaliseerd' },
    ],
    gallery: [
      { src: '/cpwd/projects/vandenbergh/img-01.jpg', alt: 'Studio overview', layout: 'full' },
      { src: '/cpwd/projects/vandenbergh/img-02.jpg', alt: 'Project cards', layout: 'duo' },
      { src: '/cpwd/projects/vandenbergh/img-03.jpg', alt: 'Gallery viewer', layout: 'duo' },
      { src: '/cpwd/projects/vandenbergh/img-04.jpg', alt: 'Contact pagina', layout: 'full' },
    ],
    featured: true,
    order: 3,
  },
  {
    slug: 'atelier-bloom',
    title: 'Atelier Bloom',
    subtitle: 'E-commerce platform voor een premium bloemenatelier',
    category: 'E-commerce Development',
    year: 2023,
    role: ['Full-stack Development', 'UX Design'],
    technologies: ['Nuxt 3', 'Shopify API', 'GSAP', 'SCSS'],
    thumbnail: '/cpwd/projects/atelier-bloom/thumb.jpg',
    heroImage: '/cpwd/projects/atelier-bloom/hero.jpg',
    accentColor: '#9CAF88',
    challenge: {
      nl: 'Een premium bloemenatelier wilde hun bestelproces digitaliseren zonder de persoonlijke, handgemaakte sfeer te verliezen die hun merk definieert. Standaard e-commerce templates voelden te koud aan.',
      en: 'A premium floral atelier wanted to digitalise their ordering process without losing the personal, handcrafted atmosphere that defines their brand. Standard e-commerce templates felt too cold.',
    },
    solution: {
      nl: 'Een op maat gemaakte Shopify frontend in Nuxt met vloeiende productpresentaties, een stap-voor-stap samensteltool voor boeketten en een checkout die aanvoelt als een persoonlijk gesprek. Warme kleuren en organische vormen reflecteren het merk.',
      en: 'A bespoke Shopify frontend in Nuxt with smooth product presentations, a step-by-step bouquet builder and a checkout that feels like a personal conversation. Warm colours and organic shapes reflect the brand.',
    },
    results: [
      { value: '+140%', label: 'Online omzet' },
      { value: '3.8%', label: 'Conversieratio' },
      { value: '4.9★', label: 'Klantbeoordeling' },
    ],
    gallery: [
      { src: '/cpwd/projects/atelier-bloom/img-01.jpg', alt: 'Homepage', layout: 'full' },
      { src: '/cpwd/projects/atelier-bloom/img-02.jpg', alt: 'Product pagina', layout: 'half-left' },
      { src: '/cpwd/projects/atelier-bloom/img-03.jpg', alt: 'Boeket builder', layout: 'half-right' },
      { src: '/cpwd/projects/atelier-bloom/img-04.jpg', alt: 'Checkout flow', layout: 'full' },
    ],
    liveUrl: 'https://example.com',
    featured: false,
    order: 4,
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug)
}

export function getNextProject(currentSlug: string): Project | undefined {
  const sorted = [...projects].sort((a, b) => a.order - b.order)
  const idx = sorted.findIndex(p => p.slug === currentSlug)
  if (idx === -1) return undefined
  return sorted[(idx + 1) % sorted.length]
}

export function getAllSlugs(): string[] {
  return projects.map(p => p.slug)
}

export function getFeaturedProjects(): Project[] {
  return projects
    .filter(p => p.featured)
    .sort((a, b) => a.order - b.order)
}
