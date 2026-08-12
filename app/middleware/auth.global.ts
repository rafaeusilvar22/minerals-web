// middleware/auth.global.ts
import { onAuthStateChanged, type User } from 'firebase/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // Firebase Auth is only available on the client (firebase.client.ts plugin)
  if (import.meta.server) return

  const isAdminRoute = to.path.startsWith('/admin')
  const isLoginRoute = to.path === '/login'
  const isSignupRoute = to.path === '/cadastro'
  // Routes that only require being logged in (any role), no extra check.
  const isAccountRoute = to.path === '/minha-conta' || to.path === '/minha-lista' || to.path.startsWith('/identificar')

  if (!isAdminRoute && !isLoginRoute && !isSignupRoute && !isAccountRoute) return

  const { $auth } = useNuxtApp()

  const user = await new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged($auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })

  if (isAdminRoute) {
    if (!user) {
      return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
    }

    const role = await resolveUserRole(user.uid)
    if (role !== 'admin') {
      return navigateTo('/')
    }
  }

  if ((isLoginRoute || isSignupRoute) && user) {
    const role = await resolveUserRole(user.uid)
    return navigateTo(role === 'admin' ? '/admin/dashboard' : '/')
  }

  if (isAccountRoute && !user) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
