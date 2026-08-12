<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold tracking-tight">
        Configurações
      </h1>
      <p class="text-muted-foreground">
        Ajustes gerais de exibição do catálogo.
      </p>
    </div>

    <Card class="max-w-xl">
      <CardHeader>
        <CardTitle class="text-base">
          Mineral do dia
        </CardTitle>
        <CardDescription>
          Escolha o mineral em destaque na página inicial e por quanto tempo ele deve ficar visível.
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <p v-if="active" class="text-sm text-muted-foreground">
          Em destaque agora: <span class="font-medium text-foreground">{{ activeMineral?.name ?? '...' }}</span>
          ·
          <span v-if="expiresAt">Expira em {{ formatDate(expiresAt) }}</span>
          <span v-else>Sem expiração</span>
        </p>
        <p v-else class="text-sm text-muted-foreground">
          Nenhum mineral em destaque no momento.
        </p>

        <div class="flex flex-col gap-2">
          <Label for="featured-mineral">Mineral</Label>
          <Select v-model="selectedMineralId">
            <SelectTrigger id="featured-mineral" class="w-full">
              <SelectValue placeholder="Selecione um mineral" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="mineral in minerals" :key="mineral.id" :value="mineral.id">
                {{ mineral.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex flex-col gap-2">
          <Label for="featured-duration">Tempo de exibição</Label>
          <Select v-model="selectedDuration">
            <SelectTrigger id="featured-duration" class="w-full">
              <SelectValue placeholder="Selecione o tempo de exibição" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="option in featuredMineralDurationOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p v-if="formError" class="text-sm text-destructive">
          {{ formError }}
        </p>

        <div class="flex gap-2">
          <Button :disabled="!selectedMineralId || saving" @click="handleSave">
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </Button>
          <Button v-if="active" type="button" variant="outline" :disabled="saving" @click="handleClear">
            Remover destaque
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card class="max-w-3xl">
      <CardHeader>
        <CardTitle class="text-base">
          Página Sobre
        </CardTitle>
        <CardDescription>
          Estruture o conteúdo exibido na página pública "Sobre".
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <Skeleton v-if="!aboutInitialized" class="h-[268px] w-full rounded-lg" />
        <RichTextEditor v-else v-model="aboutHtml" placeholder="Escreva sobre o projeto..." />

        <p v-if="aboutError" class="text-sm text-destructive">
          {{ aboutError }}
        </p>

        <div>
          <Button :disabled="aboutSaving" @click="handleSaveAbout">
            {{ aboutSaving ? 'Salvando...' : 'Salvar' }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { FeaturedMineralDuration } from '~/composables/useFeaturedMineral'
import { featuredMineralDurationOptions } from '~/composables/useFeaturedMineral'

definePageMeta({
  layout: 'admin',
})

useHead({
  title: 'Configurações · Dashboard',
})

const { minerals, getById } = useMineralsStore()
const { active, expiresAt, set, clear } = useFeaturedMineral()
const { content: aboutContent, initialized: aboutInitialized, save: saveAbout } = useAboutContent()

const selectedMineralId = ref('')
const selectedDuration = ref<FeaturedMineralDuration>('1d')
const saving = ref(false)
const formError = ref('')

const aboutHtml = ref('')
const aboutSaving = ref(false)
const aboutError = ref('')

// Syncs only until the initial fetch finishes — after that the form is the
// source of truth, otherwise a late fetch would overwrite what the admin already typed.
const stopAboutSync = watch([aboutContent, aboutInitialized], ([value, ready]) => {
  if (!ready) return
  aboutHtml.value = value?.html ?? ''
  stopAboutSync()
}, { immediate: true })

const activeMineral = computed(() => active.value ? getById(active.value.mineralId) : null)

watch(active, (value) => {
  if (value) {
    selectedMineralId.value = value.mineralId
    selectedDuration.value = value.duration
  }
}, { immediate: true })

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

async function handleSave() {
  if (!selectedMineralId.value) {
    return
  }

  saving.value = true
  formError.value = ''

  try {
    await set(selectedMineralId.value, selectedDuration.value)
  }
  catch {
    formError.value = 'Não foi possível salvar o mineral do dia. Tente novamente.'
  }
  finally {
    saving.value = false
  }
}

async function handleClear() {
  saving.value = true
  formError.value = ''

  try {
    await clear()
    selectedMineralId.value = ''
    selectedDuration.value = '1d'
  }
  catch {
    formError.value = 'Não foi possível remover o mineral em destaque. Tente novamente.'
  }
  finally {
    saving.value = false
  }
}

async function handleSaveAbout() {
  aboutSaving.value = true
  aboutError.value = ''

  try {
    await saveAbout(aboutHtml.value)
  }
  catch {
    aboutError.value = 'Não foi possível salvar o conteúdo. Tente novamente.'
  }
  finally {
    aboutSaving.value = false
  }
}
</script>
