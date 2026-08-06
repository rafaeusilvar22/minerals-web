<template>
  <section
    class="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-cover bg-center"
    style="background-image: url('/images/ametista-background.webp');"
  >
    <div class="absolute inset-0 bg-black/60" />

    <div class="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center sm:py-24">
      <span
        class="text-eyebrow font-mono uppercase tracking-[0.13em] text-white/90"
      >
        Dicionário de Minerais
      </span>

      <h1 class="max-w-3xl text-hero text-white">
        Descubra a linguagem das pedras naturais
      </h1>

      <p class="max-w-xl text-lead text-white/80">
        Explore granadas, ametistas, rubis e dezenas de minerais — suas cores,
        composições e histórias, reunidos em um só lugar.
      </p>

      <div class="relative w-full max-w-xl">
        <Search
          class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref="searchInput"
          type="text"
          placeholder="Busque por nome, cor ou composição..."
          class="h-14 rounded-2xl border-border bg-card pl-11 pr-14 text-body shadow-sm focus-visible:ring-2"
        />
        <kbd
          class="absolute right-4 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md border border-border text-xs text-muted-foreground"
        >
          /
        </kbd>
      </div>

      <dl
        class="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-body text-white/80"
      >
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="flex items-center gap-1.5"
        >
          <dt class="sr-only">
            {{ stat.label }}
          </dt>
          <dd v-if="stat.prefix">
            Escala Mohs
            <span class="font-semibold text-white">{{ stat.value }}</span>
          </dd>
          <dd v-else>
            <span class="font-semibold text-white">{{ stat.value }}</span>
            {{ stat.label }}
          </dd>
        </div>
      </dl>
    </div>
  </section>

  <section v-if="featuredMineral" id="mineral-do-dia" class="relative left-1/2 w-screen -translate-x-1/2 bg-accent">
    <NuxtLink
      :to="`/minerais/${featuredMineral.id}`"
      class="mx-auto grid max-w-6xl gap-10 px-4 py-12 transition-opacity hover:opacity-90 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16"
    >
      <div
        class="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted"
        :style="!featuredMineral.images.length ? {
          backgroundImage: 'repeating-linear-gradient(135deg, var(--accent) 0px, var(--accent) 1px, transparent 1px, transparent 14px)',
        } : undefined"
      >
        <img
          v-if="featuredMineral.images.length"
          :src="featuredMineral.images[0]"
          :alt="featuredMineral.name"
          class="size-full object-cover"
        >
        <span
          v-else
          class="text-eyebrow font-mono uppercase tracking-[0.13em] text-muted-foreground"
        >
          Foto · {{ featuredMineral.name }}
        </span>
      </div>

      <div class="flex flex-col items-start gap-4">
        <span
          class="text-eyebrow font-mono uppercase tracking-[0.13em] text-primary"
        >
          Mineral do dia
        </span>

        <h2 class="text-mineral-title text-foreground">{{ featuredMineral.name }}</h2>

        <p class="font-mono text-body text-primary">{{ featuredMineral.formula }}</p>

        <div class="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            class="h-auto rounded-full border-border bg-card px-3 py-1 text-xs font-normal text-foreground"
          >
            Dureza {{ formatHardness(featuredMineral) }} · Mohs
          </Badge>
          <Badge
            variant="outline"
            class="h-auto rounded-full border-border bg-card px-3 py-1 text-xs font-normal text-foreground"
          >
            Sistema {{ featuredMineral.crystalSystem }}
          </Badge>
          <Badge
            v-for="color in featuredMineral.colors"
            :key="color"
            variant="outline"
            class="h-auto rounded-full border-border bg-card px-3 py-1 text-xs font-normal text-foreground"
          >
            Cor {{ color }}
          </Badge>
        </div>

        <p class="text-body text-muted-foreground">
          {{ featuredMineral.description }}
        </p>
      </div>
    </NuxtLink>
  </section>

  <section class="flex flex-col gap-6 py-12">
    <div class="flex items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-section-title text-foreground">Catálogo</h2>
        <p class="text-body text-muted-foreground">
          Navegue pela coleção de minerais e pedras naturais.
        </p>
      </div>

      <Button variant="link" as-child class="shrink-0 px-0 text-primary">
        <NuxtLink to="/catalogo"> Ver todos → </NuxtLink>
      </Button>
    </div>

    <ToggleGroup
      v-model="selectedCategory"
      type="single"
      :spacing="2"
      class="flex-wrap justify-start"
    >
      <ToggleGroupItem
        v-for="category in categoryOptions"
        :key="category.value"
        :value="category.value"
        class="rounded-full border border-border bg-card px-4 text-sm font-medium text-muted-foreground data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        {{ category.label }}
      </ToggleGroupItem>
    </ToggleGroup>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="mineral in visibleMinerals"
        :key="mineral.id"
        :to="`/minerais/${mineral.id}`"
        class="block transition-transform hover:-translate-y-0.5"
      >
        <MineralCard
          :name="mineral.name"
          :formula="mineral.formula"
          :description="mineral.description"
          :dot-color="getCategoryBySlug(mineral.categorySlug)?.dotColor ?? 'var(--muted-foreground)'"
          :image="mineral.images[0]"
        />
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Mineral } from "~/composables/useMineralsStore";
import { Search } from "@lucide/vue";

useHead({
  title: "Dicionário de Minerais",
  meta: [
    {
      name: "description",
      content:
        "Explore granadas, ametistas, rubis e dezenas de minerais — suas cores, composições e histórias, reunidos em um só lugar.",
    },
  ],
});

const stats = [
  { value: "120+", label: "minerais" },
  { value: "8", label: "sistemas cristalinos" },
  { value: "1–10", label: "Escala Mohs", prefix: true },
];

const { minerals: allMinerals, getById: getMineralById } = useMineralsStore();
const { categories: allCategories, getBySlug: getCategoryBySlug } = useCategoriesStore();
const { active: activeFeatured } = useFeaturedMineral();

const featuredMineral = computed(() =>
  activeFeatured.value ? getMineralById(activeFeatured.value.mineralId) : undefined,
);

function formatHardness(mineral: Mineral) {
  return mineral.hardnessMin === mineral.hardnessMax
    ? `${mineral.hardnessMin}`
    : `${mineral.hardnessMin}–${mineral.hardnessMax}`;
}

const selectedCategory = ref("todos");

const categoryOptions = computed(() => [
  { value: "todos", label: "Todos" },
  ...allCategories.value.map((category) => ({ value: category.slug, label: category.name })),
]);

const filteredMinerals = computed(() => {
  const withoutFeatured = allMinerals.value.filter(
    (mineral) => mineral.id !== activeFeatured.value?.mineralId,
  );

  return selectedCategory.value === "todos"
    ? withoutFeatured
    : withoutFeatured.filter((mineral) => mineral.categorySlug === selectedCategory.value);
});

const HOME_CATALOG_LIMIT = 10;

const visibleMinerals = computed(() => filteredMinerals.value.slice(0, HOME_CATALOG_LIMIT));

const searchInput = useTemplateRef("searchInput");

function focusSearchOnSlash(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  const isTyping =
    target?.tagName === "INPUT" ||
    target?.tagName === "TEXTAREA" ||
    target?.isContentEditable;

  if (event.key === "/" && !isTyping) {
    event.preventDefault();
    searchInput.value?.$el?.focus();
  }
}

onMounted(() => {
  window.addEventListener("keydown", focusSearchOnSlash);
});

onUnmounted(() => {
  window.removeEventListener("keydown", focusSearchOnSlash);
});
</script>
