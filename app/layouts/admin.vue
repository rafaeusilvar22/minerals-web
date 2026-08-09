<template>
  <SidebarProvider>
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NuxtLink to="/" class="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2!">
          <img src="/images/logo-magia-cristais.png" alt="Magia Cristais" class="size-8 shrink-0 object-contain group-data-[collapsible=icon]:size-4">
          <span class="font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            Magia Cristais
          </span>
        </NuxtLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu class="gap-1">
              <SidebarMenuItem v-for="item in navItems" :key="item.to">
                <SidebarMenuButton as-child :is-active="route.path === item.to" :tooltip="item.label">
                  <NuxtLink :to="item.to">
                    <component :is="item.icon" />
                    <span>{{ item.label }}</span>
                  </NuxtLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton as-child tooltip="Ver site">
                  <a href="/" target="_blank" rel="noopener noreferrer">
                    <LucideExternalLink />
                    <span>Ver site</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <SidebarMenuButton tooltip="Conta">
                  <LucideUser />
                  <span v-if="isMounted && user" class="truncate group-data-[collapsible=icon]:hidden">
                    {{ user.email }}
                  </span>
                  <Skeleton v-else class="h-4 w-32 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" class="w-56">
                <DropdownMenuLabel v-if="user" class="truncate font-normal text-muted-foreground">
                  {{ user.email }}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="handleLogout">
                  <LucideLogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <ThemeToggle class="ml-auto" />
      </header>

      <div class="flex-1 p-6">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { Diamond, LayoutDashboard, Settings, Tags } from '@lucide/vue'
import { signOut } from 'firebase/auth'

const route = useRoute()
const { $auth } = useNuxtApp()
const user = useCurrentUser()

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Minerais', to: '/admin/minerais', icon: Diamond },
  { label: 'Categorias', to: '/admin/categorias', icon: Tags },
  { label: 'Configurações', to: '/admin/configuracoes', icon: Settings },
]

async function handleLogout() {
  await signOut($auth)
  await navigateTo('/login')
}
</script>
