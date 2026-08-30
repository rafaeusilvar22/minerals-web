import { collection, getDocs, limit, query } from 'firebase/firestore'

interface ServiceHealth {
  status: 'ok' | 'degraded' | 'down'
  message: string
  checkedAt: string
}

const EXPECTED_GROQ_MODELS = ['openai/gpt-oss-120b', 'qwen/qwen3.6-27b']

async function checkGroq(apiKey: string | undefined): Promise<ServiceHealth> {
  const checkedAt = new Date().toISOString()

  if (!apiKey) {
    return { status: 'down', message: 'GROQ_API_KEY não configurada no servidor.', checkedAt }
  }

  try {
    const response = await $fetch<{ data: { id: string }[] }>('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8000),
    })

    const availableIds = new Set(response.data.map(model => model.id))
    const missing = EXPECTED_GROQ_MODELS.filter(id => !availableIds.has(id))

    if (missing.length) {
      return {
        status: 'degraded',
        message: `Conectado, mas modelo(s) configurados não encontrados no catálogo da Groq: ${missing.join(', ')}.`,
        checkedAt,
      }
    }

    return { status: 'ok', message: `Conectado. Modelos configurados disponíveis (${availableIds.size} no catálogo).`, checkedAt }
  }
  catch (error: any) {
    const httpStatus = error?.response?.status ?? error?.statusCode
    const reason = error?.response?._data?.error?.message ?? error?.data?.error?.message ?? error?.message
    return {
      status: 'down',
      message: httpStatus ? `Erro ${httpStatus}: ${reason ?? 'falha na consulta.'}` : (reason ?? 'Falha ao conectar com a Groq.'),
      checkedAt,
    }
  }
}

async function checkCloudinary(cloudName: string | undefined): Promise<ServiceHealth> {
  const checkedAt = new Date().toISOString()

  if (!cloudName) {
    return { status: 'down', message: 'Cloud name do Cloudinary não configurado.', checkedAt }
  }

  try {
    const response = await fetch(`https://res.cloudinary.com/${cloudName}/image/upload/v1/__health_check__.jpg`, {
      signal: AbortSignal.timeout(8000),
    })

    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.startsWith('image/')) {
      return { status: 'ok', message: 'CDN respondendo e cloud name válido.', checkedAt }
    }

    return { status: 'degraded', message: 'CDN respondeu, mas o cloud name configurado parece inválido.', checkedAt }
  }
  catch {
    return { status: 'down', message: 'Não foi possível conectar ao CDN do Cloudinary.', checkedAt }
  }
}

async function checkFirebase(): Promise<ServiceHealth> {
  const checkedAt = new Date().toISOString()

  try {
    const db = useServerFirestore()
    const snapshot = await Promise.race([
      getDocs(query(collection(db, 'mineralCategories'), limit(1))),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Tempo limite excedido.')), 8000)),
    ])

    return { status: 'ok', message: `Conectado ao Firestore (leitura de teste retornou ${snapshot.size} documento(s)).`, checkedAt }
  }
  catch (error: any) {
    return {
      status: 'down',
      message: error?.message ? `Falha ao conectar ao Firestore: ${error.message}` : 'Falha ao conectar ao Firestore.',
      checkedAt,
    }
  }
}

export default defineEventHandler(async (event) => {
  const { groqApiKey, public: { cloudinaryCloudName } } = useRuntimeConfig(event)

  const [groq, cloudinary, firebase] = await Promise.all([
    checkGroq(groqApiKey),
    checkCloudinary(cloudinaryCloudName),
    checkFirebase(),
  ])

  return { groq, cloudinary, firebase }
})
