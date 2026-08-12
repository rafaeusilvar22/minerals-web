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
// uid the current `profile` corresponds to — unlike the boolean `initialized`
// used in the other stores, since here the logged-in user can change within the same session.
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

// Callable outside a component context (e.g. middleware, which has no
// onMounted/watch available). Uses the module cache when possible.
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

  // Fired only after mount: avoids running on the server (no $db there) and
  // avoids a hydration mismatch (SSR always renders with loading/profile empty)
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
  // Falls back to the uid while the profile has no chosen seed yet — the same
  // deterministic avatar that was already used before this preference existed.
  const avatarSeed = computed(() => profile.value?.avatarSeed || user.value?.uid || '')
  // Only true once the Firestore doc has been fetched for the current uid — used
  // to avoid showing the fallback avatar/name (uid/email) for an instant
  // before the chosen seed/displayName arrive.
  const ready = computed(() => !!user.value && loadedForUid.value === user.value.uid)

  return { profile, role, isAdmin, loading, avatarSeed, ready }
}
