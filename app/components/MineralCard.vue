<template>
  <Card class="gap-0 overflow-hidden py-0">
    <div
      class="relative flex h-48 items-center justify-center border-b border-border bg-muted"
      :style="!image ? {
        backgroundImage: 'repeating-linear-gradient(135deg, var(--accent) 0px, var(--accent) 1px, transparent 1px, transparent 14px)',
      } : undefined"
    >
      <NuxtImg
        v-if="image"
        provider="cloudinary"
        :src="cloudinaryPath(image)"
        :alt="name"
        width="400"
        height="192"
        fit="cover"
        class="size-full object-cover"
      />
      <span v-else class="text-eyebrow uppercase tracking-[0.13em] text-muted-foreground">
        Foto · {{ name }}
      </span>

      <MineralStatusToggle :mineral-id="id" :name="name" class="absolute right-2 top-2" />
    </div>

    <CardContent class="flex flex-col gap-2 p-4">
      <span class="text-card-name font-heading text-foreground">{{ name }}</span>

      <div v-if="categoryName" class="flex items-center gap-1.5">
        <span class="size-1.5 shrink-0 rounded-full" :style="{ backgroundColor: dotColor }" />
        <span class="text-eyebrow uppercase tracking-[0.13em] text-primary">{{ categoryName }}</span>
      </div>

      <p class="text-card-description line-clamp-2 text-muted-foreground">
        {{ description }}
      </p>

      <div v-if="chakras.length" class="flex flex-wrap gap-1.5 pt-1">
        <Badge
          v-for="chakra in chakras.slice(0, 4)"
          :key="chakra"
          variant="outline"
          class="border-transparent bg-primary/10 text-primary"
        >
          {{ chakra }}
        </Badge>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  id: string
  name: string
  description: string
  dotColor: string
  image?: string
  categoryName?: string
  chakras?: string[]
}>(), {
  image: undefined,
  categoryName: undefined,
  chakras: () => [],
})
</script>
