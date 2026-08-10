import { collection, doc, getDoc, getDocs, orderBy, query, type Timestamp } from 'firebase/firestore'

interface MineralRecord {
  id: string
  name: string
  categorySlug: string
  hardnessMin: number
  hardnessMax: number
  colors: string[]
  description: string
  images: string[]
  waterproof: boolean
  magicalProperties: string
  zodiacSigns: string[]
  element: string
  planet: string
  chakras: string[]
}

interface CategoryRecord {
  id: string
  name: string
  slug: string
  dotColor: string
}

interface FeaturedMineralConfig {
  mineralId: string
  duration: '1d' | '3d' | '7d' | 'indefinite'
  selectedAt: Timestamp
}

const DURATION_MS: Record<Exclude<FeaturedMineralConfig['duration'], 'indefinite'>, number> = {
  '1d': 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
}

function isFeaturedExpired(config: FeaturedMineralConfig) {
  if (config.duration === 'indefinite') {
    return false
  }

  return Date.now() > config.selectedAt.toMillis() + DURATION_MS[config.duration]
}

export default defineEventHandler(async () => {
  const db = useServerFirestore()

  const [mineralsSnapshot, categoriesSnapshot, featuredSnapshot] = await Promise.all([
    getDocs(query(collection(db, 'minerals'), orderBy('name'))),
    getDocs(query(collection(db, 'mineralCategories'), orderBy('name'))),
    getDoc(doc(db, 'settings', 'featuredMineral')),
  ])

  const minerals = mineralsSnapshot.docs.map(document => ({ id: document.id, ...document.data() }) as MineralRecord)
  const categories = categoriesSnapshot.docs.map(document => ({ id: document.id, ...document.data() }) as CategoryRecord)

  let featuredMineralId: string | null = null
  if (featuredSnapshot.exists()) {
    const config = featuredSnapshot.data() as FeaturedMineralConfig
    if (!isFeaturedExpired(config)) {
      featuredMineralId = config.mineralId
    }
  }

  return { minerals, categories, featuredMineralId }
})
