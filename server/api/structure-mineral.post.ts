interface StructureMineralPayload {
  text: string
  categories: { slug: string, name: string }[]
}

interface StructuredMineral {
  name: string
  categorySlug: string
  formula: string
  hardnessMin: number
  hardnessMax: number
  crystalSystem: string
  colors: string[]
  description: string
}

const CRYSTAL_SYSTEMS = ['Cúbico', 'Tetragonal', 'Ortorrômbico', 'Hexagonal', 'Trigonal', 'Monoclínico', 'Triclínico']

const COLOR_PALETTE = ['Amarelo', 'Azul', 'Branco', 'Cinza', 'Dourado', 'Incolor', 'Laranja', 'Marrom', 'Prateado', 'Preto', 'Rosa', 'Roxo', 'Verde', 'Vermelho']

export default defineEventHandler(async (event) => {
  const { groqApiKey } = useRuntimeConfig(event)

  if (!groqApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GROQ_API_KEY não configurada no servidor.' })
  }

  const body = await readBody<StructureMineralPayload>(event)
  const text = body?.text?.trim()

  if (!text) {
    throw createError({ statusCode: 400, statusMessage: 'Informe um texto para estruturar.' })
  }

  const categorySlugs = (body.categories ?? []).map(category => category.slug)

  const systemPrompt = `Você extrai dados estruturados sobre minérios/minerais a partir de um texto livre em português.
Responda APENAS com um JSON válido no formato:
{
  "name": string,
  "categorySlug": string, // um destes valores: ${categorySlugs.join(', ') || '(nenhuma categoria cadastrada, deixe vazio)'}
  "formula": string, // fórmula química, ex: "SiO2"
  "hardnessMin": number, // escala Mohs, 1 a 10
  "hardnessMax": number, // escala Mohs, 1 a 10
  "crystalSystem": string, // um destes valores: ${CRYSTAL_SYSTEMS.join(', ')}
  "colors": string[], // use exatamente a grafia destes valores quando aplicável (sem flexão de gênero/número): ${COLOR_PALETTE.join(', ')}. Só inclua uma cor fora dessa lista se nenhum valor da lista representar bem a cor do texto
  "description": string // 2-4 frases descrevendo origem, aparência e curiosidades
}
Se alguma informação não estiver explícita no texto, faça sua melhor estimativa com base em conhecimento geral de mineralogia. Não invente categorias fora da lista fornecida.`

  const response = await $fetch<{ choices: { message: { content: string } }[] }>('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
    },
  }).catch((error) => {
    throw createError({ statusCode: 502, statusMessage: 'Falha ao consultar a IA da Groq.', cause: error })
  })

  const content = response.choices?.[0]?.message?.content
  if (!content) {
    throw createError({ statusCode: 502, statusMessage: 'Resposta vazia da IA.' })
  }

  let parsed: Partial<StructuredMineral>
  try {
    parsed = JSON.parse(content)
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'A IA retornou um formato inválido.' })
  }

  return {
    name: parsed.name ?? '',
    categorySlug: categorySlugs.includes(parsed.categorySlug ?? '') ? (parsed.categorySlug ?? '') : '',
    formula: parsed.formula ?? '',
    hardnessMin: typeof parsed.hardnessMin === 'number' ? parsed.hardnessMin : 1,
    hardnessMax: typeof parsed.hardnessMax === 'number' ? parsed.hardnessMax : 1,
    crystalSystem: CRYSTAL_SYSTEMS.includes(parsed.crystalSystem ?? '') ? (parsed.crystalSystem ?? '') : '',
    colors: Array.isArray(parsed.colors) ? parsed.colors.filter(color => typeof color === 'string') : [],
    description: parsed.description ?? '',
  } satisfies StructuredMineral
})
