interface SeoOptions {
  title: string
  description: string
  image?: string
}

const DEFAULT_IMAGE = '/images/ametista-background.webp'

export function useSeo(options: SeoOptions | (() => SeoOptions)) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const resolve = () => (typeof options === 'function' ? options() : options)

  const canonicalUrl = computed(() => `${config.public.siteUrl}${route.path}`)
  const resolvedImage = () => {
    const image = resolve().image ?? DEFAULT_IMAGE
    return image.startsWith('http') ? image : `${config.public.siteUrl}${image}`
  }

  useSeoMeta({
    title: () => resolve().title,
    description: () => resolve().description,
    ogTitle: () => resolve().title,
    ogDescription: () => resolve().description,
    ogImage: resolvedImage,
    ogUrl: () => canonicalUrl.value,
    ogType: 'website',
    ogSiteName: 'Magia Cristais',
    ogLocale: 'pt_BR',
    twitterCard: 'summary_large_image',
    twitterTitle: () => resolve().title,
    twitterDescription: () => resolve().description,
    twitterImage: resolvedImage,
  })

  useHead({
    link: [{ rel: 'canonical', href: canonicalUrl }],
  })
}
