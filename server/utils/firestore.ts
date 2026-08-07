import { getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

let db: ReturnType<typeof getFirestore> | undefined

export function useServerFirestore() {
  if (db) {
    return db
  }

  const config = useRuntimeConfig()

  const app = getApps().find(app => app.name === 'server')
    ?? initializeApp({
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId,
    }, 'server')

  db = getFirestore(app)
  return db
}
