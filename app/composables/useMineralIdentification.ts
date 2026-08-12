export type IdentificationConfidence = 'alta' | 'média' | 'baixa'

export interface IdentifiedCandidate {
  mineral: {
    id: string
    name: string
    description: string
    images: string[]
    categorySlug: string
    dotColor: string
  }
  confidence: IdentificationConfidence
  reasoning: string
}

export interface IdentifyMineralResponse {
  candidates: IdentifiedCandidate[]
}

export function useMineralIdentification() {
  const loading = ref(false)
  const error = ref('')

  async function identify(imageUrl: string) {
    loading.value = true
    error.value = ''

    try {
      return await $fetch<IdentifyMineralResponse>('/api/identify-mineral', {
        method: 'POST',
        body: { imageUrl },
      })
    }
    catch {
      error.value = 'Não foi possível identificar o mineral agora. Tente novamente.'
      throw new Error(error.value)
    }
    finally {
      loading.value = false
    }
  }

  return { identify, loading, error }
}
