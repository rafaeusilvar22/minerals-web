<template>
  <div class="flex flex-col gap-8 py-8">
    <div class="flex flex-col gap-1">
      <h1 class="text-section-title font-heading text-foreground">
        Identificar mineral
      </h1>
      <p class="text-body text-muted-foreground">
        Envie uma foto e nossa IA analisa a cor, o brilho e o formato da pedra, comparando com os minerais do nosso
        catálogo. Como a análise por imagem não é 100% precisa, ela pode errar — por isso, em vez de uma resposta
        única, sugerimos até 3 pedras mais prováveis.
      </p>
      <p class="text-sm text-muted-foreground">
        Pra um resultado melhor: tire uma foto nítida, com boa iluminação, focando só na pedra e sem outros objetos no quadro.
      </p>
    </div>

    <div v-if="history.length" class="flex flex-col gap-3">
      <div class="flex items-center justify-between gap-4">
        <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-muted-foreground">
          Identificações recentes
        </span>
        <NuxtLink to="/identificar/historico" class="text-sm font-medium text-gold hover:text-primary">
          Ver tudo →
        </NuxtLink>
      </div>

      <div class="flex flex-col gap-2">
        <div v-for="entry in recentHistory" :key="entry.id" class="flex items-center gap-3 rounded-lg border border-border p-3">
          <img :src="entry.imageUrl" alt="" class="size-12 shrink-0 rounded-lg border border-border object-cover">

          <div class="flex min-w-0 flex-1 flex-col gap-1">
            <div class="flex flex-wrap gap-x-2 gap-y-1">
              <template v-if="entry.candidates.length">
                <NuxtLink
                  v-for="candidate in entry.candidates"
                  :key="candidate.mineralId"
                  :to="`/minerais/${candidate.mineralId}`"
                  class="text-sm font-medium text-foreground hover:text-gold"
                >
                  {{ getMineralName(candidate.mineralId) }}
                </NuxtLink>
              </template>
              <span v-else-if="entry.status === 'failed'" class="text-sm text-destructive">
                Não foi possível analisar essa foto
              </span>
              <span v-else class="text-sm text-muted-foreground">Nenhum mineral compatível</span>
            </div>
            <span class="text-xs text-muted-foreground">{{ formatDate(entry.createdAt) }}</span>
          </div>

          <Button type="button" variant="ghost" size="icon-sm" aria-label="Remover do histórico" @click="handleRemoveHistory(entry.id)">
            <LucideTrash2 class="size-4" />
          </Button>
        </div>
      </div>
    </div>

    <Card v-if="needsVerification" class="max-w-xl">
      <CardContent class="flex flex-col gap-3">
        <p class="text-body text-muted-foreground">
          Verifique seu e-mail antes de usar o identificador de minerais — isso ajuda a manter a IA disponível
          pra todo mundo, sem uso indevido.
        </p>
        <Button as-child size="sm" class="self-start">
          <NuxtLink to="/minha-conta">
            Verificar e-mail
          </NuxtLink>
        </Button>
      </CardContent>
    </Card>

    <Card v-else-if="remaining === 0" class="max-w-xl">
      <CardContent class="flex flex-col gap-3">
        <p class="text-body text-muted-foreground">
          Você atingiu o limite diário de identificações. Volte amanhã para identificar mais minerais.
        </p>
      </CardContent>
    </Card>

    <template v-else>
      <p v-if="remaining !== null && phase === 'idle'" class="text-sm text-muted-foreground">
        Restam {{ remaining }} de {{ DAILY_IDENTIFICATION_LIMIT }} identificações hoje.
      </p>

      <Card class="max-w-xl">
        <CardContent class="flex flex-col gap-4">
          <div v-if="phase === 'idle'" class="flex flex-wrap gap-2">
            <Button type="button" @click="cameraInput?.click()">
              <LucideCamera />
              Tirar foto
            </Button>
            <Button type="button" variant="outline" @click="galleryInput?.click()">
              <LucideImage />
              Escolher da galeria
            </Button>
            <input
              ref="cameraInput"
              type="file"
              accept="image/*"
              capture="environment"
              class="hidden"
              @change="onFileSelected"
            >
            <input
              ref="galleryInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileSelected"
            >
          </div>

          <div v-if="previewUrl" class="flex flex-col gap-4">
            <div class="overflow-hidden rounded-2xl border border-border bg-muted">
              <img :src="previewUrl" alt="Foto selecionada" class="aspect-4/3 w-full object-cover">
            </div>

            <p v-if="phase === 'uploading' || phase === 'analyzing'" class="text-sm text-muted-foreground">
              {{ phase === 'uploading' ? 'Enviando foto...' : 'Analisando com IA...' }}
            </p>

            <div v-if="phase === 'preview'" class="flex gap-2">
              <Button type="button" :disabled="submitting" @click="handleSubmit">
                Identificar
              </Button>
              <Button type="button" variant="ghost" :disabled="submitting" @click="handleReset">
                Trocar foto
              </Button>
            </div>
          </div>

          <p v-if="phase === 'error'" class="text-sm text-destructive">
            {{ errorMessage }}
          </p>
          <Button v-if="phase === 'error'" type="button" variant="outline" class="self-start" @click="handleReset">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>

      <div v-if="phase === 'results'" class="flex flex-col gap-6">
        <div v-if="candidates.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="candidate in candidates" :key="candidate.mineral.id" class="flex flex-col gap-2">
            <NuxtLink :to="`/minerais/${candidate.mineral.id}`" class="block min-w-0 transition-transform hover:-translate-y-0.5">
              <MineralCard
                :id="candidate.mineral.id"
                :name="candidate.mineral.name"
                :description="candidate.mineral.description"
                :dot-color="candidate.mineral.dotColor"
                :image="candidate.mineral.images[0]"
              />
            </NuxtLink>
            <div class="flex items-center gap-2">
              <Badge variant="outline">
                Confiança {{ candidate.confidence }}
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ candidate.reasoning }}
            </p>
          </div>
        </div>

        <Card v-else class="max-w-xl">
          <CardContent class="flex flex-col gap-3">
            <p class="text-body text-muted-foreground">
              Não encontramos nenhum mineral do nosso catálogo com confiança suficiente para essa foto.
              Tente uma foto mais nítida, com boa iluminação e enquadrando bem a pedra.
            </p>
          </CardContent>
        </Card>

        <Button type="button" variant="outline" class="self-start" @click="handleReset">
          Nova identificação
        </Button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { IdentificationHistoryEntry } from '~/composables/useIdentificationHistory'
import type { IdentifiedCandidate } from '~/composables/useMineralIdentification'

useHead({
  title: 'Identificar mineral · Magia Cristais',
})

const user = useCurrentUser()
const { upload } = useCloudinaryUpload()
const { identify, error: identifyError } = useMineralIdentification()
const { remaining, refresh, recordUsage } = useIdentificationLimit()
const { history, fetchHistory, addEntry, removeEntry } = useIdentificationHistory()
const { getById: getMineralById } = useMineralsStore()

// A busca já limita a 3, mas addEntry só prepende (sem truncar) — o slice
// aqui garante que essa listagem "recentes" nunca cresça além de 3 mesmo
// depois de uma identificação nova nesta mesma sessão.
const recentHistory = computed(() => history.value.slice(0, RECENT_HISTORY_LIMIT))

// Exigir e-mail verificado encarece criar conta nova só pra ganhar mais
// identificações grátis — não impede quem usa e-mail descartável, mas
// já filtra a maior parte do abuso casual.
const needsVerification = computed(() => !!user.value && !user.value.emailVerified)

const cameraInput = useTemplateRef('cameraInput')
const galleryInput = useTemplateRef('galleryInput')

type Phase = 'idle' | 'preview' | 'uploading' | 'analyzing' | 'results' | 'error'

const phase = ref<Phase>('idle')
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const candidates = ref<IdentifiedCandidate[]>([])
const errorMessage = ref('')
const submitting = ref(false)

onMounted(() => {
  watch(user, (currentUser) => {
    if (currentUser) {
      refresh(currentUser.uid)
      fetchHistory(currentUser.uid)
    }
  }, { immediate: true })
})

function getMineralName(mineralId: string) {
  return getMineralById(mineralId)?.name ?? 'Mineral removido'
}

function formatDate(timestamp: IdentificationHistoryEntry['createdAt']) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(timestamp.toDate())
}

async function handleRemoveHistory(id: string) {
  if (!user.value) return
  await removeEntry(user.value.uid, id)
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Selecione um arquivo de imagem.'
    phase.value = 'error'
    return
  }

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  phase.value = 'preview'
}

async function handleSubmit() {
  if (!user.value || !selectedFile.value || submitting.value || needsVerification.value) return

  await refresh(user.value.uid)
  if ((remaining.value ?? 0) <= 0) {
    phase.value = 'error'
    errorMessage.value = 'Você atingiu o limite diário de identificações. Volte amanhã.'
    return
  }

  submitting.value = true
  phase.value = 'uploading'
  errorMessage.value = ''

  let imageUrl: string
  try {
    imageUrl = await upload(selectedFile.value, 'identifications')
  }
  catch {
    // Sem URL nenhuma pra guardar — não há o que registrar no histórico aqui.
    errorMessage.value = 'Não foi possível enviar a foto. Tente novamente.'
    phase.value = 'error'
    submitting.value = false
    return
  }

  phase.value = 'analyzing'

  try {
    const result = await identify(imageUrl)
    candidates.value = result.candidates
    await recordUsage(user.value.uid)
    await addEntry(user.value.uid, imageUrl, result.candidates.map(candidate => ({
      mineralId: candidate.mineral.id,
      confidence: candidate.confidence,
      reasoning: candidate.reasoning,
    })), 'completed')
    phase.value = 'results'
  }
  catch {
    // O upload já foi feito (a foto já existe no Cloudinary), então vale
    // registrar a tentativa mesmo sem resultado da IA — não some do histórico.
    await addEntry(user.value.uid, imageUrl, [], 'failed')
    errorMessage.value = identifyError.value || 'Não foi possível identificar essa foto. Tente novamente.'
    phase.value = 'error'
  }
  finally {
    submitting.value = false
  }
}

function handleReset() {
  selectedFile.value = null
  previewUrl.value = null
  candidates.value = []
  errorMessage.value = ''
  phase.value = 'idle'
}
</script>
