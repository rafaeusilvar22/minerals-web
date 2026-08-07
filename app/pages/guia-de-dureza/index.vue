<template>
  <div class="flex flex-col gap-10 py-8">
    <div class="flex flex-col gap-2">
      <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
        Referência
      </span>
      <h1 class="text-section-title font-heading text-foreground">
        Guia de dureza
      </h1>
      <p class="max-w-2xl text-body text-muted-foreground">
        A Escala de Mohs mede a dureza dos minerais por resistência ao risco, não por uma
        medida física absoluta: um mineral de número mais alto consegue riscar um de número
        mais baixo, mas não o contrário. Criada em 1812 pelo mineralogista Friedrich Mohs, ela
        é o padrão usado até hoje para identificar minerais em campo.
      </p>
    </div>

    <section class="flex flex-col gap-4">
      <h2 class="text-mineral-title font-heading text-foreground">
        A escala
      </h2>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div
          v-for="step in mohsScale"
          :key="step.value"
          class="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center"
        >
          <span
            class="flex size-12 items-center justify-center rounded-full border-2 bg-card text-lg font-heading font-semibold text-foreground"
            :style="{ borderColor: `color-mix(in oklch, var(--border) ${100 - step.value * 10}%, var(--primary) ${step.value * 10}%)` }"
          >
            {{ step.value }}
          </span>
          <span class="text-card-name text-foreground">{{ step.mineral }}</span>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-mineral-title font-heading text-foreground">
        Referências do dia a dia
      </h2>
      <p class="max-w-2xl text-body text-muted-foreground">
        Sem os minerais de referência em mãos, dá para estimar a dureza com objetos comuns:
      </p>
      <div class="grid gap-3 sm:grid-cols-2">
        <div
          v-for="item in everydayReferences"
          :key="item.label"
          class="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3"
        >
          <span class="text-body text-foreground">{{ item.label }}</span>
          <Badge
            variant="outline"
            class="h-auto rounded-full border-border bg-accent px-2.5 py-0.5 font-mono text-xs font-normal text-primary"
          >
            {{ item.hardness }}
          </Badge>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-mineral-title font-heading text-foreground">
        No nosso catálogo
      </h2>
      <p class="max-w-2xl text-body text-muted-foreground">
        Cada mineral do catálogo mostra sua dureza na Escala de Mohs — às vezes como uma
        faixa, já que impurezas e variações na estrutura cristalina podem alterar um pouco a
        dureza dentro da mesma espécie.
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
  title: "Guia de dureza · Magia Cristais",
  meta: [
    {
      name: "description",
      content: "Entenda a Escala de Mohs e como ela é usada para medir a dureza dos minerais.",
    },
  ],
});

interface MohsStep {
  value: number
  mineral: string
}

const mohsScale: MohsStep[] = [
  { value: 1, mineral: "Talco" },
  { value: 2, mineral: "Gipsita" },
  { value: 3, mineral: "Calcita" },
  { value: 4, mineral: "Fluorita" },
  { value: 5, mineral: "Apatita" },
  { value: 6, mineral: "Ortoclásio" },
  { value: 7, mineral: "Quartzo" },
  { value: 8, mineral: "Topázio" },
  { value: 9, mineral: "Coríndon" },
  { value: 10, mineral: "Diamante" },
];

const everydayReferences = [
  { label: "Unha", hardness: "~2,5" },
  { label: "Moeda de cobre", hardness: "~3,5" },
  { label: "Lâmina de canivete ou prego de aço", hardness: "~5,5" },
  { label: "Vidro de janela", hardness: "~5,5" },
  { label: "Lima de aço", hardness: "~6,5" },
];
</script>
