<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-section-title text-foreground">
          Minerais
        </h1>
        <p class="text-body text-muted-foreground">
          Consulte os minerais cadastrados no catálogo.
        </p>
      </div>

      <Button as-child>
        <NuxtLink to="/admin/minerais/novo">
          <Plus class="size-4" />
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
            <TableHead>Fórmula</TableHead>
            <TableHead class="text-right">
              Dureza (Mohs)
            </TableHead>
            <TableHead class="w-10" />
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
              <TableCell class="flex justify-end">
                <Skeleton class="h-4 w-6" />
              </TableCell>
              <TableCell>
                <Skeleton class="size-8 rounded-md" />
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
              <TableCell class="font-mono text-muted-foreground">
                {{ mineral.formula }}
              </TableCell>
              <TableCell class="text-right text-muted-foreground">
                {{ formatHardness(mineral) }}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon-sm" aria-label="Ações do mineral">
                      <MoreHorizontal class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem as-child>
                      <NuxtLink :to="`/admin/minerais/${mineral.id}/editar`">
                        Editar
                      </NuxtLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" @click="remove(mineral.id)">
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
import { MoreHorizontal, Plus } from '@lucide/vue'

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
