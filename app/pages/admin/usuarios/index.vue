<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h1 class="text-section-title font-heading text-foreground">
        Usuários
      </h1>
      <p class="text-body text-muted-foreground">
        Gerencie as contas cadastradas e promova administradores.
      </p>
    </div>

    <div class="overflow-hidden rounded-2xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead class="w-48">
              Role
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="loading">
            <TableRow v-for="n in 4" :key="n">
              <TableCell>
                <Skeleton class="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton class="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton class="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton class="h-8 w-32" />
              </TableCell>
            </TableRow>
          </template>

          <template v-else v-for="row in users" :key="row.id">
            <TableRow>
              <TableCell class="font-medium text-foreground">
                {{ row.displayName || '—' }}
              </TableCell>
              <TableCell class="text-muted-foreground">
                {{ row.email }}
              </TableCell>
              <TableCell class="text-muted-foreground">
                {{ formatDate(row.createdAt) }}
              </TableCell>
              <TableCell>
                <Select
                  :model-value="row.role"
                  :disabled="row.id === currentUser?.uid"
                  @update:model-value="value => handleRoleChange(row, value as UserRole)"
                >
                  <SelectTrigger class="h-9 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      Usuário
                    </SelectItem>
                    <SelectItem value="admin">
                      Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~/composables/useUserProfile'
import type { UserRow } from '~/composables/useUsersAdmin'

definePageMeta({
  layout: 'admin',
})

useHead({
  title: 'Usuários · Dashboard',
})

const currentUser = useCurrentUser()
const { users, loading, setRole } = useUsersAdmin()

function formatDate(date: UserRow['createdAt']) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date.toDate())
}

async function handleRoleChange(row: UserRow, role: UserRole) {
  if (role === row.role) return
  await setRole(row.id, role)
}
</script>
