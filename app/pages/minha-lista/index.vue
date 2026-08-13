<template>
  <div class="flex flex-col gap-8 py-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-1">
        <h1 class="text-section-title font-heading text-foreground">
          Minha lista
        </h1>
        <p class="text-body text-muted-foreground">
          Os minerais que você já tem e os que deseja ter.
        </p>
      </div>

      <Button variant="outline" as-child>
        <NuxtLink to="/identificar">
          <LucideScanEye />
          Identificar mineral
        </NuxtLink>
      </Button>
    </div>

    <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton v-for="n in 3" :key="n" class="aspect-4/3 rounded-2xl" />
    </div>

    <template v-else>
      <div class="flex flex-col gap-4">
        <h2 class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
          Já tenho
        </h2>
        <p v-if="!haveMinerals.length" class="text-body text-muted-foreground">
          Nenhum mineral marcado como "já tenho" ainda.
        </p>
        <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="mineral in haveMinerals"
            :key="mineral.id"
            :to="`/minerais/${mineral.slug}`"
            class="block min-w-0 transition-transform hover:-translate-y-0.5"
          >
            <MineralCard
              :id="mineral.id"
              :name="mineral.name"
              :description="mineral.description"
              :dot-color="getCategory(mineral.categorySlug)?.dotColor ?? 'var(--muted-foreground)'"
              :image="mineral.images[0]"
            />
          </NuxtLink>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <h2 class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
          Quero ter
        </h2>
        <p v-if="!wantMinerals.length" class="text-body text-muted-foreground">
          Nenhum mineral marcado como "quero ter" ainda.
        </p>
        <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="mineral in wantMinerals"
            :key="mineral.id"
            :to="`/minerais/${mineral.slug}`"
            class="block min-w-0 transition-transform hover:-translate-y-0.5"
          >
            <MineralCard
              :id="mineral.id"
              :name="mineral.name"
              :description="mineral.description"
              :dot-color="getCategory(mineral.categorySlug)?.dotColor ?? 'var(--muted-foreground)'"
              :image="mineral.images[0]"
            />
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Minha lista · Magia Cristais',
})

const { minerals, loading: mineralsLoading } = useMineralsStore()
const { getBySlug: getCategory } = useCategoriesStore()
const { interactions, ready } = useMineralInteractions()

const loading = computed(() => mineralsLoading.value || !ready.value)

const haveMinerals = computed(() => minerals.value.filter(mineral => interactions.value[mineral.id] === 'have'))
const wantMinerals = computed(() => minerals.value.filter(mineral => interactions.value[mineral.id] === 'want'))
</script>
