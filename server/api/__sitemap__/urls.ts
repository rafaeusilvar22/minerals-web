import { collection, getDocs } from 'firebase/firestore'
import type { SitemapUrlInput } from '#sitemap/types'

export default defineSitemapEventHandler(async (): Promise<SitemapUrlInput[]> => {
  const db = useServerFirestore()
  const snapshot = await getDocs(collection(db, 'minerals'))

  return snapshot.docs.map(document => ({
    loc: `/minerais/${document.id}`,
  }))
})
