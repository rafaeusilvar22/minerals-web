<template>
  <div class="flex flex-col gap-6 py-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-1">
        <h1 class="text-section-title font-heading text-foreground">
          Minha conta
        </h1>
        <p class="text-body text-muted-foreground">
          Suas informações de acesso e segurança.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button variant="outline" as-child>
          <NuxtLink to="/minha-lista">
            <LucideGem />
            Minha lista
          </NuxtLink>
        </Button>
        <Button variant="outline" as-child>
          <NuxtLink to="/identificar">
            <LucideScanEye />
            Identificar mineral
          </NuxtLink>
        </Button>
      </div>
    </div>

    <Card class="max-w-xl">
      <CardHeader>
        <CardTitle class="text-base">
          Dados da conta
        </CardTitle>
      </CardHeader>
      <CardContent v-if="isMounted && ready" class="flex flex-col gap-5">
        <div class="flex items-center gap-4">
          <img v-if="user" :src="avatarUrl(avatarSeed)" :alt="user.email ?? 'Avatar'" class="size-16 rounded-full border border-border">
          <Button size="sm" variant="outline" type="button" @click="handleOpenPicker">
            Escolher avatar
          </Button>
        </div>

        <div v-if="pickerOpen" class="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-4">
          <div class="flex flex-wrap gap-3">
            <button
              v-for="seed in avatarOptions"
              :key="seed"
              type="button"
              class="rounded-full transition"
              :class="seed === pendingSeed ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'ring-1 ring-border hover:ring-primary/50'"
              aria-label="Usar este avatar"
              @click="pendingSeed = seed"
            >
              <img :src="avatarUrl(seed)" alt="" class="size-12 rounded-full">
            </button>
          </div>

          <Button size="sm" variant="outline" type="button" class="self-start" @click="regenerateAvatarOptions">
            Gerar novas opções
          </Button>

          <div class="flex gap-2">
            <Button size="sm" :disabled="!pendingSeed || savingAvatar" @click="handleSaveAvatar">
              {{ savingAvatar ? 'Salvando...' : 'Salvar' }}
            </Button>
            <Button size="sm" variant="ghost" type="button" :disabled="savingAvatar" @click="handleCancelPicker">
              Cancelar
            </Button>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-sm text-muted-foreground">Nome</span>

          <div v-if="!editingName" class="flex items-center gap-2">
            <span class="text-body text-foreground">{{ displayName || '—' }}</span>
            <Button size="sm" variant="ghost" type="button" @click="handleOpenNameEdit">
              Editar
            </Button>
          </div>

          <div v-else class="flex flex-col gap-2">
            <Input v-model="nameDraft" type="text" class="max-w-xs" placeholder="Seu nome" />
            <div class="flex gap-2">
              <Button size="sm" :disabled="!nameDraft.trim() || savingName" @click="handleSaveName">
                {{ savingName ? 'Salvando...' : 'Salvar' }}
              </Button>
              <Button size="sm" variant="ghost" type="button" :disabled="savingName" @click="handleCancelNameEdit">
                Cancelar
              </Button>
            </div>
          </div>
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
import { sendEmailVerification, updateProfile } from 'firebase/auth'

useHead({
  title: 'Minha conta',
})

const user = useCurrentUser()
const { avatarSeed, ready } = useUserProfile()

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

const emailVerified = ref(user.value?.emailVerified ?? false)
const displayName = ref(user.value?.displayName ?? '')

watch(user, (currentUser) => {
  emailVerified.value = currentUser?.emailVerified ?? false
  displayName.value = currentUser?.displayName ?? ''
}, { immediate: true })

const editingName = ref(false)
const nameDraft = ref('')
const savingName = ref(false)

function handleOpenNameEdit() {
  nameDraft.value = displayName.value
  editingName.value = true
}

function handleCancelNameEdit() {
  editingName.value = false
}

async function handleSaveName() {
  const trimmed = nameDraft.value.trim()
  if (!user.value || !trimmed || savingName.value) return

  savingName.value = true
  try {
    await updateProfile(user.value, { displayName: trimmed })
    await setDisplayName(user.value.uid, trimmed)
    displayName.value = trimmed
    editingName.value = false
  } finally {
    savingName.value = false
  }
}

const pickerOpen = ref(false)
const avatarOptions = ref<string[]>([])
const pendingSeed = ref<string | null>(null)
const savingAvatar = ref(false)

function regenerateAvatarOptions() {
  avatarOptions.value = Array.from({ length: 6 }, () => randomAvatarSeed())
  pendingSeed.value = null
}

function handleOpenPicker() {
  pickerOpen.value = true
  regenerateAvatarOptions()
}

function handleCancelPicker() {
  pickerOpen.value = false
  pendingSeed.value = null
}

async function handleSaveAvatar() {
  if (!user.value || !pendingSeed.value) return

  savingAvatar.value = true
  try {
    await setAvatarSeed(user.value.uid, pendingSeed.value)
    pickerOpen.value = false
    pendingSeed.value = null
  } finally {
    savingAvatar.value = false
  }
}

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
