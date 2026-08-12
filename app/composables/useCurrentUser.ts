import type { User } from 'firebase/auth'

// State populated once by the onAuthStateChanged listener
// registered in plugins/firebase.client.ts
export function useCurrentUser() {
  return useState<User | null>('firebase-user', () => null)
}
