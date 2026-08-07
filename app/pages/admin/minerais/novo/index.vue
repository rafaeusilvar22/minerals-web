<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h1 class="text-section-title font-heading text-foreground">
        Novo mineral
      </h1>
      <p class="text-body text-muted-foreground">
        Cadastre um novo mineral no catálogo.
      </p>
    </div>

    <MineralForm
      submit-label="Criar mineral"
      :saving="saving"
      :form-error="formError"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import type { Mineral } from '~/composables/useMineralsStore'

definePageMeta({
  layout: 'admin',
})

useHead({
  title: 'Novo mineral · Dashboard',
})

const { create } = useMineralsStore()
const saving = ref(false)
const formError = ref('')

async function handleSubmit(data: Omit<Mineral, 'id'>) {
  saving.value = true
  formError.value = ''

  try {
    await create(data)
    navigateTo('/admin/minerais')
  }
  catch {
    formError.value = 'Não foi possível criar o mineral. Tente novamente.'
    saving.value = false
  }
}
</script>
