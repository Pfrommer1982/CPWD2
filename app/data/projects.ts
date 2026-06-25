import type { Project } from '~/types'

const PLACEHOLDER = (seed: number) =>
  `https://picsum.photos/seed/portfolio${seed}/1600/900`

export const projects: Project[] = [
  {
    id: '1',
    slug: 'aurora-commerce',
    title: 'Aurora Commerce',
    subtitle: 'Immersive e-commerce experience',
    category: 'Creative Development',
    year: 2025,
    role: ['Creative Developer', 'Frontend Lead'],
    technologies: ['Nuxt', 'Three.js', 'GSAP', 'Shopify'],
    thumbnail: PLACEHOLDER(1),
    heroImage: PLACEHOLDER(1),
    featured: true,
    color: '#C8FF00',
    nextProject: 'motion-lab',
    challenge:
      'Aurora needed a digital flagship store that felt as premium as their physical boutiques — without sacrificing performance or conversion.',
    solution:
      'We built a scroll-driven narrative with WebGL product showcases, magnetic interactions, and a headless Shopify integration that loads in under 2 seconds.',
    results: [
      { value: '+42%', label: 'Conversion rate' },
      { value: '98', label: 'Lighthouse score' },
      { value: '2.1s', label: 'LCP' },
    ],
    gallery: [
      { type: 'image', url: PLACEHOLDER(11), layout: 'full' },
      { type: 'image', url: PLACEHOLDER(12), layout: 'half' },
      { type: 'image', url: PLACEHOLDER(13), layout: 'half' },
      {
        type: 'image',
        url: PLACEHOLDER(14),
        layout: 'left-text',
        caption: 'Custom shader backgrounds react to scroll velocity.',
      },
    ],
  },
  {
    id: '2',
    slug: 'motion-lab',
    title: 'Motion Lab',
    subtitle: 'Animation studio portfolio',
    category: 'Motion Design',
    year: 2024,
    role: ['Creative Developer', 'Motion Designer'],
    technologies: ['Vue', 'GSAP', 'Lottie', 'WebGL'],
    thumbnail: PLACEHOLDER(2),
    heroImage: PLACEHOLDER(2),
    featured: true,
    color: '#FF4D00',
    nextProject: 'vertex-brand',
    challenge:
      'Motion Lab wanted their portfolio to demonstrate their craft — every page transition and micro-interaction had to feel intentional.',
    solution:
      'A kinetic typography system with GSAP SplitText reveals, Lottie-powered iconography, and a custom cursor that responds to draggable elements.',
    results: [
      { value: '3x', label: 'Time on site' },
      { value: '15', label: 'Industry awards' },
      { value: '+200%', label: 'Lead inquiries' },
    ],
    gallery: [
      { type: 'image', url: PLACEHOLDER(21), layout: 'full' },
      { type: 'image', url: PLACEHOLDER(22), layout: 'right-text', caption: 'Kinetic type system built with GSAP.' },
      { type: 'image', url: PLACEHOLDER(23), layout: 'half' },
      { type: 'image', url: PLACEHOLDER(24), layout: 'half' },
    ],
  },
  {
    id: '3',
    slug: 'vertex-brand',
    title: 'Vertex Brand',
    subtitle: 'Brand identity & web platform',
    category: 'Brand Strategy',
    year: 2024,
    role: ['Design Lead', 'Developer'],
    technologies: ['Nuxt', 'Sanity', 'GSAP'],
    thumbnail: PLACEHOLDER(3),
    heroImage: PLACEHOLDER(3),
    featured: true,
    color: '#6B5CE7',
    nextProject: 'spatial-ai',
    challenge:
      'Vertex was launching a new identity and needed a cohesive digital platform that could scale across markets and languages.',
    solution:
      'A modular design system with i18n support, CMS-driven content blocks, and scroll-triggered brand storytelling.',
    results: [
      { value: '12', label: 'Markets launched' },
      { value: '95+', label: 'Lighthouse score' },
      { value: '40%', label: 'Bounce rate drop' },
    ],
    gallery: [
      { type: 'image', url: PLACEHOLDER(31), layout: 'full' },
      { type: 'image', url: PLACEHOLDER(32), layout: 'half' },
      { type: 'image', url: PLACEHOLDER(33), layout: 'half' },
    ],
  },
  {
    id: '4',
    slug: 'spatial-ai',
    title: 'Spatial AI',
    subtitle: '3D product configurator',
    category: '3D Web',
    year: 2023,
    role: ['3D Developer', 'Creative Technologist'],
    technologies: ['Three.js', 'React', 'WebGL', 'Blender'],
    thumbnail: PLACEHOLDER(4),
    heroImage: PLACEHOLDER(4),
    featured: false,
    color: '#00D4FF',
    nextProject: 'aurora-commerce',
    challenge:
      'Spatial AI needed an interactive 3D configurator that ran smoothly on mobile devices without native app downloads.',
    solution:
      'Optimized Three.js scenes with level-of-detail meshes, progressive texture loading, and touch-friendly orbit controls.',
    results: [
      { value: '60fps', label: 'Mobile performance' },
      { value: '+85%', label: 'Configurator usage' },
      { value: '4.8★', label: 'User rating' },
    ],
    gallery: [
      { type: 'image', url: PLACEHOLDER(41), layout: 'full' },
      { type: 'image', url: PLACEHOLDER(42), layout: 'left-text', caption: 'Real-time material switching with PBR shaders.' },
    ],
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug)
}

export function getFeaturedProjects(): Project[] {
  return projects.filter(p => p.featured)
}

export function getNextProject(slug: string): Project | undefined {
  const current = getProjectBySlug(slug)
  if (!current?.nextProject) return undefined
  return getProjectBySlug(current.nextProject)
}
