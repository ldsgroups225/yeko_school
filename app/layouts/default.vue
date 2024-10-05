<script setup lang="ts">
const userStore = useUserStore()
const { isLoading } = storeToRefs(userStore)

onMounted(async () => {
  await userStore.fetchUserData()
})
</script>

<template>
  <div class="flex h-screen">
    <template v-if="isLoading">
      <!-- Skeleton Loading State -->
      <div class="flex h-screen w-full">
        <!-- Sidebar Skeleton -->
        <div class="w-20 bg-gray-100 dark:bg-gray-800 h-full flex flex-col items-center py-4 space-y-4">
          <USkeleton class="h-12 w-12 rounded-full" />
          <USkeleton v-for="i in 6" :key="i" class="h-8 w-8 rounded-full" />
        </div>

        <!-- Main Content Skeleton -->
        <div class="flex-1 flex flex-col">
          <!-- Header Skeleton -->
          <div class="h-14 bg-white dark:bg-gray-900 shadow-sm flex items-center px-6">
            <USkeleton class="h-4 w-32" />
          </div>

          <!-- Content Skeleton -->
          <div class="flex-1 p-6 space-y-4">
            <USkeleton class="h-8 w-64" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-3/4" />
            <div class="grid grid-cols-3 gap-4 mt-8">
              <USkeleton v-for="i in 3" :key="i" class="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    </template>

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
