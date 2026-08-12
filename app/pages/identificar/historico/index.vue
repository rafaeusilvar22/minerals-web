<template>
  <div class="flex flex-col gap-6 py-8">
    <div class="flex flex-col gap-1">
      <NuxtLink to="/identificar" class="mb-2 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <LucideArrowLeft class="size-4" />
        Voltar
      </NuxtLink>
      <h1 class="text-section-title font-heading text-foreground">
        Histórico de identificações
      </h1>
      <p class="text-body text-muted-foreground">
        Todas as fotos que você já enviou pra identificação.
      </p>
    </div>

    <div v-if="loading" class="overflow-hidden rounded-2xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Foto</TableHead>
            <TableHead>Minerais sugeridos</TableHead>
            <TableHead>Data</TableHead>
            <TableHead class="w-16 text-right">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="n in 4" :key="n">
            <TableCell>
              <Skeleton class="size-12 rounded-lg" />
            </TableCell>
            <TableCell>
              <Skeleton class="h-4 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton class="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton class="ml-auto size-7 rounded-md" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <p v-else-if="!history.length" class="py-12 text-center text-body text-muted-foreground">
      Você ainda não identificou nenhum mineral.
    </p>

    <div v-else class="overflow-hidden rounded-2xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Foto</TableHead>
            <TableHead>Minerais sugeridos</TableHead>
            <TableHead>Data</TableHead>
            <TableHead class="w-16 text-right">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="entry in history" :key="entry.id">
            <TableCell>
              <img :src="entry.imageUrl" alt="" class="size-12 rounded-lg border border-border object-cover">
            </TableCell>
            <TableCell>
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
            </TableCell>
            <TableCell class="text-muted-foreground">
              {{ formatDate(entry.createdAt) }}
            </TableCell>
            <TableCell>
              <div class="flex justify-end">
                <Button variant="ghost" size="icon-sm" aria-label="Remover do histórico" title="Remover" @click="handleRemove(entry.id)">
                  <LucideTrash2 class="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IdentificationHistoryEntry } from '~/composables/useIdentificationHistory'

useHead({
  title: 'Histórico de identificações · Magia Cristais',
})

const user = useCurrentUser()
const { history, loading, fetchHistory, removeEntry } = useIdentificationHistory()
const { getById: getMineralById } = useMineralsStore()

onMounted(() => {
  watch(user, (currentUser) => {
    if (currentUser) fetchHistory(currentUser.uid, FULL_HISTORY_LIMIT)
  }, { immediate: true })
})

function getMineralName(mineralId: string) {
  return getMineralById(mineralId)?.name ?? 'Mineral removido'
}

function formatDate(timestamp: IdentificationHistoryEntry['createdAt']) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(timestamp.toDate())
}

async function handleRemove(id: string) {
  if (!user.value) return
  await removeEntry(user.value.uid, id)
}
</script>
