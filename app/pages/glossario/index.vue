<template>
  <div class="flex flex-col gap-10 py-8">
    <div class="flex flex-col gap-2">
      <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
        Referência
      </span>
      <h1 class="text-section-title font-heading text-foreground">
        Glossário
      </h1>
      <p class="max-w-2xl text-body text-muted-foreground">
        Termos que aparecem nas fichas dos minerais do catálogo, tanto do lado da mineralogia
        quanto do lado místico/cristaloterapêutico.
      </p>
    </div>

    <section class="flex flex-col gap-4">
      <h2 class="text-mineral-title font-heading text-foreground">
        Termos de mineralogia
      </h2>
      <div class="grid gap-3 sm:grid-cols-2">
        <div
          v-for="term in mineralogyTerms"
          :key="term.label"
          class="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3"
        >
          <span class="text-body font-medium text-foreground">{{ term.label }}</span>
          <p class="text-sm text-muted-foreground">
            {{ term.definition }}
            <NuxtLink v-if="term.link" :to="term.link.to" class="text-gold hover:text-primary">
              {{ term.link.label }}
            </NuxtLink>
          </p>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-mineral-title font-heading text-foreground">
        Elementos
      </h2>
      <p class="max-w-2xl text-body text-muted-foreground">
        Cada mineral do catálogo tem um elemento associado, ligado às suas propriedades místicas.
      </p>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          v-for="item in elements"
          :key="item.label"
          class="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center"
        >
          <span class="flex size-12 items-center justify-center rounded-full border-2 border-border bg-card text-lg font-heading font-semibold text-foreground">
            {{ item.label[0] }}
          </span>
          <span class="text-card-name text-foreground">{{ item.label }}</span>
          <span class="text-xs text-muted-foreground">{{ item.meaning }}</span>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-mineral-title font-heading text-foreground">
        Chakras
      </h2>
      <p class="max-w-2xl text-body text-muted-foreground">
        Minerais também podem ser associados a um ou mais chakras, os centros de energia do
        corpo na tradição indiana.
      </p>
      <div class="grid gap-3 sm:grid-cols-2">
        <div
          v-for="chakra in chakras"
          :key="chakra.label"
          class="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3"
        >
          <span class="text-body text-foreground">{{ chakra.label }}</span>
          <span class="max-w-[60%] text-right text-sm text-muted-foreground">{{ chakra.meaning }}</span>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-mineral-title font-heading text-foreground">
        No nosso catálogo
      </h2>
      <p class="max-w-2xl text-body text-muted-foreground">
        Esses termos aparecem nas fichas de cada mineral do catálogo, junto com dureza, cores e
        signos associados.
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
useSeo({
  title: 'Glossário · Magia Cristais',
  description: 'Entenda os termos de mineralogia e cristaloterapia usados no catálogo de minerais.',
})

interface GlossaryTerm {
  label: string
  definition: string
  link?: { to: string, label: string }
}

const mineralogyTerms: GlossaryTerm[] = [
  {
    label: 'Dureza (Escala de Mohs)',
    definition: 'Resistência de um mineral ao risco, numa escala de 1 a 10.',
    link: { to: '/guia-de-dureza', label: 'Ver guia de dureza →' },
  },
  {
    label: 'Sistema cristalino',
    definition: 'A forma como os átomos de um mineral se organizam internamente, definindo a geometria dos seus cristais.',
    link: { to: '/sistemas-cristalinos', label: 'Ver sistemas cristalinos →' },
  },
  {
    label: 'Hábito cristalino',
    definition: 'A forma externa característica que um mineral costuma assumir ao crescer — em colunas, agrupado em drusas, maciço, etc.',
  },
  {
    label: 'Clivagem',
    definition: 'Tendência de um mineral se quebrar em superfícies planas e previsíveis, seguindo direções ligadas à sua estrutura cristalina.',
  },
  {
    label: 'Fratura',
    definition: 'Como um mineral se quebra quando não segue um plano de clivagem — de forma irregular, conchoidal, etc.',
  },
  {
    label: 'Brilho',
    definition: 'Como a superfície de um mineral reflete a luz: vítreo, metálico, resinoso, sedoso, entre outros.',
  },
  {
    label: 'Transparência',
    definition: 'O quanto a luz atravessa um mineral: transparente, translúcido ou opaco.',
  },
  {
    label: 'Piezoeletricidade',
    definition: 'Propriedade de alguns minerais (como o quartzo) de gerar carga elétrica quando pressionados mecanicamente.',
  },
]

const elements = [
  { label: 'Fogo', meaning: 'Transformação, energia e ação' },
  { label: 'Terra', meaning: 'Estabilidade, abundância e enraizamento' },
  { label: 'Ar', meaning: 'Clareza mental, comunicação e intuição' },
  { label: 'Água', meaning: 'Emoções, cura e fluidez' },
]

const chakras = [
  { label: 'Raiz', meaning: 'Segurança e enraizamento' },
  { label: 'Sacral', meaning: 'Criatividade e prazer' },
  { label: 'Plexo Solar', meaning: 'Autoestima e poder pessoal' },
  { label: 'Cardíaco', meaning: 'Amor e compaixão' },
  { label: 'Laríngeo', meaning: 'Comunicação e expressão' },
  { label: 'Frontal', meaning: 'Intuição e clareza mental' },
  { label: 'Coronário', meaning: 'Conexão espiritual' },
]
</script>
