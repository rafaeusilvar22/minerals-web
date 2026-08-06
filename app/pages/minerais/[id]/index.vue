<template>
  <div class="flex flex-col gap-8 py-8">
    <NuxtLink to="/" class="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
      <ArrowLeft class="size-4" />
      Voltar ao catálogo
    </NuxtLink>

    <div v-if="loading" class="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <Skeleton class="aspect-4/3 w-full rounded-2xl" />
      <div class="flex flex-col gap-4">
        <Skeleton class="h-4 w-24" />
        <Skeleton class="h-10 w-64" />
        <Skeleton class="h-5 w-32" />
        <Skeleton class="h-20 w-full" />
      </div>
    </div>

    <div v-else-if="!mineral" class="flex flex-col items-start gap-3 py-12">
      <p class="text-body text-muted-foreground">
        Mineral não encontrado.
      </p>
      <Button as-child variant="outline">
        <NuxtLink to="/">
          Voltar ao catálogo
        </NuxtLink>
      </Button>
    </div>

    <div v-else class="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
      <div class="flex flex-col gap-4">
        <Carousel v-if="mineral.images.length > 1" class="w-full">
          <CarouselContent>
            <CarouselItem v-for="(image, index) in mineral.images" :key="image">
              <div class="aspect-4/3 overflow-hidden rounded-2xl border border-border bg-muted">
                <img :src="image" :alt="`${mineral.name} · foto ${index + 1}`" class="size-full object-cover">
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious class="left-3 size-9 border-none bg-background/90 text-foreground shadow-md backdrop-blur-sm hover:bg-background" />
          <CarouselNext class="right-3 size-9 border-none bg-background/90 text-foreground shadow-md backdrop-blur-sm hover:bg-background" />
        </Carousel>

        <div
          v-else
          class="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted"
          :style="!mineral.images.length ? {
            backgroundImage: 'repeating-linear-gradient(135deg, var(--accent) 0px, var(--accent) 1px, transparent 1px, transparent 14px)',
          } : undefined"
        >
          <img v-if="mineral.images.length" :src="mineral.images[0]" :alt="mineral.name" class="size-full object-cover">
          <span v-else class="text-eyebrow font-mono uppercase tracking-[0.13em] text-muted-foreground">
            Foto · {{ mineral.name }}
          </span>
        </div>
      </div>

      <div class="flex flex-col items-start gap-4">
        <span v-if="category" class="text-eyebrow font-mono uppercase tracking-[0.13em] text-primary">
          {{ category.name }}
        </span>

        <h1 class="text-mineral-title text-foreground">
          {{ mineral.name }}
        </h1>

        <p class="font-mono text-body text-primary">
          {{ mineral.formula }}
        </p>

        <div class="flex flex-wrap gap-2">
          <Badge variant="outline" class="h-auto rounded-full border-border bg-card px-3 py-1 text-xs font-normal text-foreground">
            Dureza {{ formatHardness(mineral) }} · Mohs
          </Badge>
          <Badge variant="outline" class="h-auto rounded-full border-border bg-card px-3 py-1 text-xs font-normal text-foreground">
            Sistema {{ mineral.crystalSystem }}
          </Badge>
          <Badge
            v-for="color in mineral.colors"
            :key="color"
            variant="outline"
            class="h-auto rounded-full border-border bg-card px-3 py-1 text-xs font-normal text-foreground"
          >
            Cor {{ color }}
          </Badge>
        </div>

        <p class="text-body text-muted-foreground">
          {{ mineral.description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'

const route = useRoute()

const { getById, loading } = useMineralsStore()
const { getBySlug: getCategoryBySlug } = useCategoriesStore()

const mineral = computed(() => getById(String(route.params.id)))
const category = computed(() => mineral.value ? getCategoryBySlug(mineral.value.categorySlug) : undefined)

useHead({
  title: () => mineral.value ? `${mineral.value.name} · Dicionário de Minerais` : 'Mineral · Dicionário de Minerais',
  meta: [
    {
      name: 'description',
      content: () => mineral.value?.description ?? 'Detalhes do mineral.',
    },
  ],
})

function formatHardness(value: { hardnessMin: number, hardnessMax: number }) {
  return value.hardnessMin === value.hardnessMax
    ? `${value.hardnessMin}`
    : `${value.hardnessMin}–${value.hardnessMax}`
}
</script>
