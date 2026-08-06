import { deleteDoc, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'

export type FeaturedMineralDuration = '1d' | '3d' | '7d' | 'indefinite'

export interface FeaturedMineralConfig {
  mineralId: string
  duration: FeaturedMineralDuration
  selectedAt: Timestamp
}

const SETTINGS_COLLECTION = 'settings'
const FEATURED_MINERAL_DOC = 'featuredMineral'

const DURATION_MS: Record<Exclude<FeaturedMineralDuration, 'indefinite'>, number> = {
  '1d': 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
}

export const featuredMineralDurationOptions: { value: FeaturedMineralDuration, label: string }[] = [
  { value: '1d', label: '1 dia' },
  { value: '3d', label: '3 dias' },
  { value: '7d', label: '1 semana' },
  { value: 'indefinite', label: 'Tempo indeterminado' },
]

const config = ref<FeaturedMineralConfig | null>(null)
const loading = ref(false)
const initialized = ref(false)

function expiresAtFor(value: FeaturedMineralConfig) {
  if (value.duration === 'indefinite') {
    return null
  }

  return new Date(value.selectedAt.toMillis() + DURATION_MS[value.duration])
}

function isExpired(value: FeaturedMineralConfig) {
  const expiresAt = expiresAtFor(value)
  return expiresAt !== null && Date.now() > expiresAt.getTime()
}

async function fetchConfig() {
  const { $db } = useNuxtApp()
  loading.value = true

  try {
    const snapshot = await getDoc(doc($db, SETTINGS_COLLECTION, FEATURED_MINERAL_DOC))
    config.value = snapshot.exists() ? (snapshot.data() as FeaturedMineralConfig) : null
  } finally {
    loading.value = false
    initialized.value = true
  }
}

export function useFeaturedMineral() {
  // Disparado só após o mount: evita rodar no server (sem $db) e evita
  // mismatch de hidratação (SSR sempre renderiza com loading/config vazios)
  onMounted(() => {
    if (!initialized.value && !loading.value) {
      fetchConfig()
    }
  })

  const active = computed(() => {
    if (!config.value || isExpired(config.value)) {
      return null
    }
    return config.value
  })

  const expiresAt = computed(() => config.value ? expiresAtFor(config.value) : null)

  async function set(mineralId: string, duration: FeaturedMineralDuration) {
    const { $db } = useNuxtApp()
    const payload: FeaturedMineralConfig = {
      mineralId,
      duration,
      selectedAt: Timestamp.now(),
    }
    await setDoc(doc($db, SETTINGS_COLLECTION, FEATURED_MINERAL_DOC), payload)
    config.value = payload
  }

  async function clear() {
    const { $db } = useNuxtApp()
    await deleteDoc(doc($db, SETTINGS_COLLECTION, FEATURED_MINERAL_DOC))
    config.value = null
  }

  return { config, active, expiresAt, loading, fetchConfig, set, clear }
}
