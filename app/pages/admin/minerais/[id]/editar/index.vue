<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h1 class="text-section-title text-foreground">
        Editar mineral
      </h1>
      <p class="text-body text-muted-foreground">
        Atualize as informações de {{ mineral?.name }}.
      </p>
    </div>

    <MineralForm
      v-if="mineral"
      :initial-value="mineral"
      submit-label="Salvar alterações"
      :saving="saving"
      :form-error="formError"
      @submit="handleSubmit"
    />
    <p v-else-if="!loading" class="text-muted-foreground">
      Mineral não encontrado.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Mineral } from '~/composables/useMineralsStore'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const { getById, update, loading } = useMineralsStore()

const mineral = computed(() => getById(String(route.params.id)))
const saving = ref(false)
const formError = ref('')

useHead({
  title: () => `Editar ${mineral.value?.name ?? 'mineral'} · Dashboard`,
})

async function handleSubmit(data: Omit<Mineral, 'id'>) {
  if (!mineral.value) {
    return
  }

  saving.value = true
  formError.value = ''

  try {
    await update(mineral.value.id, data)
    navigateTo('/admin/minerais')
  }
  catch {
    formError.value = 'Não foi possível salvar as alterações. Tente novamente.'
    saving.value = false
  }
}
</script>
