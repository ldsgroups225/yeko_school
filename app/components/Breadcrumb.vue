<script setup lang="ts">
const route = useRoute()

const sidebarItems = [
  { icon: 'i-heroicons-home', label: 'Tableau de bord', href: '/dashboard' },
  { icon: 'i-heroicons-users', label: 'Elèves', href: '/students' },
  { icon: 'i-heroicons-book-open', label: 'Classes', href: '/classes' },
  { icon: 'i-heroicons-calendar', label: 'Emploi du temps', href: '/schedules' },
  { icon: 'i-heroicons-bell', label: 'Notifications', href: '/notifications' },
  { icon: 'i-heroicons-cog', label: 'Configurations', href: '/settings' },
]

const breadcrumbLinks = computed(() => {
  const links = []
  const currentItem = sidebarItems.find(item => item.href === route.path)
  if (currentItem) {
    links.push({ label: currentItem.label, icon: currentItem.icon })
  }
  return links
})
</script>

<template>
  <UBreadcrumb :links="breadcrumbLinks" class="mb-6">
    <template #icon="{ link }">
      <UIcon :name="link.icon" />
    </template>
  </UBreadcrumb>
</template>
