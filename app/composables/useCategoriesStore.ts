import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'

export interface Category {
  id: string
  name: string
  slug: string
  dotColor: string
}

const CATEGORIES_COLLECTION = 'mineralCategories'

const categories = ref<Category[]>([])
const loading = ref(false)
const initialized = ref(false)

async function fetchAll() {
  const { $db } = useNuxtApp()
  loading.value = true

  try {
    const snapshot = await getDocs(query(collection($db, CATEGORIES_COLLECTION), orderBy('name')))
    categories.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Category)
  } finally {
    loading.value = false
    initialized.value = true
  }
}

export function useCategoriesStore() {
  // Disparado só após o mount: evita rodar no server (sem $db) e evita
  // mismatch de hidratação (SSR sempre renderiza com loading/categories vazios)
  onMounted(() => {
    if (!initialized.value && !loading.value) {
      fetchAll()
    }
  })

  function getBySlug(slug: string) {
    return categories.value.find(category => category.slug === slug)
  }

  function sortByName() {
    categories.value.sort((a, b) => a.name.localeCompare(b.name))
  }

  async function create(data: Omit<Category, 'id'>) {
    const { $db } = useNuxtApp()
    const docRef = await addDoc(collection($db, CATEGORIES_COLLECTION), data)
    categories.value.push({ id: docRef.id, ...data })
    sortByName()
    return docRef.id
  }

  async function update(id: string, data: Omit<Category, 'id'>) {
    const { $db } = useNuxtApp()
    await updateDoc(doc($db, CATEGORIES_COLLECTION, id), data)

    const category = categories.value.find(category => category.id === id)
    if (category) {
      Object.assign(category, data)
      sortByName()
    }
  }

  async function remove(id: string) {
    const { $db } = useNuxtApp()
    await deleteDoc(doc($db, CATEGORIES_COLLECTION, id))

    const index = categories.value.findIndex(category => category.id === id)
    if (index !== -1) {
      categories.value.splice(index, 1)
    }
  }

  return { categories, loading, fetchAll, getBySlug, create, update, remove }
}
