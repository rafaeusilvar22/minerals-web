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

      <Button as-child>
        <NuxtLink to="/admin/minerais/novo">
          <LucidePlus class="size-4" />
          Novo mineral
        </NuxtLink>
      </Button>
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
                    <NuxtLink :to="`/minerais/${mineral.id}`" target="_blank">
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

definePageMeta({
  layout: 'admin',
})

useHead({
  title: 'Minerais · Dashboard',
})

const { minerals, loading, remove } = useMineralsStore()
const { getBySlug: getCategory } = useCategoriesStore()

function formatHardness(mineral: Mineral) {
  return mineral.hardnessMin === mineral.hardnessMax
    ? `${mineral.hardnessMin}`
    : `${mineral.hardnessMin}–${mineral.hardnessMax}`
}
</script>
