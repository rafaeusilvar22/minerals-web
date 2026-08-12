import { doc, getDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore'

export const DAILY_IDENTIFICATION_LIMIT = 5

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

// Diferente do padrão singleton de módulo usado nas outras stores (useMineralsStore
// etc.) de propósito: esse estado é só da sessão da página atual, não precisa ser
// compartilhado/cacheado globalmente entre todos os componentes da árvore.
export function useIdentificationLimit() {
  const remaining = ref<number | null>(null)
  const checking = ref(false)

  async function refresh(uid: string) {
    checking.value = true

    try {
      const { $db } = useNuxtApp()
      const snapshot = await getDoc(doc($db, 'users', uid, 'aiUsage', todayKey()))
      const count = snapshot.exists() ? (snapshot.data().count ?? 0) : 0
      remaining.value = Math.max(0, DAILY_IDENTIFICATION_LIMIT - count)
    }
    finally {
      checking.value = false
    }
  }

  async function recordUsage(uid: string) {
    const { $db } = useNuxtApp()
    await setDoc(
      doc($db, 'users', uid, 'aiUsage', todayKey()),
      { count: increment(1), updatedAt: serverTimestamp() },
      { merge: true },
    )

    if (remaining.value !== null) {
      remaining.value = Math.max(0, remaining.value - 1)
    }
  }

  return { remaining, checking, refresh, recordUsage }
}
