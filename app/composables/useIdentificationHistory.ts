import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, Timestamp } from 'firebase/firestore'
import type { IdentificationConfidence } from '~/composables/useMineralIdentification'

export interface IdentificationHistoryCandidate {
  mineralId: string
  confidence: IdentificationConfidence
  reasoning: string
}

export type IdentificationStatus = 'completed' | 'failed'

export interface IdentificationHistoryEntry {
  id: string
  imageUrl: string
  candidates: IdentificationHistoryCandidate[]
  status: IdentificationStatus
  createdAt: Timestamp
}

export const RECENT_HISTORY_LIMIT = 3
export const FULL_HISTORY_LIMIT = 50

// Mesmo motivo de useIdentificationLimit.ts: estado por sessão de página,
// não um singleton de módulo compartilhado globalmente.
export function useIdentificationHistory() {
  const history = ref<IdentificationHistoryEntry[]>([])
  const loading = ref(false)

  async function fetchHistory(uid: string, limitCount: number = RECENT_HISTORY_LIMIT) {
    loading.value = true

    try {
      const { $db } = useNuxtApp()
      const snapshot = await getDocs(
        query(collection($db, 'users', uid, 'identifications'), orderBy('createdAt', 'desc'), limit(limitCount)),
      )
      history.value = snapshot.docs.map(document => ({ id: document.id, ...document.data() }) as IdentificationHistoryEntry)
    }
    finally {
      loading.value = false
    }
  }

  async function addEntry(uid: string, imageUrl: string, candidates: IdentificationHistoryCandidate[], status: IdentificationStatus) {
    const { $db } = useNuxtApp()
    const payload = { imageUrl, candidates, status, createdAt: Timestamp.now() }
    const docRef = await addDoc(collection($db, 'users', uid, 'identifications'), payload)
    history.value = [{ id: docRef.id, ...payload }, ...history.value]
  }

  async function removeEntry(uid: string, id: string) {
    const { $db } = useNuxtApp()
    await deleteDoc(doc($db, 'users', uid, 'identifications', id))
    history.value = history.value.filter(entry => entry.id !== id)
  }

  return { history, loading, fetchHistory, addEntry, removeEntry }
}
