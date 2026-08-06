<template>
  <Card class="gap-0 overflow-hidden py-0">
    <div
      class="relative flex aspect-4/3 items-center justify-center border-b border-border bg-muted"
      :style="!image ? {
        backgroundImage: 'repeating-linear-gradient(135deg, var(--accent) 0px, var(--accent) 1px, transparent 1px, transparent 14px)',
      } : undefined"
    >
      <img v-if="image" :src="image" :alt="name" class="size-full object-cover">
      <span v-else class="text-eyebrow font-mono uppercase tracking-[0.13em] text-muted-foreground">
        Foto · {{ name }}
      </span>
    </div>

    <CardContent class="flex flex-col gap-2 p-4">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="size-2 shrink-0 rounded-full" :style="{ backgroundColor: dotColor }" />
          <span class="text-card-name text-foreground">{{ name }}</span>
        </div>
        <Badge variant="outline" class="h-auto shrink-0 rounded-full border-border bg-accent px-2.5 py-0.5 font-mono text-xs font-normal text-primary">
          {{ formula }}
        </Badge>
      </div>

      <p class="text-card-description text-muted-foreground">
        {{ description }}
      </p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  name: string
  formula: string
  description: string
  dotColor: string
  image?: string
}>(), {
  image: undefined,
})
</script>
