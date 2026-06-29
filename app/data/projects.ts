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
