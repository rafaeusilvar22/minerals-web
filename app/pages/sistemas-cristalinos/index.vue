<template>
  <div class="flex flex-col gap-10 py-8">
    <div class="flex flex-col gap-2">
      <span class="text-eyebrow uppercase tracking-[0.13em] text-primary">
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
          class="flex gap-4 rounded-lg border border-border bg-card p-5"
        >
          <div class="flex size-20 shrink-0 items-center justify-center rounded-xl bg-accent">
            <CrystalAxisDiagram :system="system.id" class="size-16" />
          </div>

          <div class="flex min-w-0 flex-1 flex-col gap-2">
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
useSeo({
  title: 'Sistemas cristalinos · Magia Cristais',
  description: 'Conheça os sete sistemas cristalinos e como eles definem a forma dos minerais.',
})

interface CrystalSystem {
  id: 'cubico' | 'tetragonal' | 'ortorrombico' | 'hexagonal' | 'trigonal' | 'monoclinico' | 'triclinico'
  name: string
  description: string
  examples: string[]
}

const crystalSystems: CrystalSystem[] = [
  {
    id: 'cubico',
    name: 'Cúbico (Isométrico)',
    description: 'Três eixos de mesmo tamanho, todos em ângulo reto entre si — a simetria mais regular dos sete sistemas, com quatro eixos de simetria de três lados cruzando as diagonais do cubo. Cresce em formas bem geométricas como cubos, octaedros e dodecaedros, e por isso costuma ser o mais fácil de reconhecer a olho nu.',
    examples: ['Pirita', 'Granada', 'Fluorita', 'Diamante'],
  },
  {
    id: 'tetragonal',
    name: 'Tetragonal',
    description: 'Dois eixos iguais e um terceiro mais curto ou mais longo, todos em ângulo reto — como se um cristal cúbico fosse esticado ou achatado ao longo de um único eixo. Costuma formar prismas de base quadrada e bipirâmides, com cristais mais alongados que os do sistema cúbico.',
    examples: ['Zircão', 'Rutilo'],
  },
  {
    id: 'ortorrombico',
    name: 'Ortorrômbico',
    description: 'Três eixos de tamanhos diferentes, todos ainda em ângulo reto entre si — como se o cristal cúbico fosse esticado de forma desigual em cada direção. Costuma aparecer em prismas de seção retangular ou romboidal, muitas vezes com cristais tabulares e faces bem definidas.',
    examples: ['Topázio', 'Peridoto', 'Andaluzita'],
  },
  {
    id: 'hexagonal',
    name: 'Hexagonal',
    description: 'Quatro eixos: três de mesmo tamanho cruzando a 120° num mesmo plano, e um quarto perpendicular a eles, dando origem a um eixo de simetria de seis lados. É o sistema por trás das clássicas colunas hexagonais — pense nos prismas de seis faces da esmeralda e da água-marinha, às vezes encimados por pirâmides na mesma proporção.',
    examples: ['Berilo', 'Esmeralda', 'Água-marinha', 'Apatita'],
  },
  {
    id: 'trigonal',
    name: 'Trigonal (Romboédrico)',
    description: 'Aparentado do sistema hexagonal, mas com simetria de três lados em vez de seis — a mesma cruz de quatro eixos, só que com um eixo de rotação de três lados no lugar de seis. É o sistema da calcita, que racha em romboedros quase perfeitos, e também do quartzo, cujos cristais parecem hexagonais à primeira vista mas escondem essa simetria de três lados.',
    examples: ['Quartzo', 'Ametista', 'Citrino', 'Turmalina', 'Calcita'],
  },
  {
    id: 'monoclinico',
    name: 'Monoclínico',
    description: 'Três eixos de tamanhos diferentes, com apenas dois ângulos retos entre eles — o terceiro se inclina, como se o cristal tivesse sido "empurrado" de lado. Essa inclinação costuma aparecer em cristais tabulares com faces terminais oblíquas, e é comum ver maclas (cristais geminados) nesse sistema, como as maclas em ponta de flecha da gipsita.',
    examples: ['Gipsita', 'Ortoclásio', 'Azurita', 'Malaquita'],
  },
  {
    id: 'triclinico',
    name: 'Triclínico',
    description: 'Três eixos de tamanhos diferentes, sem nenhum ângulo reto entre eles — a simetria mais baixa dos sete sistemas, sem nenhum plano ou eixo de simetria além do centro do cristal. Os cristais costumam ter aparência mais irregular e achatada, e é nesse sistema que aparece o entremaclamento fino da labradorita, responsável pelo seu brilho iridescente característico.',
    examples: ['Turquesa', 'Cianita', 'Labradorita'],
  },
]
</script>
