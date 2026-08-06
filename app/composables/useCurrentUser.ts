import type { User } from 'firebase/auth'

// Estado alimentado uma única vez pelo listener onAuthStateChanged
// registrado em plugins/firebase.client.ts
export function useCurrentUser() {
  return useState<User | null>('firebase-user', () => null)
}
