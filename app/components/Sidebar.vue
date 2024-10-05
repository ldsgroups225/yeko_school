<script setup lang="ts">
const route = useRoute()
const sidebarExpanded = ref(false)
const toggleSidebar = () => sidebarExpanded.value = !sidebarExpanded.value

const userStore = useUserStore()
const { logout } = userStore
const { userData: user, isLoading } = storeToRefs(userStore)

const sidebarItems = [
  { icon: 'i-heroicons-home', label: 'Tableau de bord', href: '/dashboard' },
  { icon: 'i-heroicons-users', label: 'Élèves', href: '/students' },
  { icon: 'i-heroicons-book-open', label: 'Classes', href: '/classes' },
  { icon: 'i-heroicons-calendar', label: 'Emploi du temps', href: '/schedules' },
  { icon: 'i-heroicons-bell', label: 'Notifications', href: '/notifications' },
  { icon: 'i-heroicons-cog', label: 'Configurations', href: '/settings' },
]

const profileDropdownItems = computed(() => [
  [
    { label: 'Voir le profil', to: '/profile' },
    { label: 'Se déconnecter', icon: 'i-heroicons-logout', click: handleLogout },
  ],
])

async function handleLogout() {
  await logout()
  navigateTo('/login')
}
</script>

<template>
  <aside
    class="bg-transparent shadow-lg h-screen flex flex-col transition-all duration-300 ease-in-out"
    :style="{ width: sidebarExpanded ? '240px' : '80px' }"
  >
    <div class="p-4 flex flex-col items-center">
      <USkeleton v-if="isLoading" class="h-15 w-15 mb-4" :ui="{ rounded: 'rounded-full' }" />
      <NuxtImg v-else src="/logo.png" alt="Logo Yeko" class="h-15 w-15 mb-4" />
      <UButton
        variant="ghost"
        size="sm"
        :icon="sidebarExpanded ? 'i-heroicons-chevron-left' : 'i-heroicons-chevron-right'"
        class="mb-4"
        :disabled="isLoading"
        @click="toggleSidebar"
      />
    </div>
    <nav class="flex-1 mx-auto flex flex-col" :class="[sidebarExpanded && 'pl-6 mx-0']">
      <template v-if="isLoading">
        <div v-for="i in 6" :key="i" class="flex items-center p-4">
          <USkeleton class="h-6 w-6 mr-2" />
          <USkeleton v-if="sidebarExpanded" class="h-4 w-24" />
        </div>
      </template>
      <template v-else>
        <UTooltip v-for="item in sidebarItems" :key="item.label" :text="item.label" :popper="{ placement: 'right' }">
          <NuxtLink
            :to="item.href"
            class="flex items-center p-4 hover:bg-orange-400/40 cursor-pointer transition-colors duration-200"
            :class="{ 'bg-orange-400/40 hover:bg-orange-600 text-orange-600 dark:text-orange-500': route.path === item.href }"
          >
            <UIcon :name="item.icon" class="h-6 w-6 text-orange-600 dark:text-orange-500" />
            <span v-if="sidebarExpanded" class="ml-2 text-orange-600 dark:text-orange-500 truncate">{{ item.label }}</span>
          </NuxtLink>
        </UTooltip>
      </template>
    </nav>
    <div class="p-4">
      <UDropdown :items="profileDropdownItems" :disabled="isLoading">
        <UButton variant="ghost" class="group space-x-2">
          <USkeleton v-if="isLoading" class="h-8 w-8" :ui="{ rounded: 'rounded-full' }" />
          <UAvatar
            v-else
            :src="user?.avatarUrl || '/profile-pic.webp'"
            :alt="user?.fullName || 'User'"
            size="sm"
          />
          <USkeleton v-if="isLoading && sidebarExpanded" class="h-4 w-20" />
          <span v-else-if="sidebarExpanded">{{ user?.fullName ?? 'Profil' }}</span>
        </UButton>
      </UDropdown>
    </div>
  </aside>
</template>
