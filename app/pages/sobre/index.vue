<template>
  <div class="flex flex-col gap-6 py-8">
    <h1 class="text-section-title font-heading text-foreground">
      Sobre
    </h1>

    <div v-if="about?.html" class="rich-text-content max-w-3xl" v-html="about.html" />
    <p v-else class="text-body text-muted-foreground">
      Em construção.
    </p>
  </div>
</template>

<script setup lang="ts">
useSeo({
  title: "Sobre · Magia Cristais",
  description: "Conheça a Magia Cristais e a proposta por trás do catálogo de minerais e pedras naturais.",
});

const { data: about } = await useAsyncData("about", () => $fetch<{ html: string }>("/api/about"));
</script>
