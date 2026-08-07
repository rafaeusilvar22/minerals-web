export interface StructuredMineral {
  name: string
  categorySlug: string
  formula: string
  hardnessMin: number
  hardnessMax: number
  crystalSystem: string
  colors: string[]
  description: string
}

export function useMineralAI() {
  const loading = ref(false)
  const error = ref('')

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

  return { structure, loading, error }
}
