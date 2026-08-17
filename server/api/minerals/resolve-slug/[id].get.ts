import { doc, getDoc } from 'firebase/firestore'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Mineral não informado.' })
  }

  const db = useServerFirestore()
  const mineralDoc = await getDoc(doc(db, 'minerals', id))

  if (!mineralDoc.exists()) {
    throw createError({ statusCode: 404, statusMessage: 'Mineral não encontrado.' })
  }

  setResponseHeader(event, 'cache-control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400')

  const { slug } = mineralDoc.data() as { slug: string }

  return { slug }
})
