interface ImproveMineralPayload {
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

interface ImprovedMineralFields {
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

const COLOR_PALETTE = ['Amarelo', 'Azul', 'Branco', 'Cinza', 'Dourado', 'Incolor', 'Laranja', 'Marrom', 'Prateado', 'Preto', 'Rosa', 'Roxo', 'Verde', 'Vermelho']

const ELEMENTS = ['Fogo', 'Terra', 'Ar', 'Água']

const PLANETS = ['Sol', 'Lua', 'Terra', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Netuno', 'Plutão', 'Quíron']

const ZODIAC_SIGNS = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes']

const CHAKRAS = ['Raiz', 'Sacral', 'Plexo Solar', 'Cardíaco', 'Laríngeo', 'Frontal', 'Coronário']

export default defineEventHandler(async (event) => {
  const { groqApiKey } = useRuntimeConfig(event)

  if (!groqApiKey) {
    throw createError({ statusCode: 500, statusMessage: 'GROQ_API_KEY não configurada no servidor.' })
  }

  const body = await readBody<ImproveMineralPayload>(event)

  if (!body?.name) {
    throw createError({ statusCode: 400, statusMessage: 'Informe o mineral a ser revisado.' })
  }

  const currentFields = {
    hardnessMin: body.hardnessMin,
    hardnessMax: body.hardnessMax,
    colors: body.colors ?? [],
    description: body.description ?? '',
    magicalProperties: body.magicalProperties ?? '',
    zodiacSigns: body.zodiacSigns ?? [],
    element: body.element ?? '',
    planet: body.planet ?? '',
    chakras: body.chakras ?? [],
  }

  const systemPrompt = `Você revisa e aprimora dados já cadastrados sobre um mineral/pedra chamado "${body.name}"${body.categoryName ? ` (categoria: ${body.categoryName})` : ''}.
Você recebe os valores ATUAIS de um cadastro (em JSON, na mensagem do usuário) e deve devolver um JSON com os MESMOS campos, aplicando duas regras:

1. TEXTOS (description, magicalProperties): reescreva corrigindo gramática, ortografia e clareza, mantendo o sentido, o tom e um tamanho aproximado ao original. Se o texto já estiver correto e claro, devolva-o inalterado. Se estiver vazio, escreva um texto novo apropriado para "${body.name}".

2. CAMPOS ESTRUTURADOS (hardnessMin, hardnessMax, colors, element, planet, zodiacSigns, chakras): mantenha o valor atual EXATAMENTE como está, a menos que esteja claramente incorreto ou incompleto (ex: vazio) para "${body.name}" segundo conhecimento de mineralogia e cristaloterapia. Só sugira mudança quando tiver certeza razoável de que o valor atual está errado — não faça alterações estéticas, de preferência pessoal ou "só para variar". Na dúvida, mantenha o valor atual.

Responda APENAS com um JSON válido no formato:
{
  "hardnessMin": number, // escala Mohs, 1 a 10
  "hardnessMax": number, // escala Mohs, 1 a 10
  "colors": string[], // use exatamente a grafia destes valores quando aplicável: ${COLOR_PALETTE.join(', ')}
  "description": string,
  "magicalProperties": string,
  "zodiacSigns": string[], // um ou mais destes valores: ${ZODIAC_SIGNS.join(', ')}
  "element": string, // um destes valores: ${ELEMENTS.join(', ')}
  "planet": string, // um destes valores: ${PLANETS.join(', ')}
  "chakras": string[] // um ou mais destes valores: ${CHAKRAS.join(', ')}
}`

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
        { role: 'user', content: JSON.stringify(currentFields) },
      ],
    },
  }).catch((error) => {
    throw createError({ statusCode: 502, statusMessage: 'Falha ao consultar a IA da Groq.', cause: error })
  })

  const content = response.choices?.[0]?.message?.content
  if (!content) {
    throw createError({ statusCode: 502, statusMessage: 'Resposta vazia da IA.' })
  }

  let parsed: Partial<ImprovedMineralFields>
  try {
    parsed = JSON.parse(content)
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'A IA retornou um formato inválido.' })
  }

  return {
    hardnessMin: typeof parsed.hardnessMin === 'number' ? parsed.hardnessMin : currentFields.hardnessMin,
    hardnessMax: typeof parsed.hardnessMax === 'number' ? parsed.hardnessMax : currentFields.hardnessMax,
    colors: Array.isArray(parsed.colors) && parsed.colors.length
      ? parsed.colors.filter(color => typeof color === 'string')
      : currentFields.colors,
    description: parsed.description || currentFields.description,
    magicalProperties: parsed.magicalProperties || currentFields.magicalProperties,
    zodiacSigns: Array.isArray(parsed.zodiacSigns)
      ? parsed.zodiacSigns.filter(sign => ZODIAC_SIGNS.includes(sign))
      : currentFields.zodiacSigns,
    element: ELEMENTS.includes(parsed.element ?? '') ? (parsed.element ?? '') : currentFields.element,
    planet: PLANETS.includes(parsed.planet ?? '') ? (parsed.planet ?? '') : currentFields.planet,
    chakras: Array.isArray(parsed.chakras)
      ? parsed.chakras.filter(chakra => CHAKRAS.includes(chakra))
      : currentFields.chakras,
  } satisfies ImprovedMineralFields
})
