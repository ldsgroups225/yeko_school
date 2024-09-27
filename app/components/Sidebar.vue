<script setup lang="ts">
const route = useRoute()
const sidebarExpanded = ref(false)
const toggleSidebar = () => sidebarExpanded.value = !sidebarExpanded.value

const userStore = useUserStore()
const { userData: user } = storeToRefs(userStore)

const sidebarItems = [
  { icon: 'i-heroicons-home', label: 'Tableau de bord', href: '/dashboard' },
  { icon: 'i-heroicons-users', label: 'Elèves', href: '/students' },
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
  await userStore.logout()
}
</script>

<template>
  <aside
    class="bg-transparent shadow-lg h-screen flex flex-col"
    :style="{ width: sidebarExpanded ? '240px' : '80px' }"
  >
    <div class="p-4 flex flex-col items-center">
      <NuxtImg src="/logo.png" alt="Logo Yeko" class="h-15 w-15 mb-4" />
      <UButton
        variant="ghost"
        size="sm"
        :icon="sidebarExpanded ? 'i-heroicons-chevron-left' : 'i-heroicons-chevron-right'"
        class="mb-4"
        @click="toggleSidebar"
      />
    </div>
    <nav class="flex-1 mx-auto flex flex-col" :class="[sidebarExpanded && 'pl-6 mx-0']">
      <UTooltip v-for="item in sidebarItems" :key="item.label" :text="item.label" :popper="{ placement: 'right' }">
        <NuxtLink
          :to="item.href"
          class="flex items-center p-4 hover:bg-orange-400/40 cursor-pointer transition-colors duration-200"
          :class="{ 'bg-orange-400/40 hover:bg-orange-600 text-orange-600 dark:text-orange-800': route.path === item.href }"
        >
          <UIcon :name="item.icon" class="h-6 w-6 text-orange-600" />
          <span v-if="sidebarExpanded" class="ml-2 text-gray-700">{{ item.label }}</span>
        </NuxtLink>
      </UTooltip>
    </nav>
    <div class="p-4">
      <UDropdown :items="profileDropdownItems">
        <UButton variant="ghost" class="group space-x-2">
          <UAvatar
            :src="user?.avatar || '/profile-pic.webp'"
            :alt="user?.fullName || 'User'"
            size="sm"
          />
          <span v-if="sidebarExpanded">{{ user?.fullName ?? 'Profil' }}</span>
        </UButton>
      </UDropdown>
    </div>
  </aside>
</template>
