import { doc, getDoc } from 'firebase/firestore'

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

  return { id: snapshot.id, ...snapshot.data() }
})
