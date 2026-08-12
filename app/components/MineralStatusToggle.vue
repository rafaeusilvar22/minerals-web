<template>
  <TooltipProvider v-if="isMounted && user && ready">
    <div class="flex gap-1" v-bind="$attrs" @click.stop.prevent>
      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            type="button"
            size="icon-sm"
            :variant="status === 'have' ? 'default' : 'outline'"
            :aria-pressed="status === 'have'"
            class="shadow-sm backdrop-blur-sm"
            @click="handleToggle('have')"
          >
            <LucideCheck class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Já tenho
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger as-child>
          <Button
            type="button"
            size="icon-sm"
            :variant="status === 'want' ? 'default' : 'outline'"
            :aria-pressed="status === 'want'"
            class="shadow-sm backdrop-blur-sm"
            @click="handleToggle('want')"
          >
            <LucideHeart class="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Quero ter
        </TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
</template>

<script setup lang="ts">
import type { MineralStatus } from '~/composables/useMineralInteractions'
import { toast } from 'vue-sonner'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  mineralId: string
  name?: string
}>(), {
  name: 'Mineral',
})

const STATUS_LABEL: Record<MineralStatus, string> = {
  have: 'já tenho',
  want: 'quero ter',
}

const user = useCurrentUser()
const { getStatus, setStatus, ready } = useMineralInteractions()

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

const status = computed(() => getStatus(props.mineralId))

async function handleToggle(next: MineralStatus) {
  const current = getStatus(props.mineralId)
  const cleared = current === next

  await setStatus(props.mineralId, cleared ? null : next)

  if (cleared) {
    toast(`${props.name} removido da sua lista.`)
  } else {
    toast.success(`${props.name} marcado como "${STATUS_LABEL[next]}".`)
  }
}
</script>
