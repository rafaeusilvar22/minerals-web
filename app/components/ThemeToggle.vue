<template>
  <Button variant="ghost" size="icon" aria-label="Alternar tema" @click="toggleTheme">
    <ClientOnly>
      <LucideSun v-if="colorMode.value === 'dark'" class="size-5" />
      <LucideMoon v-else class="size-5" />
      <template #fallback>
        <div class="size-5" />
      </template>
    </ClientOnly>
  </Button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
