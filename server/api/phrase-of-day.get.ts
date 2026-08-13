import { collection, getDocs } from 'firebase/firestore'

interface PhraseRecord {
  id: string
  text: string
  author?: string
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')

  const db = useServerFirestore()
  const snapshot = await getDocs(collection(db, 'phrases'))

  const phrases = snapshot.docs
    .map(document => ({ id: document.id, ...document.data() }) as PhraseRecord)
    .sort((a, b) => a.id.localeCompare(b.id))

  if (!phrases.length) {
    return { phrase: null }
  }

  const daysSinceEpoch = Math.floor(Date.now() / MS_PER_DAY)
  const phrase = phrases[daysSinceEpoch % phrases.length]

  return { phrase }
})
