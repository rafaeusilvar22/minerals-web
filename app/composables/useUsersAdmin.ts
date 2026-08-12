import { collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'
import type { UserRole } from '~/composables/useUserProfile'

export interface UserRow {
  id: string
  email: string
  displayName: string
  role: UserRole
  createdAt: Timestamp
}

const USERS_COLLECTION = 'users'

const users = ref<UserRow[]>([])
const loading = ref(false)
const initialized = ref(false)

async function fetchAll() {
  const { $db } = useNuxtApp()
  loading.value = true

  try {
    const snapshot = await getDocs(query(collection($db, USERS_COLLECTION), orderBy('createdAt')))
    users.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserRow)
  } finally {
    loading.value = false
    initialized.value = true
  }
}

export function useUsersAdmin() {
  // Disparado só após o mount: evita rodar no server (sem $db) e evita
  // mismatch de hidratação (SSR sempre renderiza com loading/users vazios)
  onMounted(() => {
    if (!initialized.value && !loading.value) {
      fetchAll()
    }
  })

  async function setRole(id: string, role: UserRole) {
    const { $db } = useNuxtApp()
    await updateDoc(doc($db, USERS_COLLECTION, id), { role })

    const user = users.value.find(user => user.id === id)
    if (user) {
      user.role = role
    }
  }

  return { users, loading, fetchAll, setRole }
}
