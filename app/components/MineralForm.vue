<template>
  <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Imagens
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <button
          type="button"
          class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-8 text-center transition-colors hover:border-primary hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="uploading"
          @click="fileInput?.click()"
        >
          <Upload class="size-6 text-muted-foreground" />
          <span class="text-body text-muted-foreground">
            {{ uploading ? 'Enviando imagens...' : 'Clique para selecionar uma ou mais imagens' }}
          </span>
        </button>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="onFilesSelected"
        >

        <div v-if="form.images.length || uploading" class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          <div
            v-for="(image, index) in form.images"
            :key="image"
            class="group relative aspect-square overflow-hidden rounded-xl border border-border"
          >
            <img :src="image" alt="" class="size-full object-cover">
            <button
              type="button"
              class="absolute top-1.5 right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remover imagem"
              @click="removeImage(index)"
            >
              <X class="size-3.5" />
            </button>
          </div>

          <div
            v-if="uploading"
            class="flex aspect-square items-center justify-center rounded-xl border border-dashed border-border text-body text-muted-foreground"
          >
            Enviando...
          </div>
        </div>

        <p v-if="uploadError" class="text-sm text-destructive">
          {{ uploadError }}
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Estruturar com IA
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-3">
        <Textarea
          v-model="aiText"
          placeholder="Cole ou escreva um texto livre sobre o minério (nome, composição, dureza, cor, sistema cristalino, curiosidades...) e deixe a IA preencher o formulário."
          rows="4"
        />
        <div class="flex items-center justify-between gap-2">
          <p v-if="aiError" class="text-sm text-destructive">
            {{ aiError }}
          </p>
          <Button
            type="button"
            variant="outline"
            class="ml-auto"
            :disabled="aiLoading || !aiText.trim()"
            @click="handleStructureWithAI"
          >
            {{ aiLoading ? 'Estruturando...' : 'Estruturar com IA' }}
          </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Informações básicas
        </CardTitle>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-2">
        <div class="flex flex-col gap-2 sm:col-span-2">
          <Label for="mineral-name">Nome</Label>
          <Input id="mineral-name" v-model="form.name" placeholder="Ex: Ametista" required />
        </div>

        <div class="flex flex-col gap-2">
          <Label for="mineral-category">Categoria</Label>
          <Select v-model="form.categorySlug" required>
            <SelectTrigger id="mineral-category" class="w-full">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="category in categories" :key="category.slug" :value="category.slug">
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex flex-col gap-2">
          <Label for="mineral-formula">Fórmula química</Label>
          <Input id="mineral-formula" v-model="form.formula" placeholder="Ex: SiO₂" class="font-mono" required />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Propriedades físicas
        </CardTitle>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <Label for="mineral-hardness-min">Dureza mínima (Mohs)</Label>
          <Input
            id="mineral-hardness-min"
            v-model.number="form.hardnessMin"
            type="number"
            min="1"
            max="10"
            step="0.5"
            required
          />
        </div>

        <div class="flex flex-col gap-2">
          <Label for="mineral-hardness-max">Dureza máxima (Mohs)</Label>
          <Input
            id="mineral-hardness-max"
            v-model.number="form.hardnessMax"
            type="number"
            min="1"
            max="10"
            step="0.5"
            required
          />
        </div>

        <div class="flex flex-col gap-2">
          <Label for="mineral-crystal-system">Sistema cristalino</Label>
          <Select v-model="form.crystalSystem" required>
            <SelectTrigger id="mineral-crystal-system" class="w-full">
              <SelectValue placeholder="Selecione um sistema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="system in crystalSystems" :key="system" :value="system">
                {{ system }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex flex-col gap-2 sm:col-span-2">
          <Label>Cor(es)</Label>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in colorPalette"
              :key="option.value"
              type="button"
              class="flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
              :class="form.colors.includes(option.value) ? 'border-foreground bg-accent' : 'border-border hover:bg-accent'"
              :aria-pressed="form.colors.includes(option.value)"
              @click="toggleColor(option.value)"
            >
              <span class="size-2.5 rounded-full border border-black/10" :style="{ backgroundColor: option.hex }" />
              {{ option.label }}
            </button>
          </div>

          <div class="flex gap-2">
            <Input
              v-model="customColor"
              placeholder="Outra cor (ex: Azul-esverdeado)"
              @keydown.enter.prevent="addCustomColor"
            />
            <Button type="button" variant="outline" @click="addCustomColor">
              Adicionar
            </Button>
          </div>

          <div v-if="form.colors.length" class="flex flex-wrap gap-1.5">
            <Badge v-for="color in form.colors" :key="color" variant="secondary" class="gap-1 pr-1.5">
              {{ color }}
              <button type="button" aria-label="Remover cor" class="cursor-pointer" @click="removeColor(color)">
                <X class="size-3" />
              </button>
            </Badge>
          </div>

          <p v-if="colorsError" class="text-sm text-destructive">
            {{ colorsError }}
          </p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Descrição
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          v-model="form.description"
          placeholder="Conte um pouco sobre a origem, cor e curiosidades do mineral."
          rows="4"
          required
        />
      </CardContent>
    </Card>

    <div class="flex justify-end gap-2">
      <Button type="button" variant="outline" as-child>
        <NuxtLink to="/admin/minerais">
          Cancelar
        </NuxtLink>
      </Button>
      <Button type="submit" :disabled="uploading || saving">
        {{ saving ? 'Salvando...' : submitLabel }}
      </Button>
    </div>

    <p v-if="formError" class="text-sm text-destructive">
      {{ formError }}
    </p>
  </form>
</template>

<script setup lang="ts">
import type { Mineral } from '~/composables/useMineralsStore'
import { Upload, X } from '@lucide/vue'

const props = withDefaults(defineProps<{
  initialValue?: Omit<Mineral, 'id'>
  submitLabel?: string
  saving?: boolean
  formError?: string
}>(), {
  initialValue: undefined,
  saving: false,
  formError: '',
  submitLabel: 'Salvar mineral',
})

const emit = defineEmits<{
  submit: [value: Omit<Mineral, 'id'>]
}>()

const { categories } = useCategoriesStore()

const crystalSystems = [
  'Cúbico',
  'Tetragonal',
  'Ortorrômbico',
  'Hexagonal',
  'Trigonal',
  'Monoclínico',
  'Triclínico',
]

const colorPalette = [
  { label: 'Amarelo', value: 'Amarelo', hex: '#eab308' },
  { label: 'Azul', value: 'Azul', hex: '#2563eb' },
  { label: 'Branco', value: 'Branco', hex: '#f5f5f5' },
  { label: 'Cinza', value: 'Cinza', hex: '#737373' },
  { label: 'Dourado', value: 'Dourado', hex: '#ca8a04' },
  { label: 'Incolor', value: 'Incolor', hex: '#e5e5e5' },
  { label: 'Laranja', value: 'Laranja', hex: '#f97316' },
  { label: 'Marrom', value: 'Marrom', hex: '#92400e' },
  { label: 'Prateado', value: 'Prateado', hex: '#a3a3a3' },
  { label: 'Preto', value: 'Preto', hex: '#171717' },
  { label: 'Rosa', value: 'Rosa', hex: '#ec4899' },
  { label: 'Roxo', value: 'Roxo', hex: '#9333ea' },
  { label: 'Verde', value: 'Verde', hex: '#16a34a' },
  { label: 'Vermelho', value: 'Vermelho', hex: '#dc2626' },
]

const form = reactive<Omit<Mineral, 'id'>>({
  name: props.initialValue?.name ?? '',
  categorySlug: props.initialValue?.categorySlug ?? '',
  formula: props.initialValue?.formula ?? '',
  hardnessMin: props.initialValue?.hardnessMin ?? 1,
  hardnessMax: props.initialValue?.hardnessMax ?? 1,
  crystalSystem: props.initialValue?.crystalSystem ?? '',
  colors: [...(props.initialValue?.colors ?? [])],
  description: props.initialValue?.description ?? '',
  images: [...(props.initialValue?.images ?? [])],
})

const customColor = ref('')
const colorsError = ref('')

watch(() => form.colors.length, (length) => {
  if (length > 0) {
    colorsError.value = ''
  }
})

function toggleColor(value: string) {
  const index = form.colors.indexOf(value)
  if (index === -1) {
    form.colors.push(value)
  }
  else {
    form.colors.splice(index, 1)
  }
}

function addCustomColor() {
  const value = customColor.value.trim()
  if (value && !form.colors.includes(value)) {
    form.colors.push(value)
  }
  customColor.value = ''
}

function removeColor(value: string) {
  const index = form.colors.indexOf(value)
  if (index !== -1) {
    form.colors.splice(index, 1)
  }
}

const fileInput = useTemplateRef('fileInput')
const { upload } = useCloudinaryUpload()
const uploading = ref(false)
const uploadError = ref('')

async function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || !files.length) {
    return
  }

  uploading.value = true
  uploadError.value = ''

  try {
    const urls = await Promise.all(Array.from(files).map(file => upload(file)))
    form.images.push(...urls)
  }
  catch {
    uploadError.value = 'Não foi possível enviar uma ou mais imagens. Tente novamente.'
  }
  finally {
    uploading.value = false
    input.value = ''
  }
}

function removeImage(index: number) {
  form.images.splice(index, 1)
}

const { structure, loading: aiLoading, error: aiError } = useMineralAI()
const aiText = ref('')

async function handleStructureWithAI() {
  try {
    const result = await structure(aiText.value, categories.value)

    if (result.name) form.name = result.name
    if (result.categorySlug) form.categorySlug = result.categorySlug
    if (result.formula) form.formula = result.formula
    if (result.hardnessMin) form.hardnessMin = result.hardnessMin
    if (result.hardnessMax) form.hardnessMax = result.hardnessMax
    if (result.crystalSystem) form.crystalSystem = result.crystalSystem
    if (result.colors.length) form.colors = result.colors
    if (result.description) form.description = result.description
  }
  catch {
    // aiError já é preenchido pelo composable
  }
}

function handleSubmit() {
  if (!form.colors.length) {
    colorsError.value = 'Selecione ou adicione ao menos uma cor.'
    return
  }

  colorsError.value = ''
  emit('submit', { ...form })
}
</script>
