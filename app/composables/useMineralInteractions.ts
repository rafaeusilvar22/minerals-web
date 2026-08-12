import { collection, deleteDoc, doc, getDocs, setDoc, Timestamp } from 'firebase/firestore'

export type MineralStatus = 'have' | 'want'

interface MineralInteraction {
  status: MineralStatus
  updatedAt: Timestamp
}

const INTERACTIONS_SUBCOLLECTION = 'mineralInteractions'

// mineralId -> status, only for the current user
const interactions = ref<Record<string, MineralStatus>>({})
const loading = ref(false)
// uid `interactions` corresponds to — same pattern as useUserProfile.ts,
// since the logged-in user can change within the same session.
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

  // Fired only after mount: avoids running on the server (no $db there) and
  // avoids a hydration mismatch (SSR always renders with loading/interactions empty)
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
