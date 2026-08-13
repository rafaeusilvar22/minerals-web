import { collection, getDocs, limit, query, where } from 'firebase/firestore'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Mineral não informado.' })
  }

  const db = useServerFirestore()
  const snapshot = await getDocs(
    query(collection(db, 'minerals'), where('slug', '==', slug), limit(1)),
  )
  const mineralDoc = snapshot.docs[0]

  if (!mineralDoc) {
    throw createError({ statusCode: 404, statusMessage: 'Mineral não encontrado.' })
  }

  setResponseHeader(event, 'cache-control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400')

  const mineral = { id: mineralDoc.id, ...mineralDoc.data() } as { categorySlug: string }

  const categorySnapshot = await getDocs(
    query(collection(db, 'mineralCategories'), where('slug', '==', mineral.categorySlug), limit(1)),
  )
  const categoryDoc = categorySnapshot.docs[0]
  const category = categoryDoc ? { id: categoryDoc.id, ...categoryDoc.data() } : null

  return { ...mineral, category }
})
