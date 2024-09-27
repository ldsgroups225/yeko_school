<script setup lang="ts">
const route = useRoute()
const sidebarExpanded = ref(false)
const toggleSidebar = () => sidebarExpanded.value = !sidebarExpanded.value

const userStore = useUserStore()
const { userData: user, isLoading } = storeToRefs(userStore)

const sidebarItems = [
  { icon: 'i-heroicons-home', label: 'Tableau de bord', href: '/dashboard' },
  { icon: 'i-heroicons-users', label: 'Elèves', href: '/students' },
  { icon: 'i-heroicons-book-open', label: 'Classes', href: '/classes' },
  { icon: 'i-heroicons-calendar', label: 'Emploi du temps', href: '/schedules' },
  { icon: 'i-heroicons-bell', label: 'Notifications', href: '/notifications' },
  { icon: 'i-heroicons-cog', label: 'Configurations', href: '/settings' },
]

const profileDropdownItems = [
  [
    { label: 'Voir le profil', to: '/profile' },
    { label: 'Se déconnecter', icon: 'i-heroicons-logout', click: handleLogout },
  ],
]

const breadcrumbLinks = computed(() => {
  const links = [
    { label: 'Home', icon: 'i-heroicons-home', to: '/dashboard' },
    { label: 'Admin', icon: 'i-heroicons-user-circle' },
  ]

  const currentItem = sidebarItems.find(item => item.href === route.path)
  if (currentItem) {
    links.push({ label: currentItem.label, icon: currentItem.icon })
  }

  return links
})

function handleLogout() {
  // TODO: Implement logout functionality
  console.log('logout', user.value)
}

onMounted(async () => {
  await userStore.fetchUserData()
})
</script>

<template>
  <div class="flex h-screen">
    <div v-if="isLoading">
      <div class="flex h-screen items-center justify-center">
        <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900" />
      </div>
    </div>

    <template v-else>
      <!-- Sidebar -->
      <aside
        class="bg-white shadow-md h-screen flex flex-col"
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

        <nav class="flex-1 mx-auto" :class="[sidebarExpanded && 'pl-6 mx-0']">
          <UTooltip v-for="item in sidebarItems" :key="item.label" :text="item.label" :popper="{ placement: 'right' }">
            <NuxtLink
              :to="item.href"
              class="flex items-center p-4 hover:bg-orange-100 cursor-pointer transition-colors duration-200"
              :class="{ 'bg-orange-100 hover:bg-orange-300 text-orange-600': route.path === item.href }"
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

      <!-- Main Content -->
      <main class="flex flex-col w-full">
        <div class="shadow-sm sticky top-0 z-10">
          <div class="bg-primary h-3" />
          <div class="bg-blue-600 h-9 mx-12 rounded-b-lg" />
        </div>

        <div class="flex flex-col h-full overflow-y-auto p-6">
          <!-- Breadcrumbs -->
          <UBreadcrumb :links="breadcrumbLinks" class="mb-6">
            <template #icon="{ link }">
              <UIcon :name="link.icon" />
            </template>
          </UBreadcrumb>

          <!-- Page Content -->
          <slot />
        </div>
      </main>
    </template>
  </div>
</template>
