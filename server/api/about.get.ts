import { doc, getDoc } from 'firebase/firestore'

export default defineEventHandler(async () => {
  const db = useServerFirestore()
  const snapshot = await getDoc(doc(db, 'settings', 'about'))

  return { html: snapshot.exists() ? (snapshot.data().html as string) : '' }
})
