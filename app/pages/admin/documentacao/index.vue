<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold tracking-tight">
        Documentação
      </h1>
      <p class="text-muted-foreground">
        Referência interna de infraestrutura, integrações e regras de negócio. Visível só para admins.
      </p>
    </div>

    <Card class="max-w-3xl">
      <CardHeader>
        <CardTitle class="text-base">
          Infraestrutura
        </CardTitle>
        <CardDescription>
          Onde cada peça do projeto está hospedada e configurada.
        </CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <Skeleton v-if="!initialized" class="h-[400px] w-full rounded-lg" />
        <RichTextEditor v-else v-model="html" placeholder="Documente a infraestrutura do projeto..." />

        <p v-if="error" class="text-sm text-destructive">
          {{ error }}
        </p>

        <div>
          <Button :disabled="saving" @click="handleSave">
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

useHead({
  title: 'Documentação · Dashboard',
})

const { content, initialized, save } = useInternalDocs()

const DRAFT_TEMPLATE = `
<h2>Deploy</h2>
<p><strong>Netlify.</strong> Build: <code>npm run build</code>, publish dir: <code>dist</code> (config em <code>netlify.toml</code>).</p>

<h2>Banco de dados</h2>
<p><strong>Firebase Firestore.</strong> Duas formas de acesso:</p>
<ul>
  <li>Client SDK (<code>app/plugins/firebase.client.ts</code>) — usado por auth e por todo o CRUD do admin, direto do navegador.</li>
  <li>Server SDK (<code>server/utils/firestore.ts</code>) — usado pelas rotas <code>server/api/**</code> para leitura pública e cacheável (home, mineral, busca, sobre).</li>
</ul>
<p>Regras de acesso em <code>firestore.rules</code>.</p>

<h2>Autenticação</h2>
<p><strong>Firebase Auth</strong> (e-mail/senha). Papel do usuário (<code>user</code> / <code>admin</code>) fica no documento <code>users/{uid}</code>.</p>

<h2>E-mail / SMTP</h2>
<p><strong>Preencher:</strong> provedor usado para envio dos e-mails de verificação/recuperação do Firebase Auth.</p>

<h2>Armazenamento de imagens</h2>
<p><strong>Cloudinary.</strong> Upload não assinado direto do navegador (<code>app/composables/useCloudinaryUpload.ts</code>), exibição via <code>@nuxt/image</code> com o provider <code>cloudinary</code>.</p>
<p><strong>Preencher:</strong> nome do cloud name / upload preset em uso.</p>

<h2>IA</h2>
<p><strong>Groq</strong> (<code>llama-3.3-70b-versatile</code>, modo JSON), chamado só do servidor (<code>server/api/structure-mineral.post.ts</code> e <code>server/api/improve-mineral.post.ts</code>). Chave nunca exposta ao client.</p>

<h2>Captcha</h2>
<p><strong>Cloudflare Turnstile</strong>, validado em <code>server/api/verify-captcha.post.ts</code>.</p>

<h2>Regras de negócio</h2>
<ul>
  <li>Minerais e categorias: leitura pública, escrita só admin.</li>
  <li>Frase do dia: rotação determinística (dia desde epoch % total de frases), leitura pública, escrita só admin.</li>
  <li>Identificação de mineral por IA: limite de uso diário por usuário (ver regra <code>aiUsage</code> em <code>firestore.rules</code>).</li>
  <li><strong>Preencher:</strong> outras regras de negócio relevantes (planos, limites, políticas de conteúdo, etc.).</li>
</ul>
`.trim()

const html = ref('')

// Syncs only until the initial fetch finishes — after that the form is the
// source of truth, otherwise a late fetch would overwrite what the admin already typed.
const stopSync = watch([content, initialized], ([value, ready]) => {
  if (!ready) return
  html.value = value?.html ?? DRAFT_TEMPLATE
  stopSync()
}, { immediate: true })

const saving = ref(false)
const error = ref('')

async function handleSave() {
  saving.value = true
  error.value = ''

  try {
    await save(html.value)
  }
  catch {
    error.value = 'Não foi possível salvar a documentação. Tente novamente.'
  }
  finally {
    saving.value = false
  }
}
</script>
