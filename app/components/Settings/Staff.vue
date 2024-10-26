<script setup lang="ts">
import type { Database } from '~~/types/database.types'
import { RoleManager, roleOptions, roleToString, stringToRole, type TRoleAttributes } from '~~/types'
import { formatFullName } from '~~/utils/formatting'

interface StaffMember {
  id: string
  name: string
  email: string
  roles: TRoleAttributes[]
}

const { userData: currentUser } = storeToRefs(useUserStore())

const supabase = useSupabaseClient<Database>()

const { data: staff, refresh } = await useAsyncData(
  'staff',
  async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, roles:user_roles(role_id)')
      // TODO: .eq('cycle_id', userData.value!.school.cycleId)
      .order('id')
    if (error) {
      throw error
    }
    return data.map(member => ({
      id: member.id,
      email: member.email,
      name: formatFullName(member.first_name, member.last_name),
      roles: member.roles.map(role => role.role_id as TRoleAttributes),
    } satisfies StaffMember))
  },
)

const searchTerm = ref('')
const roleFilter = ref<TRoleAttributes>()

// Table columns configuration
const columns = [
  {
    key: 'name',
    label: 'Nom complet',
  },
  {
    key: 'email',
    label: 'Email',
  },
  {
    key: 'role',
    label: 'Role',
  },
  {
    key: 'actions',
    label: '',
    sortable: false,
  },
]

// Computed
const filteredStaff = computed(() => {
  if (!staff.value)
    return []

  return staff.value.filter(
    member =>
      member.name.toLowerCase().includes(searchTerm.value.toLowerCase()),
  )
})

// Toast composable
const toast = useToast()

async function addRole(staffId: string) {
  const availableTransitions = RoleManager.getAvailableTransitions(stringToRole(currentUser.value!.role)! as TRoleAttributes)
  const newRole = availableTransitions[0]
  const { error } = await supabase.from('user_roles').insert({ user_id: staffId, role_id: newRole! })
  if (error) {
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de l\'ajout du nouveau role',
    })

    return
  }
  await refresh()

  toast.add({
    title: 'Succès',
    description: 'Un nouveau role vient d\'être attribuer à votre collaborateur',
  })
}

async function removeRole(staffId: string, role: TRoleAttributes) {
  const availableTransitions = RoleManager.getAvailableTransitions(stringToRole(currentUser.value!.role)! as TRoleAttributes)
  const canRemoveRole = availableTransitions[0] === role

  if (!canRemoveRole) {
    toast.add({
      title: 'Erreur',
      description: 'Vous ne pouvez pas supprimer ce rôle',
      color: 'orange',
      icon: 'heroicons:exclamation-triangle',
    })

    return
  }

  const { error } = await supabase.from('user_roles').delete().eq('user_id', staffId).eq('role_id', role)

  if (error) {
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la suppression du role',
    })

    return
  }

  await refresh()

  toast.add({
    title: 'Succès',
    description: 'Un role vient d\'être retiré à votre collaborateur',
  })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Search and Filter Section -->
    <div class="flex space-x-4">
      <UInput
        v-model="searchTerm"
        placeholder="Search staff..."
        class="max-w-sm"
      />

      <USelectMenu
        v-model="roleFilter"
        :options="roleOptions"
        placeholder="Filter by role"
        class="w-[180px]"
      />
    </div>

    <!-- Staff Table -->
    <UTable :rows="filteredStaff" :columns="columns">
      <!-- Custom Role Column -->
      <template #role-data="{ row }">
        <div class="flex flex-wrap gap-1">
          <UChip
            v-for="(role, index) in row.roles"
            :key="index"
            size="md"
            color="red"
            inset
            :ui="{ base: 'mr-1 h-3 w-3 cursor-pointer hover:opacity-80' }"
            @click="removeRole(row.id, role)"
          >
            <UBadge
              :label="roleToString(role)"
              color="gray"
              variant="solid"
              class="mr-2"
              size="sm"
            />

            <template #content>
              <UIcon
                name="i-heroicons-x-mark-20-solid"
                class="w-3 h-3"
              />
            </template>
          </UChip>

          <UButton
            icon="i-heroicons-plus-circle"
            size="xs"
            color="primary"
            square
            variant="soft"
            @click="addRole(row.id)"
          />
        </div>
      </template>

      <!-- Custom Actions Column -->
      <template #actions-data>
        <div class="text-right">
          <UButton color="gray" variant="ghost">
            Gérer les permissions
          </UButton>
        </div>
      </template>
    </UTable>
  </div>
</template>
