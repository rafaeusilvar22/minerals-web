import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'

export interface InternalDoc {
  html: string
  updatedAt: Timestamp
}

const DOCS_COLLECTION = 'internalDocs'
const INFRASTRUCTURE_DOC = 'infrastructure'

const content = ref<InternalDoc | null>(null)
const loading = ref(false)
const initialized = ref(false)

async function fetchContent() {
  const { $db } = useNuxtApp()
  loading.value = true

  try {
    const snapshot = await getDoc(doc($db, DOCS_COLLECTION, INFRASTRUCTURE_DOC))
    content.value = snapshot.exists() ? (snapshot.data() as InternalDoc) : null
  } finally {
    loading.value = false
    initialized.value = true
  }
}

export function useInternalDocs() {
  // Fired only after mount: avoids running on the server (no $db there) and
  // avoids a hydration mismatch (SSR always renders with loading/content empty)
  onMounted(() => {
    if (!initialized.value && !loading.value) {
      fetchContent()
    }
  })

  async function save(html: string) {
    const { $db } = useNuxtApp()
    const payload: InternalDoc = { html, updatedAt: Timestamp.now() }
    await setDoc(doc($db, DOCS_COLLECTION, INFRASTRUCTURE_DOC), payload)
    content.value = payload
  }

  return { content, loading, initialized, fetchContent, save }
}
