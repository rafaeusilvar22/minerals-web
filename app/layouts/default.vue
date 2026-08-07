<template>
  <div class="flex min-h-screen flex-col">
    <div class="pointer-events-none fixed inset-0 -z-10 text-foreground/[0.05]" aria-hidden="true">
      <svg class="size-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="mineral-bg-pattern" width="200" height="200" patternUnits="userSpaceOnUse">
            <polygon points="46,10 64,22 64,46 46,58 28,46 28,22" fill="none" stroke="currentColor" stroke-width="1" />
            <polygon points="150,70 172,108 128,108" fill="none" stroke="currentColor" stroke-width="1" />
            <polygon points="20,140 34,150 34,168 20,178 6,168 6,150" fill="none" stroke="currentColor" stroke-width="1" />
            <circle cx="160" cy="25" r="1.5" fill="currentColor" />
            <circle cx="100" cy="150" r="1.5" fill="currentColor" />
            <circle cx="185" cy="150" r="1" fill="currentColor" />
            <circle cx="75" cy="95" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mineral-bg-pattern)" />
      </svg>
    </div>

    <header
      class="sticky top-0 z-40 border-b transition-colors"
      :class="isScrolled ? 'bg-background/70 backdrop-blur-md' : 'bg-background'"
    >
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <NuxtLink to="/" class="flex items-center">
          <img src="/images/logo-magia-cristais.png" alt="Magia Cristais" class="size-8">
        </NuxtLink>

        <NavigationMenu class="hidden md:flex">
          <NavigationMenuList class="gap-2">
            <NavigationMenuItem v-for="item in navItems" :key="item.to">
              <NavigationMenuLink as-child :active="route.path === item.to">
                <NuxtLink :to="item.to">
                  {{ item.label }}
                </NuxtLink>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div class="flex items-center gap-1">
          <Button variant="outline" size="sm" as-child class="hidden md:inline-flex">
            <NuxtLink to="/login">
              Entrar
            </NuxtLink>
          </Button>

          <ThemeToggle />

          <Drawer swipe-direction="right">
            <DrawerTrigger as-child>
              <Button variant="ghost" size="icon" class="md:hidden" aria-label="Abrir menu">
                <Menu class="size-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerClose as-child>
                <Button variant="ghost" size="icon" class="absolute top-3 right-3" aria-label="Fechar menu">
                  <X class="size-4" />
                </Button>
              </DrawerClose>

              <DrawerHeader>
                <DrawerTitle>Menu</DrawerTitle>
              </DrawerHeader>
              <nav class="flex flex-col gap-1 px-4 pb-6">
                <DrawerClose v-for="item in navItems" :key="item.to" as-child>
                  <NuxtLink
                    :to="item.to"
                    class="rounded-lg px-3 py-2 text-sm font-medium"
                    :class="route.path === item.to
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
                  >
                    {{ item.label }}
                  </NuxtLink>
                </DrawerClose>

                <Separator class="my-2" />

                <DrawerClose as-child>
                  <NuxtLink
                    to="/login"
                    class="rounded-lg px-3 py-2 text-sm font-medium"
                    :class="route.path === '/login'
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'"
                  >
                    Entrar
                  </NuxtLink>
                </DrawerClose>
              </nav>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 pb-8">
      <slot />
    </main>

    <footer class="border-t">
      <div class="mx-auto max-w-6xl px-4 py-12">
        <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 font-semibold text-foreground">
              <img src="/images/logo-magia-cristais.png" alt="Magia Cristais" class="size-6">
              <span>Magia Cristais</span>
            </div>
            <p class="text-body text-muted-foreground">
              Dicionário de minerais e pedras naturais.
            </p>
          </div>

          <div v-for="group in footerLinks" :key="group.title" class="flex flex-col gap-3">
            <span class="text-sm font-semibold text-foreground">
              {{ group.title }}
            </span>
            <nav class="flex flex-col gap-2">
              <NuxtLink
                v-for="link in group.links"
                :key="link.to"
                :to="link.to"
                class="text-sm text-muted-foreground hover:text-foreground"
              >
                {{ link.label }}
              </NuxtLink>
            </nav>
          </div>
        </div>

        <Separator class="my-8" />

        <p class="text-sm text-muted-foreground">
          © {{ currentYear }} Magia Cristais. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Menu, X } from '@lucide/vue'

const route = useRoute()

const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 8
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const navItems = [
  { label: 'Início', to: '/' },
  { label: 'Catálogo', to: '/catalogo' },
  // { label: 'Categorias', to: '/categorias' },
  // { label: 'Glossário', to: '/glossario' },
  { label: 'Sobre', to: '/sobre' },
]

const footerLinks = [
  {
    title: 'Explorar',
    links: [
      { label: 'Catálogo', to: '/catalogo' },
      { label: 'Categorias', to: '/categorias' },
      { label: 'Mineral do dia', to: '/#mineral-do-dia' },
    ],
  },
  {
    title: 'Aprender',
    links: [
      { label: 'Glossário', to: '/glossario' },
      { label: 'Guia de dureza', to: '/guia-de-dureza' },
      { label: 'Sistemas cristalinos', to: '/sistemas-cristalinos' },
    ],
  },
  {
    title: 'Sobre',
    links: [
      { label: 'O projeto', to: '/sobre' },
      // Oculto por enquanto — reativar quando a página de contato estiver pronta.
      // { label: 'Contato', to: '/contato' },
    ],
  },
]

const currentYear = new Date().getFullYear()
</script>
