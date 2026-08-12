<template>
  <div class="flex flex-col gap-6 py-8">
    <div class="flex flex-col gap-1">
      <h1 class="text-section-title font-heading text-foreground">
        Minha conta
      </h1>
      <p class="text-body text-muted-foreground">
        Suas informações de acesso e segurança.
      </p>
    </div>

    <Card class="max-w-xl">
      <CardHeader>
        <CardTitle class="text-base">
          Dados da conta
        </CardTitle>
      </CardHeader>
      <CardContent v-if="isMounted" class="flex flex-col gap-5">
        <img v-if="user" :src="avatarUrl(user.uid)" :alt="user.email ?? 'Avatar'" class="size-16 rounded-full border border-border">

        <div class="flex flex-col gap-1">
          <span class="text-sm text-muted-foreground">Nome</span>
          <span class="text-body text-foreground">{{ user?.displayName || '—' }}</span>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-sm text-muted-foreground">E-mail</span>
          <div class="flex items-center gap-2">
            <span class="text-body text-foreground">{{ user?.email }}</span>
            <Badge :variant="emailVerified ? 'default' : 'outline'">
              {{ emailVerified ? 'Verificado' : 'Não verificado' }}
            </Badge>
          </div>
        </div>

        <div v-if="!emailVerified" class="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4">
          <p class="text-sm text-muted-foreground">
            Verificar seu e-mail confirma que você tem acesso a essa conta e ajuda a proteger seus dados pessoais
            — como suas preferências e listas de minerais salvas — de acordo com os princípios de segurança da
            informação previstos na LGPD (Lei Geral de Proteção de Dados). Enviamos um link de confirmação para
            o seu e-mail no momento do cadastro — se não encontrar na caixa de entrada, dê uma olhada também na
            caixa de spam ou lixo eletrônico.
          </p>

          <p v-if="resendMessage" class="text-sm text-foreground">
            {{ resendMessage }}
          </p>
          <p v-if="resendError" class="text-sm text-destructive">
            {{ resendError }}
          </p>

          <div class="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" :disabled="resending" @click="handleResend">
              {{ resending ? 'Enviando...' : 'Reenviar e-mail de verificação' }}
            </Button>
            <Button size="sm" variant="ghost" :disabled="refreshing" @click="handleRefreshStatus">
              {{ refreshing ? 'Verificando...' : 'Já verifiquei, atualizar status' }}
            </Button>
          </div>
        </div>

        <p v-else class="text-sm text-muted-foreground">
          Seu e-mail está verificado. Obrigado por manter sua conta segura.
        </p>
      </CardContent>

      <CardContent v-else class="flex flex-col gap-5">
        <Skeleton class="size-16 rounded-full" />

        <div class="flex flex-col gap-1">
          <span class="text-sm text-muted-foreground">Nome</span>
          <Skeleton class="h-5 w-32" />
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-sm text-muted-foreground">E-mail</span>
          <Skeleton class="h-5 w-48" />
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { sendEmailVerification } from 'firebase/auth'

useHead({
  title: 'Minha conta',
})

const user = useCurrentUser()

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

const emailVerified = ref(user.value?.emailVerified ?? false)

watch(user, (currentUser) => {
  emailVerified.value = currentUser?.emailVerified ?? false
}, { immediate: true })

const resending = ref(false)
const resendMessage = ref('')
const resendError = ref('')

async function handleResend() {
  if (!user.value) return

  resending.value = true
  resendMessage.value = ''
  resendError.value = ''

  try {
    await sendEmailVerification(user.value)
    resendMessage.value = 'E-mail de verificação reenviado. Confira sua caixa de entrada (e a de spam).'
  } catch {
    resendError.value = 'Não foi possível reenviar o e-mail agora. Tente novamente em instantes.'
  } finally {
    resending.value = false
  }
}

const refreshing = ref(false)

async function handleRefreshStatus() {
  if (!user.value) return

  refreshing.value = true

  try {
    await user.value.reload()
    emailVerified.value = user.value.emailVerified
  } finally {
    refreshing.value = false
  }
}
</script>
