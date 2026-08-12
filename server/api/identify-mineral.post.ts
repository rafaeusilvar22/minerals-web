import { collection, getDocs, orderBy, query } from 'firebase/firestore'

interface IdentifyMineralPayload {
  imageUrl: string
}

interface MineralRecord {
  id: string
  name: string
  categorySlug: string
  description: string
  images: string[]
  colors: string[]
}

interface CategoryRecord {
  id: string
  name: string
  slug: string
  dotColor: string
}

type Confidence = 'alta' | 'média' | 'baixa'

const CONFIDENCE_LEVELS: Confidence[] = ['alta', 'média', 'baixa']

interface IdentifiedCandidate {
  id: string
  confidence?: Confidence
  reasoning?: string
}

export default defineEventHandler(async (event) => {
  const { groqApiKey } = useRuntimeConfig(event)
  const { cloudinaryCloudName } = useRuntimeConfig(event).public

  if (!groqApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GROQ_API_KEY não configurada no servidor.' })
  }

  const body = await readBody<IdentifyMineralPayload>(event)
  const imageUrl = body?.imageUrl?.trim()

  if (!imageUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Informe a URL da imagem.' })
  }

  if (!imageUrl.startsWith(`https://res.cloudinary.com/${cloudinaryCloudName}/`)) {
    throw createError({ statusCode: 400, statusMessage: 'URL de imagem inválida.' })
  }

  const db = useServerFirestore()

  const [mineralsSnapshot, categoriesSnapshot] = await Promise.all([
    getDocs(query(collection(db, 'minerals'), orderBy('name'))),
    getDocs(query(collection(db, 'mineralCategories'), orderBy('name'))),
  ])

  const minerals = mineralsSnapshot.docs.map(document => ({ id: document.id, ...document.data() }) as MineralRecord)
  const categories = categoriesSnapshot.docs.map(document => ({ id: document.id, ...document.data() }) as CategoryRecord)

  const catalogForPrompt = minerals.map(mineral => ({
    id: mineral.id,
    name: mineral.name,
    colors: mineral.colors,
    categorySlug: mineral.categorySlug,
  }))

  const systemPrompt = `Você é um assistente de identificação visual de minerais/pedras.
Você recebe a foto de uma pedra física e uma lista de candidatos do nosso catálogo, em JSON, no formato:
[{ "id": string, "name": string, "colors": string[], "categorySlug": string }, ...]
Catálogo disponível: ${JSON.stringify(catalogForPrompt)}

Analise a cor, o brilho, a transparência e o formato/hábito cristalino visíveis na foto.
Escolha até 3 candidatos da lista acima — NUNCA invente um id ou nome que não esteja literalmente
presente na lista. Ordene do mais provável para o menos provável.
Se nenhum item da lista for um match visual plausível, devolva uma lista vazia — não force um palpite.

Responda APENAS com um JSON válido no formato:
{
  "candidates": [
    {
      "id": string,
      "confidence": "alta" | "média" | "baixa",
      "reasoning": string
    }
  ]
}`

  const response = await $fetch<{ choices: { message: { content: string } }[] }>('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      model: 'qwen/qwen3.6-27b',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Identifique esta pedra com base na foto.' },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
    },
  }).catch((error) => {
    // Log completo só no servidor — não repassa detalhes internos da Groq
    // (org id, etc.) pro client, só uma mensagem apropriada por tipo de erro.
    console.error('[identify-mineral] Groq request failed:', error?.data ?? error?.message ?? error)

    if (error?.data?.error?.code === 'rate_limit_exceeded') {
      throw createError({ statusCode: 503, statusMessage: 'Muita gente identificando minerais agora. Tente novamente em alguns segundos.' })
    }

    throw createError({ statusCode: 502, statusMessage: 'Falha ao consultar a IA da Groq.' })
  })

  const content = response.choices?.[0]?.message?.content
  if (!content) {
    throw createError({ statusCode: 502, statusMessage: 'Resposta vazia da IA.' })
  }

  let parsed: { candidates?: IdentifiedCandidate[] }
  try {
    parsed = JSON.parse(content)
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'A IA retornou um formato inválido.' })
  }

  const mineralsById = new Map(minerals.map(mineral => [mineral.id, mineral]))
  const seen = new Set<string>()

  function isNewValidCandidate(candidate: IdentifiedCandidate): candidate is IdentifiedCandidate & { id: string } {
    if (typeof candidate?.id !== 'string' || !mineralsById.has(candidate.id) || seen.has(candidate.id)) {
      return false
    }
    seen.add(candidate.id)
    return true
  }

  const candidates = (Array.isArray(parsed.candidates) ? parsed.candidates : [])
    .filter(isNewValidCandidate)
    .slice(0, 3)
    .map((candidate) => {
      const mineral = mineralsById.get(candidate.id)!
      const category = categories.find(item => item.slug === mineral.categorySlug)

      return {
        mineral: {
          id: mineral.id,
          name: mineral.name,
          description: mineral.description,
          images: mineral.images,
          categorySlug: mineral.categorySlug,
          dotColor: category?.dotColor ?? 'var(--muted-foreground)',
        },
        confidence: CONFIDENCE_LEVELS.includes(candidate.confidence as Confidence) ? candidate.confidence : 'baixa',
        reasoning: typeof candidate.reasoning === 'string' ? candidate.reasoning.trim() : '',
      }
    })

  return { candidates }
})
