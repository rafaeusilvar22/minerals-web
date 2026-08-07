import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'

export interface AboutContent {
  html: string
  updatedAt: Timestamp
}

const SETTINGS_COLLECTION = 'settings'
const ABOUT_DOC = 'about'

const content = ref<AboutContent | null>(null)
const loading = ref(false)
const initialized = ref(false)

async function fetchContent() {
  const { $db } = useNuxtApp()
  loading.value = true

  try {
    const snapshot = await getDoc(doc($db, SETTINGS_COLLECTION, ABOUT_DOC))
    content.value = snapshot.exists() ? (snapshot.data() as AboutContent) : null
  } finally {
    loading.value = false
    initialized.value = true
  }
}

export function useAboutContent() {
  // Disparado só após o mount: evita rodar no server (sem $db) e evita
  // mismatch de hidratação (SSR sempre renderiza com loading/content vazios)
  onMounted(() => {
    if (!initialized.value && !loading.value) {
      fetchContent()
    }
  })

  async function save(html: string) {
    const { $db } = useNuxtApp()
    const payload: AboutContent = { html, updatedAt: Timestamp.now() }
    await setDoc(doc($db, SETTINGS_COLLECTION, ABOUT_DOC), payload)
    content.value = payload
  }

  return { content, loading, initialized, fetchContent, save }
}
