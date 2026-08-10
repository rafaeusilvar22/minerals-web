import { collection, getDocs, orderBy, query } from 'firebase/firestore'

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

const SEARCH_RESULTS_LIMIT = 6

export default defineEventHandler(async (event) => {
  const { q } = getQuery(event)
  const searchText = normalizeSearchText(typeof q === 'string' ? q : '')

  if (!searchText) {
    return { results: [] }
  }

  const db = useServerFirestore()
  const snapshot = await getDocs(query(collection(db, 'minerals'), orderBy('name')))
  const minerals = snapshot.docs.map(document => ({ id: document.id, ...document.data() }) as MineralRecord)

  const results = minerals
    .filter(mineral => normalizeSearchText([mineral.name, ...(mineral.colors ?? []), mineral.element, mineral.planet, ...(mineral.zodiacSigns ?? []), ...(mineral.chakras ?? [])].join(' ')).includes(searchText))
    .slice(0, SEARCH_RESULTS_LIMIT)

  return { results }
})
