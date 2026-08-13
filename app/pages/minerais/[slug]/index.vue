<template>
  <div class="flex flex-col gap-8 py-8">
    <NuxtLink to="/" class="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
      <LucideArrowLeft class="size-4" />
      Voltar ao catálogo
    </NuxtLink>

    <div v-if="pending" class="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <Skeleton class="aspect-4/3 w-full rounded-2xl" />
      <div class="flex flex-col gap-4">
        <Skeleton class="h-4 w-24" />
        <Skeleton class="h-10 w-64" />
        <Skeleton class="h-5 w-32" />
        <Skeleton class="h-20 w-full" />
      </div>
    </div>

    <div v-else-if="mineral" class="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
      <div class="flex flex-col gap-4">
        <Carousel v-if="mineral.images.length > 1" class="w-full">
          <CarouselContent>
            <CarouselItem v-for="(image, index) in mineral.images" :key="image">
              <div class="aspect-4/3 overflow-hidden rounded-2xl border border-border bg-muted">
                <NuxtImg
                  provider="cloudinary"
                  :src="cloudinaryPath(image)"
                  :alt="`${mineral.name} · foto ${index + 1}`"
                  width="800"
                  height="600"
                  fit="cover"
                  class="size-full object-cover"
                />
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
          <NuxtImg
            v-if="mineral.images.length"
            provider="cloudinary"
            :src="cloudinaryPath(mineral.images[0])"
            :alt="mineral.name"
            width="640"
            height="480"
            fit="cover"
            class="size-full object-cover"
          />
          <span v-else class="text-eyebrow font-heading uppercase tracking-[0.13em] text-muted-foreground">
            Foto · {{ mineral.name }}
          </span>
        </div>
      </div>

      <div class="flex flex-col items-start gap-4">
        <h1 class="text-mineral-title font-heading text-foreground">
          {{ mineral.name }}
        </h1>

        <MineralStatusToggle :mineral-id="mineral.id" :name="mineral.name" />

        <div class="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
          <div v-if="mineral.waterproof !== undefined" class="flex flex-col gap-1">
            <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
              À prova d'água
            </span>
            <p class="text-body text-muted-foreground">
              {{ mineral.waterproof ? "Sim" : "Não" }}
            </p>
          </div>
          <div v-if="mineral.category" class="flex flex-col gap-1">
            <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
              Categoria
            </span>
            <p class="text-body text-muted-foreground">
              {{ mineral.category.name }}
            </p>
          </div>
          <div v-if="mineral.chakras?.length" class="flex flex-col gap-1">
            <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
              Chakra
            </span>
            <p class="text-body text-muted-foreground">
              {{ mineral.chakras.join(', ') }}
            </p>
          </div>
          <div v-if="mineral.colors?.length" class="flex flex-col gap-1">
            <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
              Cor
            </span>
            <p class="text-body text-muted-foreground">
              {{ mineral.colors.join(', ') }}
            </p>
          </div>
          <div v-if="mineral.hardnessMin != null && mineral.hardnessMax != null" class="flex flex-col gap-1">
            <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
              Dureza
            </span>
            <p class="text-body text-muted-foreground">
              {{ formatHardness(mineral) }} · Mohs
            </p>
          </div>
          <div v-if="mineral.element" class="flex flex-col gap-1">
            <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
              Elemento
            </span>
            <p class="text-body text-muted-foreground">
              {{ mineral.element }}
            </p>
          </div>
          <div v-if="mineral.planet" class="flex flex-col gap-1">
            <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
              Planeta
            </span>
            <p class="text-body text-muted-foreground">
              {{ mineral.planet }}
            </p>
          </div>
          <div v-if="mineral.zodiacSigns?.length" class="flex flex-col gap-1">
            <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
              Signo
            </span>
            <p class="text-body text-muted-foreground">
              {{ (mineral.zodiacSigns ?? []).join(', ') }}
            </p>
          </div>
        </div>

        <div v-if="mineral.magicalProperties" class="flex flex-col gap-1">
          <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
            Propriedades mágicas
          </span>
          <p class="text-body text-muted-foreground">
            {{ mineral.magicalProperties }}
          </p>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
            Descrição
          </span>
          <p class="text-body text-muted-foreground">
            {{ mineral.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/composables/useCategoriesStore'
import type { Mineral } from '~/composables/useMineralsStore'

interface MineralWithCategory extends Mineral {
  category: Category | null
}

const route = useRoute()
const slug = String(route.params.slug)

const { data: mineral, pending } = await useAsyncData(
  `mineral-${slug}`,
  () => $fetch<MineralWithCategory>(`/api/minerals/${slug}`),
)

if (!pending.value && !mineral.value) {
  throw createError({ statusCode: 404, statusMessage: 'Mineral não encontrado.', fatal: true })
}

useSeo(() => ({
  title: mineral.value ? `${mineral.value.name} · Magia Cristais` : 'Mineral · Magia Cristais',
  description: mineral.value?.description ?? 'Detalhes do mineral.',
  image: mineral.value?.images?.[0],
}))

useHead(() => ({
  script: mineral.value
    ? [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: mineral.value.name,
            description: mineral.value.description,
            image: mineral.value.images,
            category: mineral.value.category?.name,
          }),
        },
      ]
    : [],
}))

function formatHardness(value: { hardnessMin: number, hardnessMax: number }) {
  return value.hardnessMin === value.hardnessMax
    ? `${value.hardnessMin}`
    : `${value.hardnessMin}–${value.hardnessMax}`
}
</script>
