import { collection, deleteDoc, doc, getDocs, setDoc, Timestamp } from 'firebase/firestore'

export type MineralStatus = 'have' | 'want'

interface MineralInteraction {
  status: MineralStatus
  updatedAt: Timestamp
}

const INTERACTIONS_SUBCOLLECTION = 'mineralInteractions'

// mineralId -> status, só do usuário atual
const interactions = ref<Record<string, MineralStatus>>({})
const loading = ref(false)
// uid ao qual `interactions` corresponde — mesmo padrão de useUserProfile.ts,
// já que o usuário logado pode trocar na mesma sessão.
const loadedForUid = ref<string | null>(null)

async function fetchInteractions(uid: string) {
  const { $db } = useNuxtApp()
  loading.value = true

  try {
    const snapshot = await getDocs(collection($db, 'users', uid, INTERACTIONS_SUBCOLLECTION))
    const next: Record<string, MineralStatus> = {}
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data() as MineralInteraction
      next[docSnapshot.id] = data.status
    })
    interactions.value = next
    loadedForUid.value = uid
  } finally {
    loading.value = false
  }
}

export function useMineralInteractions() {
  const user = useCurrentUser()

  // Disparado só após o mount: evita rodar no server (sem $db) e evita
  // mismatch de hidratação (SSR sempre renderiza com loading/interactions vazios)
  onMounted(() => {
    watch(user, (currentUser) => {
      if (!currentUser) {
        interactions.value = {}
        loadedForUid.value = null
        return
      }

      if (loadedForUid.value !== currentUser.uid && !loading.value) {
        fetchInteractions(currentUser.uid)
      }
    }, { immediate: true })
  })

  const ready = computed(() => !!user.value && loadedForUid.value === user.value.uid)

  function getStatus(mineralId: string): MineralStatus | null {
    return interactions.value[mineralId] ?? null
  }

  async function setStatus(mineralId: string, status: MineralStatus | null) {
    if (!user.value) return

    const { $db } = useNuxtApp()
    const docRef = doc($db, 'users', user.value.uid, INTERACTIONS_SUBCOLLECTION, mineralId)

    if (status === null) {
      await deleteDoc(docRef)
      const next = { ...interactions.value }
      delete next[mineralId]
      interactions.value = next
    } else {
      await setDoc(docRef, { status, updatedAt: Timestamp.now() })
      interactions.value = { ...interactions.value, [mineralId]: status }
    }
  }

  return { interactions, loading, ready, getStatus, setStatus }
}
