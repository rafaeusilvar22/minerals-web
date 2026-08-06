<template>
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle class="text-section-title">
        Entrar
      </CardTitle>
      <CardDescription class="text-body">
        Acesse sua conta para continuar.
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-2">
          <Label for="email" class="text-body">E-mail</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="voce@email.com"
            autocomplete="email"
            required
            class="h-11 px-4 text-base"
          />
        </div>

        <div class="flex flex-col gap-2">
          <Label for="password" class="text-body">Senha</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            required
            class="h-11 px-4 text-base"
          />
        </div>

        <p v-if="error" class="text-sm text-destructive">
          {{ error }}
        </p>

        <Button type="submit" class="mt-2 h-11 text-base" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword } from 'firebase/auth'

definePageMeta({
  layout: 'blank',
})

useHead({
  title: 'Entrar',
})

const { $auth } = useNuxtApp()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
}

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    await signInWithEmailAndPassword($auth, email.value, password.value)

    const redirect = route.query.redirect
    await navigateTo(typeof redirect === 'string' ? redirect : '/admin/dashboard')
  } catch (err) {
    if (err instanceof FirebaseError) {
      error.value = AUTH_ERROR_MESSAGES[err.code] ?? 'Não foi possível entrar. Tente novamente.'
    } else {
      error.value = 'Não foi possível entrar. Tente novamente.'
    }
  } finally {
    loading.value = false
  }
}
</script>
