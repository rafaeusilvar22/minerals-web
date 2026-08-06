import type { ModuleOptions } from 'shadcn-nuxt'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    shadcn?: Partial<ModuleOptions>
  }
  interface NuxtOptions {
    shadcn?: ModuleOptions
  }
}

export {}
