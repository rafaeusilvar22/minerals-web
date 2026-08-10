<template>
  <div class="flex flex-col gap-6 py-8">
    <div class="flex flex-col gap-1">
      <h1 class="text-section-title font-heading text-foreground">
        Catálogo
      </h1>
      <p class="text-body text-muted-foreground">
        Navegue pela coleção completa de minerais e pedras naturais.
      </p>
    </div>

    <div v-if="searchQuery" class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <span>Resultados para <span class="font-medium text-foreground">"{{ searchQuery }}"</span></span>
      <NuxtLink to="/catalogo" class="text-gold hover:text-primary">
        Limpar busca
      </NuxtLink>
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

    <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton v-for="n in 6" :key="n" class="aspect-4/3 rounded-2xl" />
    </div>

    <template v-else>
      <p v-if="!pagedMinerals.length" class="py-12 text-center text-body text-muted-foreground">
        {{ searchQuery ? `Nenhum mineral encontrado para "${searchQuery}".` : 'Nenhum mineral encontrado nessa categoria.' }}
      </p>

      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="mineral in pagedMinerals"
          :key="mineral.id"
          :to="`/minerais/${mineral.id}`"
          class="block min-w-0 transition-transform hover:-translate-y-0.5"
        >
          <MineralCard
            :name="mineral.name"
            :description="mineral.description"
            :dot-color="getCategoryBySlug(mineral.categorySlug)?.dotColor ?? 'var(--muted-foreground)'"
            :image="mineral.images[0]"
          />
        </NuxtLink>
      </div>

      <Pagination
        v-if="totalPages > 1"
        v-slot="{ page }"
        v-model:page="currentPage"
        :items-per-page="PAGE_SIZE"
        :total="filteredMinerals.length"
        :sibling-count="1"
        show-edges
        class="pt-4"
      >
        <PaginationContent v-slot="{ items }">
          <PaginationPrevious />
          <template v-for="(item, index) in items">
            <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" :is-active="item.value === page">
              {{ item.value }}
            </PaginationItem>
            <PaginationEllipsis v-else :key="item.type" :index="index" />
          </template>
          <PaginationNext />
        </PaginationContent>
      </Pagination>
    </template>
  </div>
</template>

<script setup lang="ts">
import { normalizeSearchText } from "~/lib/utils";

useHead({
  title: "Catálogo · Magia Cristais",
  meta: [
    {
      name: "description",
      content: "Navegue pela coleção completa de minerais e pedras naturais.",
    },
  ],
});

const { minerals: allMinerals, loading } = useMineralsStore();
const { categories: allCategories, getBySlug: getCategoryBySlug } = useCategoriesStore();

const route = useRoute();
const searchQuery = computed(() => (typeof route.query.q === "string" ? route.query.q.trim() : ""));

const selectedCategory = ref("todos");

const categoryOptions = computed(() => [
  { value: "todos", label: "Todos" },
  ...allCategories.value.map((category) => ({ value: category.slug, label: category.name })),
]);

const filteredMinerals = computed(() => {
  const byCategory = selectedCategory.value === "todos"
    ? allMinerals.value
    : allMinerals.value.filter((mineral) => mineral.categorySlug === selectedCategory.value);

  const query = normalizeSearchText(searchQuery.value);
  if (!query) {
    return byCategory;
  }

  return byCategory.filter((mineral) =>
    normalizeSearchText([mineral.name, ...(mineral.colors ?? []), mineral.element, mineral.planet, ...(mineral.zodiacSigns ?? []), ...(mineral.chakras ?? [])].join(" ")).includes(query),
  );
});

const PAGE_SIZE = 10;
const currentPage = ref(1);

watch(selectedCategory, () => {
  currentPage.value = 1;
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredMinerals.value.length / PAGE_SIZE)));

const pagedMinerals = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredMinerals.value.slice(start, start + PAGE_SIZE);
});
</script>
