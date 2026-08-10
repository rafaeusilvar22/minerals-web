import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do mineral não informado.' })
  }

  const db = useServerFirestore()
  const snapshot = await getDoc(doc(db, 'minerals', id))

  if (!snapshot.exists()) {
    throw createError({ statusCode: 404, statusMessage: 'Mineral não encontrado.' })
  }

  setResponseHeader(event, 'cache-control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400')

  const mineral = { id: snapshot.id, ...snapshot.data() } as { categorySlug: string }

  const categorySnapshot = await getDocs(
    query(collection(db, 'mineralCategories'), where('slug', '==', mineral.categorySlug), limit(1)),
  )
  const categoryDoc = categorySnapshot.docs[0]
  const category = categoryDoc ? { id: categoryDoc.id, ...categoryDoc.data() } : null

  return { ...mineral, category }
})
