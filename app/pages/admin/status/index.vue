<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-bold tracking-tight">
          Status das integrações
        </h1>
        <p class="text-muted-foreground">
          Verificação em tempo real da conectividade com os serviços externos que a plataforma depende.
        </p>
      </div>

      <Button :disabled="loading" @click="checkHealth">
        <LucideRefreshCw :class="['size-4', loading && 'animate-spin']" />
        {{ loading ? 'Verificando...' : 'Verificar agora' }}
      </Button>
    </div>

    <p v-if="loadError" class="text-sm text-destructive">
      {{ loadError }}
    </p>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Card v-for="service in services" :key="service.key">
        <CardHeader>
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-col gap-1">
              <CardTitle class="text-base">
                {{ service.label }}
              </CardTitle>
              <CardDescription>{{ service.description }}</CardDescription>
            </div>
            <Skeleton v-if="loading && !service.health" class="h-5 w-16 shrink-0 rounded-4xl" />
            <Badge v-else :class="statusBadgeClass(service.health?.status)">
              <component :is="statusIcon(service.health?.status)" />
              {{ statusLabel(service.health?.status) }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="flex flex-col gap-1">
          <Skeleton v-if="loading && !service.health" class="h-4 w-full" />
          <p v-else class="text-sm text-muted-foreground">
            {{ service.health?.message ?? 'Ainda não verificado.' }}
          </p>
          <p v-if="service.health" class="text-xs text-muted-foreground">
            Verificado às {{ formatTime(service.health.checkedAt) }}
          </p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Como funciona essa verificação
        </CardTitle>
        <CardDescription>
          Nada aqui é histórico ou monitoramento contínuo — cada verificação é uma checagem ao vivo, feita pelo servidor no momento em que você clica em "Verificar agora".
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl class="flex flex-col divide-y divide-border">
          <div v-for="service in services" :key="service.key" class="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-6">
            <dt class="shrink-0 text-sm font-medium sm:w-40">
              {{ service.label }}
            </dt>
            <dd class="text-sm text-muted-foreground">
              {{ service.method }}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { CircleAlert, CircleCheck, CircleX, RefreshCw } from '@lucide/vue'

interface ServiceHealth {
  status: 'ok' | 'degraded' | 'down'
  message: string
  checkedAt: string
}

interface HealthResponse {
  groq: ServiceHealth
  cloudinary: ServiceHealth
  firebase: ServiceHealth
}

definePageMeta({
  layout: 'admin',
})

useHead({
  title: 'Status das integrações · Dashboard',
})

const loading = ref(false)
const loadError = ref('')

const services = ref([
  {
    key: 'groq' as const,
    label: 'Groq (IA)',
    description: 'Usada para estruturar e revisar dados de minerais.',
    method: 'O servidor consulta a lista de modelos da Groq usando nossa chave de API. Isso confirma que a chave é válida e, além disso, verifica se os modelos que usamos (ex: openai/gpt-oss-120b) ainda existem no catálogo — foi a falta dessa checagem que causou o erro de 502 investigado recentemente, quando um modelo foi descontinuado pela Groq sem aviso prévio.',
    health: null as ServiceHealth | null,
  },
  {
    key: 'cloudinary' as const,
    label: 'Cloudinary',
    description: 'Hospedagem e entrega das imagens dos minerais.',
    method: 'O servidor pede uma imagem de teste (inexistente) na URL do nosso cloud name. Se o CDN responder como imagem (mesmo "não encontrada"), o cloud name está correto e o CDN está no ar; se responder com uma página de erro em HTML, o cloud name configurado é inválido.',
    health: null as ServiceHealth | null,
  },
  {
    key: 'firebase' as const,
    label: 'Firebase',
    description: 'Banco de dados (Firestore) com os minerais, categorias e conteúdo do site.',
    method: 'O servidor faz uma leitura de teste (1 documento) na coleção de categorias do Firestore. Se a leitura funcionar, o banco está acessível e as regras de segurança permitem a operação.',
    health: null as ServiceHealth | null,
  },
])

async function checkHealth() {
  loading.value = true
  loadError.value = ''

  try {
    const result = await $fetch<HealthResponse>('/api/health')
    for (const service of services.value) {
      service.health = result[service.key]
    }
  }
  catch {
    loadError.value = 'Não foi possível verificar o status das integrações. Tente novamente.'
  }
  finally {
    loading.value = false
  }
}

function statusLabel(status?: ServiceHealth['status']) {
  if (status === 'ok') return 'Operacional'
  if (status === 'degraded') return 'Instável'
  if (status === 'down') return 'Indisponível'
  return 'Desconhecido'
}

function statusIcon(status?: ServiceHealth['status']) {
  if (status === 'ok') return CircleCheck
  if (status === 'degraded') return CircleAlert
  if (status === 'down') return CircleX
  return CircleAlert
}

function statusBadgeClass(status?: ServiceHealth['status']) {
  if (status === 'ok') return 'bg-mineral-green/10 text-mineral-green'
  if (status === 'degraded') return 'bg-mineral-amber/10 text-mineral-amber'
  if (status === 'down') return 'bg-destructive/10 text-destructive'
  return 'bg-muted text-muted-foreground'
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeStyle: 'medium' }).format(new Date(iso))
}

onMounted(() => {
  checkHealth()
})
</script>
