<template>
  <NuxtLayout name="default">
    <div class="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center">
      <div class="relative flex size-24 items-center justify-center">
        <svg viewBox="0 0 100 100" class="absolute inset-0 size-full text-primary/15" fill="none">
          <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" stroke="currentColor" stroke-width="2" />
        </svg>
        <LucideGem class="size-9 text-primary" />
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-eyebrow uppercase text-muted-foreground">
          Erro {{ error?.statusCode ?? 404 }}
        </span>
        <h1 class="font-heading text-section-title text-foreground">
          {{ isNotFound ? 'Página não encontrada' : 'Ocorreu um erro inesperado' }}
        </h1>
        <p class="max-w-md text-body text-muted-foreground">
          {{ isNotFound
            ? 'O cristal que você procura não está nesta jazida. O endereço pode ter mudado ou nunca ter existido.'
            : 'Algo deu errado ao carregar esta página. Tente novamente em instantes.' }}
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-3">
        <Button as-child size="lg">
          <NuxtLink to="/">
            <LucideHome />
            Voltar ao início
          </NuxtLink>
        </Button>
        <Button variant="outline" size="lg" as-child>
          <NuxtLink to="/catalogo">
            <LucideSearch />
            Explorar catálogo
          </NuxtLink>
        </Button>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const isNotFound = computed(() => props.error?.statusCode === 404)

useSeoMeta({
  title: () => isNotFound.value ? 'Página não encontrada · Magia Cristais' : 'Erro · Magia Cristais',
  robots: 'noindex, follow',
})
</script>
