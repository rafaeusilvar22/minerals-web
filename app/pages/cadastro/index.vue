<template>
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle class="text-section-title font-heading">
        Criar conta
      </CardTitle>
      <CardDescription class="text-body">
        Cadastre-se para favoritar minerais e montar sua lista de desejos.
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-2">
          <Label for="name" class="text-body">Nome completo</Label>
          <Input
            id="name"
            v-model="name"
            type="text"
            placeholder="Seu nome"
            autocomplete="name"
            required
            class="h-11 px-4 text-base"
          />
        </div>

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
            autocomplete="new-password"
            required
            class="h-11 px-4 text-base"
          />
        </div>

        <div class="flex flex-col gap-2">
          <Label for="confirm-password" class="text-body">Confirmar senha</Label>
          <Input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            autocomplete="new-password"
            required
            class="h-11 px-4 text-base"
          />
        </div>

        <p v-if="error" class="text-sm text-destructive">
          {{ error }}
        </p>

        <Button type="submit" class="mt-2 h-11 text-base" :disabled="loading">
          {{ loading ? 'Criando conta...' : 'Criar conta' }}
        </Button>

        <p class="text-center text-sm text-muted-foreground">
          Já tem conta?
          <NuxtLink :to="loginLink" class="font-medium text-foreground underline-offset-4 hover:underline">
            Entrar
          </NuxtLink>
        </p>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { FirebaseError } from 'firebase/app'
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth'
import { doc, setDoc, Timestamp } from 'firebase/firestore'

definePageMeta({
  layout: 'blank',
})

useHead({
  title: 'Criar conta',
})

const { $auth, $db } = useNuxtApp()
const route = useRoute()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const loginLink = computed(() => ({
  path: '/login',
  query: route.query.redirect ? { redirect: route.query.redirect } : undefined,
}))

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
}

async function handleSubmit() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem.'
    return
  }

  loading.value = true

  try {
    const credential = await createUserWithEmailAndPassword($auth, email.value, password.value)

    await updateProfile(credential.user, { displayName: name.value })
    await sendEmailVerification(credential.user)

    await setDoc(doc($db, 'users', credential.user.uid), {
      email: email.value,
      displayName: name.value,
      role: 'user',
      createdAt: Timestamp.now(),
    })

    await navigateTo('/minha-conta')
  } catch (err) {
    if (err instanceof FirebaseError) {
      error.value = AUTH_ERROR_MESSAGES[err.code] ?? 'Não foi possível criar a conta. Tente novamente.'
    } else {
      error.value = 'Não foi possível criar a conta. Tente novamente.'
    }
  } finally {
    loading.value = false
  }
}
</script>
