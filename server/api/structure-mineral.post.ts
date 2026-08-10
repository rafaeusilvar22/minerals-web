interface StructureMineralPayload {
  text: string
  categories: { slug: string, name: string }[]
}

interface StructuredMineral {
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

const COLOR_PALETTE = ['Amarelo', 'Azul', 'Branco', 'Cinza', 'Dourado', 'Incolor', 'Laranja', 'Marrom', 'Prateado', 'Preto', 'Rosa', 'Roxo', 'Verde', 'Vermelho']

const ELEMENTS = ['Fogo', 'Terra', 'Ar', 'Água']

const PLANETS = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno']

const ZODIAC_SIGNS = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes']

const CHAKRAS = ['Raiz', 'Sacral', 'Plexo Solar', 'Cardíaco', 'Laríngeo', 'Frontal', 'Coronário']

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

  const systemPrompt = `Você extrai dados estruturados sobre minérios/minerais e seus significados místicos a partir de um texto livre em português.
Responda APENAS com um JSON válido no formato:
{
  "name": string,
  "categorySlug": string, // um destes valores: ${categorySlugs.join(', ') || '(nenhuma categoria cadastrada, deixe vazio)'}
  "hardnessMin": number, // escala Mohs, 1 a 10
  "hardnessMax": number, // escala Mohs, 1 a 10
  "colors": string[], // use exatamente a grafia destes valores quando aplicável (sem flexão de gênero/número): ${COLOR_PALETTE.join(', ')}. Só inclua uma cor fora dessa lista se nenhum valor da lista representar bem a cor do texto
  "description": string, // 2-4 frases descrevendo origem, aparência e curiosidades
  "waterproof": boolean, // true se a pedra pode entrar em contato com água sem se danificar
  "magicalProperties": string, // 2-4 frases sobre os poderes/usos místicos e energéticos da pedra
  "zodiacSigns": string[], // um ou mais destes valores: ${ZODIAC_SIGNS.join(', ')}
  "element": string, // um destes valores: ${ELEMENTS.join(', ')}
  "planet": string, // um destes valores: ${PLANETS.join(', ')}
  "chakras": string[] // um ou mais destes valores: ${CHAKRAS.join(', ')}
}
Se alguma informação não estiver explícita no texto, faça sua melhor estimativa com base em conhecimento geral de mineralogia e cristaloterapia. Não invente categorias fora da lista fornecida.`

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
    hardnessMin: typeof parsed.hardnessMin === 'number' ? parsed.hardnessMin : 1,
    hardnessMax: typeof parsed.hardnessMax === 'number' ? parsed.hardnessMax : 1,
    colors: Array.isArray(parsed.colors) ? parsed.colors.filter(color => typeof color === 'string') : [],
    description: parsed.description ?? '',
    waterproof: typeof parsed.waterproof === 'boolean' ? parsed.waterproof : false,
    magicalProperties: parsed.magicalProperties ?? '',
    zodiacSigns: Array.isArray(parsed.zodiacSigns) ? parsed.zodiacSigns.filter(sign => ZODIAC_SIGNS.includes(sign)) : [],
    element: ELEMENTS.includes(parsed.element ?? '') ? (parsed.element ?? '') : '',
    planet: PLANETS.includes(parsed.planet ?? '') ? (parsed.planet ?? '') : '',
    chakras: Array.isArray(parsed.chakras) ? parsed.chakras.filter(chakra => CHAKRAS.includes(chakra)) : [],
  } satisfies StructuredMineral
})
