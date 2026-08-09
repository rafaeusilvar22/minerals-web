<template>
  <section
    class="relative z-10 left-1/2 w-screen -translate-x-1/2 bg-cover bg-center"
    style="background-image: url('/images/ametista-background.webp');"
  >
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/30" />
      <div
        class="absolute inset-0 opacity-30"
        style="background: radial-gradient(circle at 50% 40%, var(--primary) 0%, transparent 65%);"
      />

      <svg
        class="absolute left-1/2 top-1/2 size-[820px] max-w-none -translate-x-1/2 -translate-y-1/2 text-white/15 motion-safe:animate-[spin_200s_linear_infinite]"
        viewBox="0 0 600 600"
        fill="none"
      >
        <circle cx="300" cy="300" r="300" stroke="currentColor" />
        <circle cx="300" cy="300" r="260" stroke="currentColor" />
        <polygon points="300,80 491,190 491,410 300,520 109,410 109,190" stroke="currentColor" />
        <circle cx="300" cy="300" r="4" fill="currentColor" />
        <g stroke="currentColor">
          <line x1="300" y1="0" x2="300" y2="40" />
          <line x1="450" y1="40.2" x2="438" y2="61" />
          <line x1="559.8" y1="150" x2="539" y2="162" />
          <line x1="600" y1="300" x2="560" y2="300" />
          <line x1="559.8" y1="450" x2="539" y2="438" />
          <line x1="450" y1="559.8" x2="438" y2="539" />
          <line x1="300" y1="600" x2="300" y2="560" />
          <line x1="150" y1="559.8" x2="162" y2="539" />
          <line x1="40.2" y1="450" x2="61" y2="438" />
          <line x1="0" y1="300" x2="40" y2="300" />
          <line x1="40.2" y1="150" x2="61" y2="162" />
          <line x1="150" y1="40.2" x2="162" y2="61" />
        </g>
      </svg>

      <span
        v-for="sparkle in heroSparkles"
        :key="sparkle.id"
        class="absolute size-1 rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.6)] motion-safe:animate-pulse"
        :style="{ left: sparkle.left, top: sparkle.top, animationDelay: sparkle.delay, animationDuration: sparkle.duration }"
      />
    </div>

    <div class="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center sm:py-24">
      <span
        class="text-eyebrow font-heading uppercase tracking-[0.13em] text-white/90"
      >
        Dicionário de Minerais
      </span>

      <h1 class="max-w-3xl text-hero font-heading text-white">
        Descubra a linguagem das pedras naturais
      </h1>

      <p class="max-w-xl text-lead text-white/80">
        Explore granadas, ametistas, rubis e dezenas de minerais — suas cores,
        composições e histórias, reunidos em um só lugar.
      </p>

      <Combobox
        v-model:open="isSearchOpen"
        :ignore-filter="true"
        reset-search-term-on-select
        class="relative w-full max-w-xl text-left"
      >
        <ComboboxAnchor as-child>
          <div class="relative">
            <LucideSearch
              class="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <ComboboxInput
              ref="searchInput"
              v-model="searchQuery"
              placeholder="Busque por nome, cor ou composição..."
              class="flex h-14 w-full rounded-2xl border border-border bg-card pl-11 pr-14 text-body text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            <kbd
              v-if="!searchQuery"
              class="absolute right-4 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md border border-border text-xs text-muted-foreground"
            >
              /
            </kbd>
            <ComboboxCancel
              v-else
              aria-label="Limpar busca"
              class="absolute right-4 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
            >
              <LucideX class="size-4" />
            </ComboboxCancel>
          </div>
        </ComboboxAnchor>

        <ComboboxList class="rounded-2xl border-border bg-card p-0 shadow-lg">
          <ComboboxEmpty class="px-4 py-3 text-left text-sm text-muted-foreground">
            Nenhum mineral encontrado para "{{ searchQuery.trim() }}".
          </ComboboxEmpty>

          <ComboboxItem
            v-for="result in searchResults"
            :key="result.id"
            :value="result.id"
            :text-value="result.name"
            class="flex items-center gap-3 rounded-none px-4 py-2.5"
            @select="goToMineral(result.id)"
          >
            <span
              class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted"
              :style="!result.images.length ? {
                backgroundImage: 'repeating-linear-gradient(135deg, var(--accent) 0px, var(--accent) 1px, transparent 1px, transparent 6px)',
              } : undefined"
            >
              <img v-if="result.images.length" :src="result.images[0]" :alt="result.name" class="size-full object-cover">
            </span>
            <span class="flex min-w-0 flex-1 flex-col items-start">
              <span class="truncate text-card-name text-foreground">{{ result.name }}</span>
              <span class="truncate font-mono text-xs text-muted-foreground">{{ result.formula }}</span>
            </span>
          </ComboboxItem>

          <NuxtLink
            v-if="searchResults.length"
            :to="{ path: '/catalogo', query: { q: searchQuery.trim() } }"
            class="block border-t border-border px-4 py-2.5 text-left text-sm font-medium text-gold hover:text-primary"
          >
            Ver todos os resultados para "{{ searchQuery.trim() }}" →
          </NuxtLink>
        </ComboboxList>
      </Combobox>

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
      <div class="relative rounded-2xl bg-gradient-to-br from-gold via-primary/50 to-gold p-[2px]">
        <div
          class="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-[14px] bg-muted"
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
            class="text-eyebrow font-heading uppercase tracking-[0.13em] text-muted-foreground"
          >
            Foto · {{ featuredMineral.name }}
          </span>
        </div>
      </div>

      <div class="flex flex-col items-start gap-4">
        <span
          class="text-eyebrow font-heading uppercase tracking-[0.13em] text-gold"
        >
          Mineral do dia
        </span>

        <h2 class="text-mineral-title font-heading text-foreground">{{ featuredMineral.name }}</h2>

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
        <h2 class="text-section-title font-heading text-foreground">Catálogo</h2>
        <p class="text-body text-muted-foreground">
          Navegue pela coleção de minerais e pedras naturais.
        </p>
      </div>

      <Button variant="link" as-child class="shrink-0 px-0 text-gold hover:text-primary">
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
        class="block min-w-0 transition-transform hover:-translate-y-0.5"
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
import type { Category } from "~/composables/useCategoriesStore";
import type { Mineral } from "~/composables/useMineralsStore";
import { useDebounceFn } from "@vueuse/core";
import { ComboboxInput } from "reka-ui";
import {
  Combobox,
  ComboboxAnchor,
  ComboboxCancel,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

const heroSparkles = [
  { id: 1, left: "18%", top: "22%", delay: "0s", duration: "3.4s" },
  { id: 2, left: "82%", top: "18%", delay: "0.6s", duration: "4s" },
  { id: 3, left: "72%", top: "62%", delay: "1.2s", duration: "3.8s" },
  { id: 4, left: "12%", top: "68%", delay: "0.3s", duration: "3s" },
  { id: 5, left: "50%", top: "12%", delay: "0.9s", duration: "4.2s" },
  { id: 6, left: "90%", top: "45%", delay: "1.5s", duration: "3.6s" },
];

useHead({
  title: "Magia Cristais",
  meta: [
    {
      name: "description",
      content:
        "Explore granadas, ametistas, rubis e dezenas de minerais — suas cores, composições e histórias, reunidos em um só lugar.",
    },
  ],
});

interface HomeData {
  minerals: Mineral[];
  categories: Category[];
  featuredMineralId: string | null;
}

const { data: home } = await useAsyncData("home", () => $fetch<HomeData>("/api/home"));

const allMinerals = computed(() => home.value?.minerals ?? []);
const allCategories = computed(() => home.value?.categories ?? []);

function getCategoryBySlug(slug: string) {
  return allCategories.value.find((category) => category.slug === slug);
}

const crystalSystemCount = computed(
  () => new Set(allMinerals.value.map((mineral) => mineral.crystalSystem).filter(Boolean)).size,
);

const stats = computed(() => [
  { value: `${allMinerals.value.length}`, label: "minerais" },
  { value: `${crystalSystemCount.value}`, label: "sistemas cristalinos" },
  { value: "1–10", label: "Escala Mohs", prefix: true },
]);

const featuredMineral = computed(() =>
  allMinerals.value.find((mineral) => mineral.id === home.value?.featuredMineralId),
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
    (mineral) => mineral.id !== home.value?.featuredMineralId,
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

const searchQuery = ref("");
const isSearchOpen = ref(false);

const searchResults = ref<Mineral[]>([]);
const isSearching = ref(false);
let searchRequestId = 0;

const runSearch = useDebounceFn(async (term: string) => {
  const requestId = ++searchRequestId;
  isSearching.value = true;

  try {
    const { results } = await $fetch<{ results: Mineral[] }>("/api/search", { query: { q: term } });
    if (requestId === searchRequestId) {
      searchResults.value = results;
    }
  }
  finally {
    if (requestId === searchRequestId) {
      isSearching.value = false;
    }
  }
}, 250);

watch(searchQuery, (value) => {
  const term = value.trim();
  isSearchOpen.value = term.length > 0;

  if (!term) {
    searchRequestId += 1;
    searchResults.value = [];
    isSearching.value = false;
    return;
  }

  runSearch(term);
});

function goToMineral(id: string) {
  isSearchOpen.value = false;
  searchQuery.value = "";
  navigateTo(`/minerais/${id}`);
}
</script>
