<template>
  <div class="flex flex-col gap-10 py-8">
    <div class="flex flex-col gap-2">
      <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
        Referência
      </span>
      <h1 class="text-section-title font-heading text-foreground">
        Sistemas cristalinos
      </h1>
      <p class="max-w-2xl text-body text-muted-foreground">
        Todo mineral cresce organizando seus átomos numa estrutura interna repetitiva. A
        geometria dessa estrutura define o sistema cristalino do mineral — existem sete ao todo,
        cada um com sua própria simetria.
      </p>
    </div>

    <section class="flex flex-col gap-4">
      <div class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="system in crystalSystems"
          :key="system.name"
          class="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5"
        >
          <h2 class="text-card-name font-heading text-foreground">
            {{ system.name }}
          </h2>
          <p class="text-sm text-muted-foreground">
            {{ system.description }}
          </p>
          <div class="flex flex-wrap gap-1.5 pt-1">
            <Badge
              v-for="example in system.examples"
              :key="example"
              variant="outline"
              class="h-auto rounded-full border-border bg-accent px-2.5 py-0.5 font-mono text-xs font-normal text-primary"
            >
              {{ example }}
            </Badge>
          </div>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-mineral-title font-heading text-foreground">
        No nosso catálogo
      </h2>
      <p class="max-w-2xl text-body text-muted-foreground">
        O sistema cristalino explica a forma dos cristais que você vê nas fotos do catálogo — de
        colunas hexagonais a octaedros perfeitos.
      </p>
      <Button variant="link" as-child class="w-fit px-0 text-gold hover:text-primary">
        <NuxtLink to="/catalogo">
          Ver catálogo completo →
        </NuxtLink>
      </Button>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Sistemas cristalinos · Magia Cristais',
  meta: [
    {
      name: 'description',
      content: 'Conheça os sete sistemas cristalinos e como eles definem a forma dos minerais.',
    },
  ],
})

interface CrystalSystem {
  name: string
  description: string
  examples: string[]
}

const crystalSystems: CrystalSystem[] = [
  {
    name: 'Cúbico (Isométrico)',
    description: 'Três eixos de mesmo tamanho, todos em ângulo reto entre si — a simetria mais regular, formando cubos e octaedros.',
    examples: ['Pirita', 'Granada', 'Fluorita', 'Diamante'],
  },
  {
    name: 'Tetragonal',
    description: 'Dois eixos iguais e um terceiro mais curto ou mais longo, todos em ângulo reto.',
    examples: ['Zircão', 'Rutilo'],
  },
  {
    name: 'Ortorrômbico',
    description: 'Três eixos de tamanhos diferentes, todos ainda em ângulo reto entre si.',
    examples: ['Topázio', 'Peridoto', 'Andaluzita'],
  },
  {
    name: 'Hexagonal',
    description: 'Quatro eixos: três de mesmo tamanho cruzando a 120° num mesmo plano, e um quarto perpendicular a eles.',
    examples: ['Berilo', 'Esmeralda', 'Água-marinha', 'Apatita'],
  },
  {
    name: 'Trigonal (Romboédrico)',
    description: 'Aparentado do sistema hexagonal, mas com simetria de três lados em vez de seis.',
    examples: ['Quartzo', 'Ametista', 'Citrino', 'Turmalina', 'Calcita'],
  },
  {
    name: 'Monoclínico',
    description: 'Três eixos de tamanhos diferentes, com apenas dois ângulos retos entre eles.',
    examples: ['Gipsita', 'Ortoclásio', 'Azurita', 'Malaquita'],
  },
  {
    name: 'Triclínico',
    description: 'Três eixos de tamanhos diferentes, sem nenhum ângulo reto entre eles — a simetria mais baixa dos sete sistemas.',
    examples: ['Turquesa', 'Cianita', 'Labradorita'],
  },
]
</script>
