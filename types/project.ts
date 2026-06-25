export interface Project {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  year: number
  role: string[]
  technologies: string[]
  thumbnail: string
  heroImage: string
  gallery: GalleryItem[]
  challenge: string
  solution: string
  results: ProjectStat[]
  featured: boolean
  color: string
  nextProject?: string
}

export interface GalleryItem {
  type: 'image' | 'video'
  url: string
  caption?: string
  layout: 'full' | 'half' | 'left-text' | 'right-text'
}

export interface ProjectStat {
  value: string
  label: string
}
