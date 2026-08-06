<template>
  <Button variant="ghost" size="icon" aria-label="Alternar tema" @click="toggleTheme">
    <ClientOnly>
      <Sun v-if="colorMode.value === 'dark'" class="size-5" />
      <Moon v-else class="size-5" />
      <template #fallback>
        <div class="size-5" />
      </template>
    </ClientOnly>
  </Button>
</template>

<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

const colorMode = useColorMode()

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
