// middleware/auth.global.ts
import { onAuthStateChanged, type User } from 'firebase/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // O Firebase Auth só está disponível no cliente (plugin firebase.client.ts)
  if (import.meta.server) return

  const isAdminRoute = to.path.startsWith('/admin')
  const isLoginRoute = to.path === '/login'

  if (!isAdminRoute && !isLoginRoute) return

  const { $auth } = useNuxtApp()

  const user = await new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged($auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })

  if (isAdminRoute && !user) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (isLoginRoute && user) {
    return navigateTo('/admin/dashboard')
  }
})
