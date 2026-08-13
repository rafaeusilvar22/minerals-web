<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-section-title font-heading text-foreground">
          Minerais
        </h1>
        <p class="text-body text-muted-foreground">
          Consulte os minerais cadastrados no catálogo.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button v-if="pendingSlugCount > 0" variant="outline" :disabled="backfilling" @click="runBackfill">
          {{ backfilling ? 'Gerando...' : `Gerar slugs pendentes (${pendingSlugCount})` }}
        </Button>
        <Button as-child>
          <NuxtLink to="/admin/minerais/novo">
            <LucidePlus class="size-4" />
            Novo mineral
          </NuxtLink>
        </Button>
      </div>
    </div>

    <div class="overflow-hidden rounded-2xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Elemento</TableHead>
            <TableHead>Dureza (Mohs)</TableHead>
            <TableHead class="w-20 text-right">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow v-for="n in 4" :key="n">
              <TableCell>
                <Skeleton class="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton class="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton class="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton class="h-4 w-6" />
              </TableCell>
              <TableCell>
                <div class="flex justify-end gap-1">
                  <Skeleton class="size-7 rounded-md" />
                  <Skeleton class="size-7 rounded-md" />
                  <Skeleton class="size-7 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          </template>

          <template v-else v-for="mineral in minerals" :key="mineral.id">
            <TableRow>
              <TableCell class="font-medium text-foreground">
                {{ mineral.name }}
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2 text-muted-foreground">
                  <span
                    class="inline-block size-2.5 shrink-0 rounded-full"
                    :style="{ backgroundColor: getCategory(mineral.categorySlug)?.dotColor }"
                  />
                  {{ getCategory(mineral.categorySlug)?.name }}
                </div>
              </TableCell>
              <TableCell class="text-muted-foreground">
                {{ mineral.element }}
              </TableCell>
              <TableCell class="text-muted-foreground">
                {{ formatHardness(mineral) }}
              </TableCell>
              <TableCell>
                <div class="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label="Ver mineral publicado" title="Ver mineral publicado" as-child>
                    <NuxtLink :to="`/minerais/${mineral.slug}`" target="_blank">
                      <LucideExternalLink class="size-4" />
                    </NuxtLink>
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Editar mineral" title="Editar" as-child>
                    <NuxtLink :to="`/admin/minerais/${mineral.id}/editar`">
                      <LucidePencil class="size-4" />
                    </NuxtLink>
                  </Button>
                  <Button variant="destructive" size="icon-sm" aria-label="Excluir mineral" title="Excluir" @click="remove(mineral.id)">
                    <LucideTrash2 class="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Mineral } from '~/composables/useMineralsStore'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
})

useHead({
  title: 'Minerais · Dashboard',
})

const { minerals, loading, remove, backfillMissingSlugs } = useMineralsStore()
const { getBySlug: getCategory } = useCategoriesStore()

const pendingSlugCount = computed(() => minerals.value.filter(mineral => !mineral.slug).length)
const backfilling = ref(false)

async function runBackfill() {
  backfilling.value = true
  try {
    const count = await backfillMissingSlugs()
    toast.success(`${count} mineral(is) atualizado(s) com slug.`)
  }
  catch {
    toast.error('Não foi possível gerar os slugs. Tente novamente.')
  }
  finally {
    backfilling.value = false
  }
}

function formatHardness(mineral: Mineral) {
  return mineral.hardnessMin === mineral.hardnessMax
    ? `${mineral.hardnessMin}`
    : `${mineral.hardnessMin}–${mineral.hardnessMax}`
}
</script>
