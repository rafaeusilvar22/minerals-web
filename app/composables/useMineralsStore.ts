import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'
import { slugify } from '~/utils/slug'

export interface Mineral {
  id: string
  slug: string
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

export type MineralInput = Omit<Mineral, 'id' | 'slug'>

const MINERALS_COLLECTION = 'minerals'

const minerals = ref<Mineral[]>([])
const loading = ref(false)
const initialized = ref(false)

async function fetchAll() {
  const { $db } = useNuxtApp()
  loading.value = true

  try {
    const snapshot = await getDocs(query(collection($db, MINERALS_COLLECTION), orderBy('name')))
    minerals.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Mineral)
  } finally {
    loading.value = false
    initialized.value = true
  }
}

export function useMineralsStore() {
  // Fired only after mount: avoids running on the server (no $db there) and
  // avoids a hydration mismatch (SSR always renders with loading/minerals empty)
  onMounted(() => {
    if (!initialized.value && !loading.value) {
      fetchAll()
    }
  })

  function getById(id: string) {
    return minerals.value.find(mineral => mineral.id === id)
  }

  function sortByName() {
    minerals.value.sort((a, b) => a.name.localeCompare(b.name))
  }

  function uniqueSlug(name: string) {
    const base = slugify(name)
    const taken = new Set(minerals.value.map(mineral => mineral.slug))

    if (!taken.has(base)) {
      return base
    }

    let suffix = 2
    while (taken.has(`${base}-${suffix}`)) {
      suffix += 1
    }
    return `${base}-${suffix}`
  }

  async function create(data: MineralInput) {
    const { $db } = useNuxtApp()
    const slug = uniqueSlug(data.name)
    const docRef = await addDoc(collection($db, MINERALS_COLLECTION), { ...data, slug })
    minerals.value.push({ id: docRef.id, slug, ...data })
    sortByName()
    return docRef.id
  }

  async function update(id: string, data: MineralInput) {
    const { $db } = useNuxtApp()
    await updateDoc(doc($db, MINERALS_COLLECTION, id), data)

    const mineral = minerals.value.find(mineral => mineral.id === id)
    if (mineral) {
      Object.assign(mineral, data)
      sortByName()
    }
  }

  async function backfillMissingSlugs() {
    const { $db } = useNuxtApp()
    const pending = minerals.value.filter(mineral => !mineral.slug)

    // Sequential: uniqueSlug() needs each mineral's slug already assigned
    // to avoid handing out the same slug twice in this batch.
    for (const mineral of pending) {
      const slug = uniqueSlug(mineral.name)
      await updateDoc(doc($db, MINERALS_COLLECTION, mineral.id), { slug })
      mineral.slug = slug
    }

    return pending.length
  }

  async function remove(id: string) {
    const { $db } = useNuxtApp()
    await deleteDoc(doc($db, MINERALS_COLLECTION, id))

    const index = minerals.value.findIndex(mineral => mineral.id === id)
    if (index !== -1) {
      minerals.value.splice(index, 1)
    }
  }

  return { minerals, loading, fetchAll, getById, create, update, remove, backfillMissingSlugs }
}
