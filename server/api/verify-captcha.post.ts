interface VerifyCaptchaPayload {
  token: string
}

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
}

export default defineEventHandler(async (event) => {
  const { turnstileSecretKey } = useRuntimeConfig(event)

  if (!turnstileSecretKey) {
    throw createError({ statusCode: 500, statusMessage: 'TURNSTILE_SECRET_KEY não configurada no servidor.' })
  }

  const body = await readBody<VerifyCaptchaPayload>(event)
  const token = body?.token?.trim()

  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Token de verificação ausente.' })
  }

  const formData = new FormData()
  formData.append('secret', turnstileSecretKey)
  formData.append('response', token)

  const ip = getRequestIP(event, { xForwardedFor: true })
  if (ip) {
    formData.append('remoteip', ip)
  }

  const result = await $fetch<TurnstileVerifyResponse>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  }).catch((error) => {
    console.error('[verify-captcha] Turnstile request failed:', error?.data ?? error?.message ?? error)
    throw createError({ statusCode: 502, statusMessage: 'Falha ao verificar a segurança do formulário.' })
  })

  return { success: result.success }
})
