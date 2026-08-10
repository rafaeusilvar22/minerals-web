export interface StructuredMineral {
  name: string
  categorySlug: string
  hardnessMin: number
  hardnessMax: number
  colors: string[]
  description: string
  waterproof: boolean
  magicalProperties: string
  zodiacSigns: string[]
  element: string
  planet: string
  chakras: string[]
}

export interface ImproveMineralInput {
  name: string
  categoryName?: string
  hardnessMin: number
  hardnessMax: number
  colors: string[]
  description: string
  magicalProperties: string
  zodiacSigns: string[]
  element: string
  planet: string
  chakras: string[]
}

export interface ImprovedMineralFields {
  hardnessMin: number
  hardnessMax: number
  colors: string[]
  description: string
  magicalProperties: string
  zodiacSigns: string[]
  element: string
  planet: string
  chakras: string[]
}

export function useMineralAI() {
  const loading = ref(false)
  const error = ref('')

  const improveLoading = ref(false)
  const improveError = ref('')

  async function structure(text: string, categories: { slug: string, name: string }[]) {
    loading.value = true
    error.value = ''

    try {
      return await $fetch<StructuredMineral>('/api/structure-mineral', {
        method: 'POST',
        body: { text, categories },
      })
    }
    catch {
      error.value = 'Não foi possível estruturar as informações. Tente novamente.'
      throw new Error(error.value)
    }
    finally {
      loading.value = false
    }
  }

  async function improve(input: ImproveMineralInput) {
    improveLoading.value = true
    improveError.value = ''

    try {
      return await $fetch<ImprovedMineralFields>('/api/improve-mineral', {
        method: 'POST',
        body: input,
      })
    }
    catch {
      improveError.value = 'Não foi possível revisar as informações. Tente novamente.'
      throw new Error(improveError.value)
    }
    finally {
      improveLoading.value = false
    }
  }

  return { structure, loading, error, improve, improveLoading, improveError }
}
