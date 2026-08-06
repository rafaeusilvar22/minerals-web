import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'

export interface Mineral {
  id: string
  name: string
  categorySlug: string
  formula: string
  hardnessMin: number
  hardnessMax: number
  crystalSystem: string
  colors: string[]
  description: string
  images: string[]
}

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
  // Disparado só após o mount: evita rodar no server (sem $db) e evita
  // mismatch de hidratação (SSR sempre renderiza com loading/minerals vazios)
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

  async function create(data: Omit<Mineral, 'id'>) {
    const { $db } = useNuxtApp()
    const docRef = await addDoc(collection($db, MINERALS_COLLECTION), data)
    minerals.value.push({ id: docRef.id, ...data })
    sortByName()
    return docRef.id
  }

  async function update(id: string, data: Omit<Mineral, 'id'>) {
    const { $db } = useNuxtApp()
    await updateDoc(doc($db, MINERALS_COLLECTION, id), data)

    const mineral = minerals.value.find(mineral => mineral.id === id)
    if (mineral) {
      Object.assign(mineral, data)
      sortByName()
    }
  }

  async function remove(id: string) {
    const { $db } = useNuxtApp()
    await deleteDoc(doc($db, MINERALS_COLLECTION, id))

    const index = minerals.value.findIndex(mineral => mineral.id === id)
    if (index !== -1) {
      minerals.value.splice(index, 1)
    }
  }

  return { minerals, loading, fetchAll, getById, create, update, remove }
}
