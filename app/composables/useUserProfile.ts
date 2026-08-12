import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'

export type UserRole = 'user' | 'admin'

export interface UserProfile {
  email: string
  displayName: string
  role: UserRole
  createdAt: Timestamp
  avatarSeed?: string
}

const USERS_COLLECTION = 'users'

const profile = ref<UserProfile | null>(null)
const loading = ref(false)
// uid ao qual o `profile` atual corresponde — diferente do `initialized` booleano
// usado nas outras stores, porque aqui o usuário logado pode trocar na mesma sessão.
const loadedForUid = ref<string | null>(null)

async function fetchProfile(uid: string) {
  const { $db } = useNuxtApp()
  loading.value = true

  try {
    const snapshot = await getDoc(doc($db, USERS_COLLECTION, uid))
    profile.value = snapshot.exists() ? (snapshot.data() as UserProfile) : null
    loadedForUid.value = uid
  } finally {
    loading.value = false
  }
}

// Chamável fora de um contexto de componente (ex: middleware, que não tem
// onMounted/watch disponíveis). Usa o cache de módulo quando possível.
export async function resolveUserRole(uid: string): Promise<UserRole | null> {
  if (loadedForUid.value !== uid) {
    await fetchProfile(uid)
  }
  return profile.value?.role ?? null
}

export async function setAvatarSeed(uid: string, seed: string) {
  const { $db } = useNuxtApp()
  await setDoc(doc($db, USERS_COLLECTION, uid), { avatarSeed: seed }, { merge: true })

  if (profile.value && loadedForUid.value === uid) {
    profile.value = { ...profile.value, avatarSeed: seed }
  }
}

export async function setDisplayName(uid: string, displayName: string) {
  const { $db } = useNuxtApp()
  await setDoc(doc($db, USERS_COLLECTION, uid), { displayName }, { merge: true })

  if (profile.value && loadedForUid.value === uid) {
    profile.value = { ...profile.value, displayName }
  }
}

export function useUserProfile() {
  const user = useCurrentUser()

  // Disparado só após o mount: evita rodar no server (sem $db) e evita
  // mismatch de hidratação (SSR sempre renderiza com loading/profile vazios)
  onMounted(() => {
    watch(user, (currentUser) => {
      if (!currentUser) {
        profile.value = null
        loadedForUid.value = null
        return
      }

      if (loadedForUid.value !== currentUser.uid && !loading.value) {
        fetchProfile(currentUser.uid)
      }
    }, { immediate: true })
  })

  const role = computed(() => profile.value?.role ?? null)
  const isAdmin = computed(() => role.value === 'admin')
  // Cai pro uid enquanto o perfil não tem uma seed escolhida — mesmo avatar
  // determinístico que já era usado antes dessa preferência existir.
  const avatarSeed = computed(() => profile.value?.avatarSeed || user.value?.uid || '')
  // true só depois que o doc do Firestore já foi buscado pro uid atual — usado
  // pra evitar mostrar o avatar/nome de fallback (uid/e-mail) por um instante
  // antes da seed/displayName escolhidos chegarem.
  const ready = computed(() => !!user.value && loadedForUid.value === user.value.uid)

  return { profile, role, isAdmin, loading, avatarSeed, ready }
}
