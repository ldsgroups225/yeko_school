<script setup lang="ts">
const userStore = useUserStore()
const { isLoading } = storeToRefs(userStore)

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
      <Sidebar />
      <!-- Main Content -->
      <main class="flex flex-col w-full">
        <div class="shadow-sm sticky top-0 z-10">
          <div class="bg-primary h-1" />
          <div class="bg-blue-600 h-3 mx-12 rounded-b-lg" />
        </div>
        <div class="flex flex-col h-full overflow-y-auto p-6">
          <!-- Breadcrumbs -->
          <Breadcrumb />
          <!-- Page Content -->
          <slot />
        </div>
      </main>
    </template>
  </div>
</template>
