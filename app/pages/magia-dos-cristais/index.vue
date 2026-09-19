<template>
  <div class="flex flex-col gap-10 py-8">
    <div class="flex flex-col gap-2">
      <span class="text-eyebrow font-heading uppercase tracking-[0.13em] text-primary">
        Espiritualidade
      </span>
      <h1 class="text-section-title font-heading text-foreground">
        A magia dos cristais
      </h1>
      <p class="max-w-2xl text-body text-muted-foreground">
        Muito além da beleza, cada cristal carrega, na tradição da cristaloterapia, uma energia
        própria — capaz de influenciar o astral, os ambientes e as intenções do dia a dia. Aqui vamos
        explicar como essa prática funciona e como aproveitá-la, sem prometer o que a ciência ainda
        não confirma: pense nisso como uma ferramenta de autoconhecimento e bem-estar, não como
        substituto de acompanhamento médico.
      </p>
    </div>

    <section class="flex flex-col gap-3">
      <h2 class="text-mineral-title font-heading text-foreground">
        O que é a magia dos cristais
      </h2>
      <p class="max-w-2xl text-body text-muted-foreground">
        A cristaloterapia é uma prática milenar que acredita que cada mineral vibra numa frequência
        própria, capaz de interagir com a energia do corpo e do ambiente ao redor. Essa crença
        atravessa culturas — dos egípcios antigos, que usavam pedras em amuletos e cosméticos, até
        tradições orientais que relacionam cristais aos chakras e aos elementos da natureza. No nosso
        catálogo, cada mineral traz essas informações: o elemento associado, o planeta regente, os
        signos do zodíaco e os chakras que ele trabalha — a mesma linguagem simbólica que orienta este
        guia.
      </p>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-mineral-title font-heading text-foreground">
        Cristais no dia a dia
      </h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="item in dailyUses"
          :key="item.title"
          class="flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-5"
        >
          <h3 class="text-card-name font-heading text-foreground">
            {{ item.title }}
          </h3>
          <p class="text-sm text-muted-foreground">
            {{ item.description }}
          </p>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-mineral-title font-heading text-foreground">
          Cristais em cada ambiente da casa
        </h2>
        <p class="max-w-2xl text-body text-muted-foreground">
          Assim como no corpo, os cristais também são usados pra equilibrar a energia dos espaços —
          uma prática próxima do Feng Shui. Alguns pontos de partida:
        </p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="room in roomGuides"
          :key="room.title"
          class="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5"
        >
          <h3 class="text-card-name font-heading text-foreground">
            {{ room.title }}
          </h3>
          <p class="text-sm text-muted-foreground">
            {{ room.description }}
          </p>
          <div class="flex flex-wrap gap-1.5 pt-1">
            <NuxtLink
              v-for="mineral in room.minerals"
              :key="mineral.slug"
              :to="`/minerais/${mineral.slug}`"
            >
              <Badge
                variant="outline"
                class="h-auto cursor-pointer rounded-full border-border bg-accent px-2.5 py-0.5 text-xs font-normal text-primary hover:border-primary"
              >
                {{ mineral.name }}
              </Badge>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-mineral-title font-heading text-foreground">
          Qual cristal escolher pra cada intenção
        </h2>
        <p class="max-w-2xl text-body text-muted-foreground">
          Cada pedra do nosso catálogo carrega um propósito mais forte. Clique pra ver a página
          completa do mineral, com todas as suas propriedades físicas e místicas.
        </p>
      </div>
      <div class="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
        <NuxtLink
          v-for="intention in intentions"
          :key="intention.mineral.slug"
          :to="`/minerais/${intention.mineral.slug}`"
          class="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-accent"
        >
          <span class="flex flex-col gap-0.5">
            <span class="text-sm font-medium text-foreground">{{ intention.label }}</span>
            <span class="text-xs text-muted-foreground">{{ intention.mineral.name }}</span>
          </span>
          <LucideArrowRight class="size-4 shrink-0 text-muted-foreground" />
        </NuxtLink>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-mineral-title font-heading text-foreground">
        Elemento, planeta e chakra: o que isso significa
      </h2>
      <p class="max-w-2xl text-body text-muted-foreground">
        Na tradição da cristaloterapia, cada mineral é associado a um elemento (terra, água, fogo ou
        ar), a um planeta regente, a signos do zodíaco com quem tem afinidade e a um ou mais chakras
        — os centros de energia do corpo. É por isso que essas informações aparecem em toda página de
        mineral do nosso catálogo.
      </p>
      <Button variant="link" as-child class="w-fit px-0 text-gold hover:text-primary">
        <NuxtLink to="/glossario">
          Veja o significado de cada termo no glossário →
        </NuxtLink>
      </Button>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-mineral-title font-heading text-foreground">
        Como limpar e recarregar seus cristais
      </h2>
      <p class="max-w-2xl text-body text-muted-foreground">
        Assim como absorvem energia, os cristais também acumulam — por isso a tradição recomenda
        limpá-los e recarregá-los periodicamente. Alguns métodos comuns:
      </p>
      <ul class="flex max-w-2xl flex-col gap-2 text-body text-muted-foreground">
        <li>
          <strong class="text-foreground">Luz da lua cheia:</strong> deixar o cristal exposto durante
          a noite é a forma mais tradicional de recarga.
        </li>
        <li>
          <strong class="text-foreground">Defumação:</strong> passar a fumaça de ervas como alecrim ou
          sálvia branca ao redor da pedra.
        </li>
        <li>
          <strong class="text-foreground">Som:</strong> o som de sinos ou taças tibetanas é usado pra
          "quebrar" energias acumuladas.
        </li>
        <li>
          <strong class="text-foreground">Água corrente:</strong> funciona pra pedras mais duras, mas
          vale checar antes — variedades porosas ou solúveis podem se danificar com água.
        </li>
      </ul>
    </section>

    <section class="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
      <h2 class="text-mineral-title font-heading text-foreground">
        Encontre o cristal certo pra você
      </h2>
      <p class="max-w-2xl text-body text-muted-foreground">
        Explore o catálogo completo e veja o elemento, planeta e chakra de cada mineral, ou use
        nosso identificador por IA pra descobrir qual pedra você tem em mãos a partir de uma foto.
      </p>
      <div class="flex flex-wrap gap-3 pt-1">
        <Button as-child>
          <NuxtLink to="/catalogo">
            Ver catálogo completo
          </NuxtLink>
        </Button>
        <Button variant="outline" as-child>
          <NuxtLink to="/identificar">
            Identificar um mineral
          </NuxtLink>
        </Button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeo({
  title: 'A magia dos cristais · Magia Cristais',
  description: 'Como a cristaloterapia funciona no dia a dia e nos ambientes da casa, e qual cristal escolher pra cada intenção.',
})

interface MineralRef {
  slug: string
  name: string
}

const AMAZONITA: MineralRef = { slug: 'amazonita', name: 'Amazonita' }
const AMETISTA: MineralRef = { slug: 'ametista', name: 'Ametista' }
const ESMERALDA: MineralRef = { slug: 'esmeralda', name: 'Esmeralda' }
const HEMATITA: MineralRef = { slug: 'hematita', name: 'Hematita' }
const JASPE: MineralRef = { slug: 'jaspe', name: 'Jaspe' }
const OLHO_DE_TIGRE: MineralRef = { slug: 'olho-de-tigre', name: 'Olho de Tigre' }
const QUARTZO_BRANCO: MineralRef = { slug: 'quartzo-branco', name: 'Quartzo Branco' }
const QUARTZO_ROSA: MineralRef = { slug: 'quartzo-rosa', name: 'Quartzo Rosa' }
const QUARTZO_VERDE: MineralRef = { slug: 'quartzo-verde', name: 'Quartzo Verde' }
const SODALITA: MineralRef = { slug: 'sodalita', name: 'Sodalita' }

const dailyUses = [
  {
    title: 'Como joia ou no bolso',
    description: 'Manter o cristal em contato com o corpo é a forma mais simples de levar sua energia com você ao longo do dia.',
  },
  {
    title: 'Na meditação',
    description: 'Segurar a pedra ou posicioná-la sobre um chakra específico ajuda a direcionar a intenção da prática.',
  },
  {
    title: 'Ao lado da cama',
    description: 'Pedras calmantes, como a ametista, são tradicionalmente usadas pra favorecer um sono mais tranquilo.',
  },
  {
    title: 'Em rituais de intenção',
    description: 'Segurar o cristal e "programá-lo" mentalmente com um objetivo é uma prática comum antes de usá-lo ou guardá-lo.',
  },
]

const roomGuides = [
  {
    title: 'Sala de estar',
    description: 'Espaço de convivência: pedras associadas à comunicação e à harmonia ajudam o ambiente a fluir melhor entre as pessoas.',
    minerals: [AMAZONITA],
  },
  {
    title: 'Quarto',
    description: 'Ambiente de descanso e afeto: pedras calmantes favorecem o sono, e as ligadas ao amor fortalecem os relacionamentos.',
    minerals: [AMETISTA, QUARTZO_ROSA],
  },
  {
    title: 'Escritório ou home office',
    description: 'Pra manter o foco e atrair prosperidade no trabalho, essas pedras costumam ficar perto da mesa.',
    minerals: [OLHO_DE_TIGRE, QUARTZO_VERDE],
  },
  {
    title: 'Entrada da casa',
    description: 'Primeiro ponto de contato com o ambiente externo — um bom lugar pra pedras de proteção e estabilidade.',
    minerals: [HEMATITA, JASPE],
  },
]

const intentions: { label: string, mineral: MineralRef }[] = [
  { label: 'Proteção contra energias negativas', mineral: HEMATITA },
  { label: 'Amor e relacionamentos', mineral: QUARTZO_ROSA },
  { label: 'Prosperidade e abundância', mineral: ESMERALDA },
  { label: 'Clareza mental e conexão espiritual', mineral: AMETISTA },
  { label: 'Comunicação e expressão', mineral: SODALITA },
  { label: 'Calma e estabilidade emocional', mineral: JASPE },
  { label: 'Coragem e autoconfiança', mineral: OLHO_DE_TIGRE },
  { label: 'Purificação de energias', mineral: QUARTZO_BRANCO },
  { label: 'Cura emocional e autoestima', mineral: QUARTZO_VERDE },
  { label: 'Serenidade e equilíbrio', mineral: AMAZONITA },
]
</script>
