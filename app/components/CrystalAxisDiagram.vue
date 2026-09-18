<template>
  <svg viewBox="0 0 120 120" class="h-full w-full" aria-hidden="true">
    <line
      v-for="axis in config.axes"
      :key="axis.label"
      :x1="origin.x"
      :y1="origin.y"
      :x2="axis.x"
      :y2="axis.y"
      stroke="var(--primary)"
      stroke-width="2"
      stroke-linecap="round"
    />
    <circle
      v-for="axis in config.axes"
      :key="`${axis.label}-tip`"
      :cx="axis.x"
      :cy="axis.y"
      r="3"
      fill="var(--card)"
      stroke="var(--primary)"
      stroke-width="2"
    />
    <circle :cx="origin.x" :cy="origin.y" r="3" fill="var(--primary)" />
    <polygon v-if="foldPoints" :points="foldPoints" fill="var(--gold)" />
  </svg>
</template>

<script setup lang="ts">
type SystemId = 'cubico' | 'tetragonal' | 'ortorrombico' | 'hexagonal' | 'trigonal' | 'monoclinico' | 'triclinico'

const props = defineProps<{ system: SystemId }>()

interface AxisPoint {
  label: string
  x: number
  y: number
}

interface SystemConfig {
  axes: AxisPoint[]
  fold?: 'hexagon' | 'triangle'
  foldAt?: { x: number, y: number }
}

const origin = { x: 60, y: 78 }

// Eixos desenhados em convenção "cavaleira" (c vertical, b à direita, a recuando
// pra frente-esquerda), como nos diagramas clássicos de cruz axial de mineralogia.
// Os ângulos exatos entre os traços não são literais — o que varia por sistema é
// o comprimento relativo dos eixos (iguais vs. diferentes) e, no monoclínico e
// triclínico, o quanto o eixo "a" se afasta da posição-padrão pra sugerir obliquidade.
const configs: Record<SystemId, SystemConfig> = {
  cubico: {
    axes: [
      { label: 'c', x: 60, y: 48 },
      { label: 'b', x: 90, y: 78 },
      { label: 'a', x: 43, y: 103 },
    ],
  },
  tetragonal: {
    axes: [
      { label: 'c', x: 60, y: 40 },
      { label: 'b', x: 84, y: 78 },
      { label: 'a', x: 46, y: 98 },
    ],
  },
  ortorrombico: {
    axes: [
      { label: 'c', x: 60, y: 42 },
      { label: 'b', x: 88, y: 78 },
      { label: 'a', x: 49, y: 94 },
    ],
  },
  monoclinico: {
    axes: [
      { label: 'c', x: 60, y: 45 },
      { label: 'b', x: 87, y: 78 },
      { label: 'a', x: 39, y: 84 },
    ],
  },
  triclinico: {
    axes: [
      { label: 'c', x: 64, y: 47 },
      { label: 'b', x: 85, y: 82 },
      { label: 'a', x: 42, y: 85 },
    ],
  },
  hexagonal: {
    axes: [
      { label: 'c', x: 60, y: 40 },
      { label: 'a1', x: 86, y: 78 },
      { label: 'a2', x: 47, y: 101 },
      { label: 'a3', x: 47, y: 56 },
    ],
    fold: 'hexagon',
    foldAt: { x: 60, y: 31 },
  },
  trigonal: {
    axes: [
      { label: 'c', x: 60, y: 46 },
      { label: 'a1', x: 84, y: 82 },
      { label: 'a2', x: 45, y: 96 },
      { label: 'a3', x: 52, y: 55 },
    ],
    fold: 'triangle',
    foldAt: { x: 60, y: 37 },
  },
}

const config = computed(() => configs[props.system])

function polygonPoints(center: { x: number, y: number }, sides: number, radius: number) {
  return Array.from({ length: sides }, (_, i) => {
    const angle = (Math.PI / 180) * ((360 / sides) * i)
    const x = center.x + radius * Math.sin(angle)
    const y = center.y - radius * Math.cos(angle)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

const foldPoints = computed(() => {
  const { fold, foldAt } = config.value
  if (!fold || !foldAt) return ''
  return polygonPoints(foldAt, fold === 'hexagon' ? 6 : 3, fold === 'hexagon' ? 5.5 : 6)
})
</script>
