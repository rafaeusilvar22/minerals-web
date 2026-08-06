<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-section-title text-foreground">
          Categorias
        </h1>
        <p class="text-body text-muted-foreground">
          Defina as categorias usadas para classificar os minerais do catálogo.
        </p>
      </div>

      <Button @click="openCreateDialog">
        <Plus class="size-4" />
        Nova categoria
      </Button>
    </div>

    <div class="overflow-hidden rounded-2xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Cor</TableHead>
            <TableHead class="text-right">
              Minerais
            </TableHead>
            <TableHead class="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow v-for="n in 4" :key="n">
              <TableCell>
                <Skeleton class="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton class="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton class="size-2.5 rounded-full" />
              </TableCell>
              <TableCell class="flex justify-end">
                <Skeleton class="h-4 w-6" />
              </TableCell>
              <TableCell>
                <Skeleton class="size-8 rounded-md" />
              </TableCell>
            </TableRow>
          </template>

          <template v-else v-for="category in categories" :key="category.id">
            <TableRow>
              <TableCell class="font-medium text-foreground">
                {{ category.name }}
              </TableCell>
              <TableCell class="font-mono text-muted-foreground">
                {{ category.slug }}
              </TableCell>
              <TableCell>
                <span
                  class="inline-block size-2.5 rounded-full"
                  :style="{ backgroundColor: category.dotColor }"
                />
              </TableCell>
              <TableCell class="text-right text-muted-foreground">
                {{ mineralCountFor(category.slug) }}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon-sm" aria-label="Ações da categoria">
                      <MoreHorizontal class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="openEditDialog(category)">
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" @click="removeCategory(category.id)">
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ editingCategory ? 'Editar categoria' : 'Nova categoria' }}
          </DialogTitle>
          <DialogDescription>
            Defina o título, o slug e a cor de destaque da categoria.
          </DialogDescription>
        </DialogHeader>

        <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
          <div class="flex flex-col gap-2">
            <Label for="category-name">Título</Label>
            <Input
              id="category-name"
              v-model="form.name"
              placeholder="Ex: Quartzos"
              required
            />
          </div>

          <div class="flex flex-col gap-2">
            <Label for="category-slug">Slug</Label>
            <Input
              id="category-slug"
              v-model="form.slug"
              placeholder="ex-quartzos"
              class="font-mono"
              required
              @input="slugManuallyEdited = true"
            />
          </div>

          <div class="flex flex-col gap-2">
            <Label>Cor</Label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in colorOptions"
                :key="option.value"
                type="button"
                class="flex size-8 cursor-pointer items-center justify-center rounded-full border-2 transition-colors"
                :class="form.color === option.value ? 'border-foreground' : 'border-transparent'"
                :style="{ backgroundColor: option.value }"
                :aria-label="option.label"
                :aria-pressed="form.color === option.value"
                @click="form.color = option.value"
              >
                <Check v-if="form.color === option.value" class="size-4 text-white" />
              </button>
            </div>
          </div>

          <p v-if="formError" class="text-sm text-destructive">
            {{ formError }}
          </p>

          <DialogFooter class="mt-2">
            <DialogClose as-child>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" :disabled="saving">
              {{ saving ? 'Salvando...' : (editingCategory ? 'Salvar' : 'Criar categoria') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/composables/useCategoriesStore'
import { Check, MoreHorizontal, Plus } from '@lucide/vue'

definePageMeta({
  layout: 'admin',
})

useHead({
  title: 'Categorias · Dashboard',
})

const { categories, loading, create: createCategory, update: updateCategory, remove: removeCategory } = useCategoriesStore()
const { minerals } = useMineralsStore()

function mineralCountFor(slug: string) {
  return minerals.value.filter(mineral => mineral.categorySlug === slug).length
}

const colorOptions = [
  { label: 'Ametista', value: 'var(--primary)' },
  { label: 'Vermelho', value: 'var(--mineral-red)' },
  { label: 'Âmbar', value: 'var(--mineral-amber)' },
  { label: 'Verde', value: 'var(--mineral-green)' },
  { label: 'Incolor', value: 'var(--mineral-colorless)' },
  { label: 'Dourado', value: 'var(--mineral-gold)' },
]

const isDialogOpen = ref(false)
const editingCategory = ref<Category | null>(null)
const slugManuallyEdited = ref(false)
const saving = ref(false)
const formError = ref('')

const form = reactive({
  name: '',
  slug: '',
  color: colorOptions[0].value,
})

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

watch(() => form.name, (name) => {
  if (!slugManuallyEdited.value) {
    form.slug = slugify(name)
  }
})

function openCreateDialog() {
  editingCategory.value = null
  form.name = ''
  form.slug = ''
  form.color = colorOptions[0].value
  slugManuallyEdited.value = false
  formError.value = ''
  isDialogOpen.value = true
}

function openEditDialog(category: Category) {
  editingCategory.value = category
  form.name = category.name
  form.slug = category.slug
  form.color = category.dotColor
  slugManuallyEdited.value = true
  formError.value = ''
  isDialogOpen.value = true
}

async function handleSubmit() {
  saving.value = true
  formError.value = ''

  try {
    if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, {
        name: form.name,
        slug: form.slug,
        dotColor: form.color,
      })
    }
    else {
      await createCategory({
        name: form.name,
        slug: form.slug,
        dotColor: form.color,
      })
    }

    isDialogOpen.value = false
  }
  catch {
    formError.value = 'Não foi possível salvar a categoria. Tente novamente.'
  }
  finally {
    saving.value = false
  }
}
</script>
