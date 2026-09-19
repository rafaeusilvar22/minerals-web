<template>
  <Combobox
    v-model:open="isSearchOpen"
    :ignore-filter="true"
    reset-search-term-on-select
    class="relative w-full text-left"
    :class="props.class"
  >
    <ComboboxAnchor as-child>
      <div class="relative">
        <LucideSearch
          class="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <ComboboxInput
          ref="searchInput"
          v-model="searchQuery"
          placeholder="Buscar..."
          class="flex h-9 w-full rounded-lg border border-border bg-card pl-9 pr-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        />
        <kbd
          v-if="enableShortcut && !searchQuery"
          class="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md border border-border text-xs text-muted-foreground"
        >
          /
        </kbd>
        <ComboboxCancel
          v-else-if="searchQuery"
          aria-label="Limpar busca"
          class="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
        >
          <LucideX class="size-4" />
        </ComboboxCancel>
      </div>
    </ComboboxAnchor>

    <ComboboxList class="rounded-lg border-border bg-card p-0 shadow-lg">
      <ComboboxEmpty class="px-4 py-3 text-left text-sm text-muted-foreground">
        Nenhum mineral encontrado para "{{ searchQuery.trim() }}".
      </ComboboxEmpty>

      <ComboboxItem
        v-for="result in searchResults"
        :key="result.id"
        :value="result.id"
        :text-value="result.name"
        class="flex items-center gap-3 rounded-none px-4 py-2.5"
        @select="goToMineral(result.slug)"
      >
        <span
          class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted"
          :style="!result.images.length ? {
            backgroundImage: 'repeating-linear-gradient(135deg, var(--accent) 0px, var(--accent) 1px, transparent 1px, transparent 6px)',
          } : undefined"
        >
          <NuxtImg
            v-if="result.images.length"
            provider="cloudinary"
            :src="cloudinaryPath(result.images[0])"
            :alt="result.name"
            width="36"
            height="36"
            fit="cover"
            class="size-full object-cover"
          />
        </span>
        <span class="flex min-w-0 flex-1 flex-col items-start">
          <span class="truncate text-card-name text-foreground">{{ result.name }}</span>
          <span class="truncate font-mono text-xs text-muted-foreground">{{ result.element }}</span>
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
</template>

<script setup lang="ts">
import type { Mineral } from '~/composables/useMineralsStore'
import type { HTMLAttributes } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { ComboboxInput } from 'reka-ui'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxCancel,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  enableShortcut?: boolean
}>(), {
  enableShortcut: false,
})

const searchInput = useTemplateRef('searchInput')

function focusSearchOnSlash(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const isTyping = target?.tagName === 'INPUT'
    || target?.tagName === 'TEXTAREA'
    || target?.isContentEditable

  if (event.key === '/' && !isTyping) {
    event.preventDefault()
    searchInput.value?.$el?.focus()
  }
}

onMounted(() => {
  if (props.enableShortcut) {
    window.addEventListener('keydown', focusSearchOnSlash)
  }
})

onUnmounted(() => {
  if (props.enableShortcut) {
    window.removeEventListener('keydown', focusSearchOnSlash)
  }
})

const searchQuery = ref('')
const isSearchOpen = ref(false)

const searchResults = ref<Mineral[]>([])
const isSearching = ref(false)
let searchRequestId = 0

const runSearch = useDebounceFn(async (term: string) => {
  const requestId = ++searchRequestId
  isSearching.value = true

  try {
    const { results } = await $fetch<{ results: Mineral[] }>('/api/search', { query: { q: term } })
    if (requestId === searchRequestId) {
      searchResults.value = results
    }
  }
  finally {
    if (requestId === searchRequestId) {
      isSearching.value = false
    }
  }
}, 250)

watch(searchQuery, (value) => {
  const term = value.trim()
  isSearchOpen.value = term.length > 0

  if (!term) {
    searchRequestId += 1
    searchResults.value = []
    isSearching.value = false
    return
  }

  runSearch(term)
})

function goToMineral(slug: string) {
  isSearchOpen.value = false
  searchQuery.value = ''
  navigateTo(`/minerais/${slug}`)
}
</script>
