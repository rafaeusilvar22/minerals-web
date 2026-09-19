<template>
  <div>
  <section class="grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
    <div class="flex flex-col items-start gap-6">
      <span class="text-eyebrow uppercase tracking-[0.13em] text-primary">
        Dicionário de Minerais
      </span>

      <h1 class="text-hero font-heading text-foreground">
        Descubra a linguagem das pedras naturais
      </h1>

      <p class="max-w-lg text-lead text-muted-foreground">
        Explore granadas, ametistas, rubis e dezenas de minerais — suas cores,
        composições e histórias, reunidos em um só lugar.
      </p>

      <Button as-child size="lg" class="h-11 px-6 uppercase tracking-[0.08em] text-xs font-semibold">
        <NuxtLink to="/catalogo">Explorar catálogo</NuxtLink>
      </Button>

      <dl class="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-body text-muted-foreground">
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
            <span class="font-semibold text-foreground">{{ stat.value }}</span>
          </dd>
          <dd v-else>
            <span class="font-semibold text-foreground">{{ stat.value }}</span>
            {{ stat.label }}
          </dd>
        </div>
      </dl>
    </div>

    <div
      class="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted"
      :style="!heroMineral?.images.length ? {
        backgroundImage: 'repeating-linear-gradient(135deg, var(--accent) 0px, var(--accent) 1px, transparent 1px, transparent 14px)',
      } : undefined"
    >
      <NuxtImg
        v-if="heroMineral?.images.length"
        provider="cloudinary"
        :src="cloudinaryPath(heroMineral.images[0])"
        :alt="heroMineral.name"
        width="640"
        height="480"
        fit="cover"
        class="size-full object-cover"
      />
      <span v-else class="text-eyebrow uppercase tracking-[0.13em] text-muted-foreground">
        Foto · {{ heroMineral?.name }}
      </span>
    </div>
  </section>

  <section v-if="phraseOfDay" class="py-12">
    <div class="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 text-center">
      <span class="text-eyebrow uppercase tracking-[0.13em] text-gold">
        Frase do dia
      </span>
      <p class="text-section-title font-heading text-foreground">
        "{{ phraseOfDay.text }}"
      </p>
      <span v-if="phraseOfDay.author" class="text-body text-muted-foreground">
        — {{ phraseOfDay.author }}
      </span>
    </div>
  </section>

  <section v-if="categoriesWithCount.length" class="flex flex-col gap-6 py-12">
    <div class="flex flex-col gap-1">
      <span class="text-eyebrow uppercase tracking-[0.13em] text-primary">Referência</span>
      <h2 class="text-section-title font-heading text-foreground">Explorar por categoria</h2>
    </div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <NuxtLink
        v-for="category in categoriesWithCount.slice(0, 4)"
        :key="category.id"
        :to="`/catalogo?categoria=${category.slug}`"
        class="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-transform hover:-translate-y-0.5"
      >
        <span class="flex size-10 items-center justify-center rounded-full" :style="{ backgroundColor: `color-mix(in oklch, ${category.dotColor} 20%, transparent)` }">
          <span class="size-3 rounded-full" :style="{ backgroundColor: category.dotColor }" />
        </span>
        <span class="text-card-name font-heading text-foreground">{{ category.name }}</span>
        <span class="text-card-description text-muted-foreground">
          {{ category.count }} {{ category.count === 1 ? 'mineral' : 'minerais' }}
        </span>
      </NuxtLink>
    </div>
  </section>

  <section v-if="featuredMineral" id="mineral-do-dia" class="relative left-1/2 w-screen -translate-x-1/2 bg-accent">
    <NuxtLink
      :to="`/minerais/${featuredMineral.slug}`"
      class="mx-auto grid max-w-6xl gap-10 px-4 py-12 transition-opacity hover:opacity-90 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16"
    >
      <div
        class="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted"
        :style="!featuredMineral.images.length ? {
          backgroundImage: 'repeating-linear-gradient(135deg, var(--accent) 0px, var(--accent) 1px, transparent 1px, transparent 14px)',
        } : undefined"
      >
        <NuxtImg
          v-if="featuredMineral.images.length"
          provider="cloudinary"
          :src="cloudinaryPath(featuredMineral.images[0])"
          :alt="featuredMineral.name"
          width="640"
          height="480"
          fit="cover"
          class="size-full object-cover"
        />
        <span
          v-else
          class="text-eyebrow uppercase tracking-[0.13em] text-muted-foreground"
        >
          Foto · {{ featuredMineral.name }}
        </span>
      </div>

      <div class="flex flex-col items-start gap-4">
        <span
          class="text-eyebrow uppercase tracking-[0.13em] text-gold"
        >
          Mineral do dia
        </span>

        <div class="flex flex-col gap-1">
          <h2 class="text-mineral-title font-heading text-foreground">{{ featuredMineral.name }}</h2>
          <span v-if="getCategoryBySlug(featuredMineral.categorySlug)" class="text-eyebrow uppercase tracking-[0.13em] text-primary">
            {{ getCategoryBySlug(featuredMineral.categorySlug)?.name }}
          </span>
        </div>

        <div class="flex flex-wrap divide-x divide-border">
          <div v-if="featuredMineral.waterproof !== undefined" class="flex flex-col gap-1 px-4 first:pl-0">
            <span class="text-eyebrow uppercase tracking-[0.13em] text-primary">
              À prova d'água
            </span>
            <p class="text-body text-muted-foreground">
              {{ featuredMineral.waterproof ? "Sim" : "Não" }}
            </p>
          </div>
          <div v-if="featuredMineral.chakras?.length" class="flex flex-col gap-1 px-4 first:pl-0">
            <span class="text-eyebrow uppercase tracking-[0.13em] text-primary">
              Chakra
            </span>
            <p class="text-body text-muted-foreground">
              {{ featuredMineral.chakras.join(', ') }}
            </p>
          </div>
          <div v-if="featuredMineral.colors?.length" class="flex flex-col gap-1 px-4 first:pl-0">
            <span class="text-eyebrow uppercase tracking-[0.13em] text-primary">
              Cor
            </span>
            <p class="text-body text-muted-foreground">
              {{ featuredMineral.colors.join(', ') }}
            </p>
          </div>
          <div v-if="featuredMineral.hardnessMin != null && featuredMineral.hardnessMax != null" class="flex flex-col gap-1 px-4 first:pl-0">
            <span class="text-eyebrow uppercase tracking-[0.13em] text-primary">
              Dureza
            </span>
            <p class="text-body text-muted-foreground">
              {{ formatHardness(featuredMineral) }} · Mohs
            </p>
          </div>
          <div v-if="featuredMineral.element" class="flex flex-col gap-1 px-4 first:pl-0">
            <span class="text-eyebrow uppercase tracking-[0.13em] text-primary">
              Elemento
            </span>
            <p class="text-body text-muted-foreground">
              {{ featuredMineral.element }}
            </p>
          </div>
          <div v-if="featuredMineral.planet" class="flex flex-col gap-1 px-4 first:pl-0">
            <span class="text-eyebrow uppercase tracking-[0.13em] text-primary">
              Planeta
            </span>
            <p class="text-body text-muted-foreground">
              {{ featuredMineral.planet }}
            </p>
          </div>
          <div v-if="featuredMineral.zodiacSigns?.length" class="flex flex-col gap-1 px-4 first:pl-0">
            <span class="text-eyebrow uppercase tracking-[0.13em] text-primary">
              Signo
            </span>
            <p class="text-body text-muted-foreground">
              {{ (featuredMineral.zodiacSigns ?? []).join(', ') }}
            </p>
          </div>
        </div>

        <p class="text-body text-muted-foreground">
          {{ featuredMineral.description }}
        </p>
      </div>
    </NuxtLink>
  </section>

  <section v-if="isMounted && !user" class="py-12">
    <Card class="overflow-hidden border-gold/30 bg-gradient-to-br from-accent/60 to-transparent">
      <div class="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
        <div class="flex flex-col gap-4">
          <span class="text-eyebrow uppercase tracking-[0.13em] text-gold">
            Crie sua conta
          </span>
          <div class="flex flex-col gap-2">
            <h2 class="text-section-title font-heading text-foreground">
              Organize sua coleção de minerais
            </h2>
            <p class="text-body text-muted-foreground">
              Crie uma conta gratuita e leve o Magia Cristais com você.
            </p>
          </div>

          <ul class="flex flex-col gap-3 pt-2">
            <li class="flex items-center gap-3 text-body text-muted-foreground">
              <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                <LucideHeart class="size-4" />
              </span>
              Marque minerais como "já tenho" ou "quero ter" e monte sua coleção
            </li>
            <li class="flex items-center gap-3 text-body text-muted-foreground">
              <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                <LucideGem class="size-4" />
              </span>
              Acompanhe tudo em sua lista pessoal, organizada por categoria
            </li>
            <li class="flex items-center gap-3 text-body text-muted-foreground">
              <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                <LucideScanEye class="size-4" />
              </span>
              Identifique uma pedra física com nossa IA, direto de uma foto
            </li>
          </ul>
        </div>

        <div class="flex flex-col items-start gap-3 lg:items-end">
          <Button as-child size="lg" class="w-full lg:w-auto">
            <NuxtLink to="/cadastro">Criar conta grátis</NuxtLink>
          </Button>
          <Button as-child variant="link" class="px-0 text-muted-foreground hover:text-gold">
            <NuxtLink to="/login">Já tem conta? Entrar</NuxtLink>
          </Button>
        </div>
      </div>
    </Card>
  </section>

  <section class="flex flex-col gap-6 py-12">
    <div class="flex items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <span class="text-eyebrow uppercase tracking-[0.13em] text-primary">Coleções</span>
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
        :to="`/minerais/${mineral.slug}`"
        class="block min-w-0 transition-transform hover:-translate-y-0.5"
      >
        <MineralCard
          :id="mineral.id"
          :name="mineral.name"
          :description="mineral.description"
          :dot-color="getCategoryBySlug(mineral.categorySlug)?.dotColor ?? 'var(--muted-foreground)'"
          :image="mineral.images[0]"
          :category-name="getCategoryBySlug(mineral.categorySlug)?.name"
          :chakras="mineral.chakras"
        />
      </NuxtLink>
    </div>
  </section>

  <section class="relative left-1/2 w-screen -translate-x-1/2 bg-accent">
    <div class="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
      <span class="text-eyebrow uppercase tracking-[0.13em] text-primary">Comece agora</span>
      <h2 class="text-section-title font-heading text-foreground">
        Monte sua coleção de minerais
      </h2>
      <p class="max-w-xl text-body text-muted-foreground">
        Explore o catálogo completo de minerais e pedras naturais do Magia Cristais.
      </p>
      <Button as-child size="lg" class="h-11 px-6 uppercase tracking-[0.08em] text-xs font-semibold">
        <NuxtLink to="/catalogo">Ver catálogo completo</NuxtLink>
      </Button>
    </div>
  </section>
  </div>
</template>

<script setup lang="ts">
import type { Category } from "~/composables/useCategoriesStore";
import type { Mineral } from "~/composables/useMineralsStore";

useSeo({
  title: "Magia Cristais",
  description:
    "Explore granadas, ametistas, rubis e dezenas de minerais — suas cores, composições e histórias, reunidos em um só lugar.",
});

interface HomeData {
  minerals: Mineral[];
  categories: Category[];
  featuredMineralId: string | null;
}

interface Phrase {
  id: string;
  text: string;
  author?: string;
}

const { data: home } = await useAsyncData("home", () => $fetch<HomeData>("/api/home"));
const { data: phraseData } = await useAsyncData("phraseOfDay", () =>
  $fetch<{ phrase: Phrase | null }>("/api/phrase-of-day"),
);
const phraseOfDay = computed(() => phraseData.value?.phrase ?? null);

const allMinerals = computed(() => home.value?.minerals ?? []);
const allCategories = computed(() => home.value?.categories ?? []);

function getCategoryBySlug(slug: string) {
  return allCategories.value.find((category) => category.slug === slug);
}

const zodiacSignCount = computed(
  () => new Set(allMinerals.value.flatMap((mineral) => mineral.zodiacSigns ?? [])).size,
);

const stats = computed(() => [
  { value: `${allMinerals.value.length}`, label: "minerais" },
  { value: `${zodiacSignCount.value}`, label: "signos do zodíaco" },
  { value: "1–10", label: "Escala Mohs", prefix: true },
]);

const featuredMineral = computed(() =>
  allMinerals.value.find((mineral) => mineral.id === home.value?.featuredMineralId),
);

const heroMineral = computed(() => featuredMineral.value ?? allMinerals.value[0]);

const categoriesWithCount = computed(() =>
  allCategories.value
    .map((category) => ({
      ...category,
      count: allMinerals.value.filter((mineral) => mineral.categorySlug === category.slug).length,
    }))
    .filter((category) => category.count > 0),
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

const user = useCurrentUser();
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});
</script>
