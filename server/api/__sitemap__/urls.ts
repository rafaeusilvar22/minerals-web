import { collection, getDocs } from 'firebase/firestore'
import type { SitemapUrlInput } from '#sitemap/types'

interface MineralRecord {
  slug: string
  name: string
  images: string[]
}

export default defineSitemapEventHandler(async (): Promise<SitemapUrlInput[]> => {
  const db = useServerFirestore()
  const snapshot = await getDocs(collection(db, 'minerals'))

  return snapshot.docs.map((document) => {
    const mineral = document.data() as MineralRecord

    return {
      loc: `/minerais/${mineral.slug}`,
      images: mineral.images?.map(image => ({ loc: image, title: mineral.name })) ?? [],
    }
  })
})
