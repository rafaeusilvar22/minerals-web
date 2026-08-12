<template>
  <div class="flex flex-col gap-10 py-8">
    <div class="flex flex-col gap-2">
      <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
        Explorar
      </span>
      <h1 class="text-section-title font-heading text-foreground">
        Categorias
      </h1>
      <p class="max-w-2xl text-body text-muted-foreground">
        Cada mineral do catálogo pertence a uma categoria. Escolha uma abaixo para ver só os
        minerais dela.
      </p>
    </div>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton v-for="n in 6" :key="n" class="h-24 rounded-2xl" />
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="category in categoriesWithCount"
        :key="category.id"
        :to="`/catalogo?categoria=${category.slug}`"
        class="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-transform hover:-translate-y-0.5"
      >
        <span class="flex items-center gap-3">
          <span class="size-2.5 shrink-0 rounded-full" :style="{ backgroundColor: category.dotColor }" />
          <span class="text-card-name text-foreground">{{ category.name }}</span>
        </span>
        <Badge
          variant="outline"
          class="h-auto shrink-0 rounded-full border-border bg-accent px-2.5 py-0.5 font-mono text-xs font-normal text-primary"
        >
          {{ category.count }} {{ category.count === 1 ? 'mineral' : 'minerais' }}
        </Badge>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/composables/useCategoriesStore'
import type { Mineral } from '~/composables/useMineralsStore'

useHead({
  title: 'Categorias · Magia Cristais',
  meta: [
    {
      name: 'description',
      content: 'Navegue pelas categorias de minerais e pedras naturais do catálogo.',
    },
  ],
})

interface HomeData {
  minerals: Mineral[]
  categories: Category[]
  featuredMineralId: string | null
}

const { data: home, pending: loading } = await useAsyncData('home', () => $fetch<HomeData>('/api/home'))

const categoriesWithCount = computed(() => {
  const minerals = home.value?.minerals ?? []
  const categories = home.value?.categories ?? []

  return categories.map(category => ({
    ...category,
    count: minerals.filter(mineral => mineral.categorySlug === category.slug).length,
  }))
})
</script>
