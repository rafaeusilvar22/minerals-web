<template>
  <div class="flex min-h-screen flex-col bg-background">
    <header class="border-b">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <NuxtLink to="/" class="flex items-center">
          <img src="/images/logo-magia-cristais.png" alt="Magia Cristais" class="size-8">
        </NuxtLink>

        <div class="flex items-center gap-1">
          <Button variant="ghost" size="sm" as-child>
            <NuxtLink to="/">
              <LucideArrowLeft class="size-4" />
              Voltar
            </NuxtLink>
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>

    <main class="flex flex-1 items-center justify-center px-4">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>
