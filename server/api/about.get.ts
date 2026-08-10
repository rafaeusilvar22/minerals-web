import { doc, getDoc } from 'firebase/firestore'

export default defineEventHandler(async (event) => {
  const db = useServerFirestore()
  const snapshot = await getDoc(doc(db, 'settings', 'about'))

  setResponseHeader(event, 'cache-control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400')

  return { html: snapshot.exists() ? (snapshot.data().html as string) : '' }
})
