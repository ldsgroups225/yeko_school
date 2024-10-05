<script lang="ts" setup>
definePageMeta({
  layout: 'auth',
  middleware: ['un-auth'],
})

const router = useRouter()
</script>

<template>
  <main class="px-4 py-10 text-center text-teal-700 dark:text-gray-200">
    <div text-4xl>
      <div i-carbon-warning inline-block />
    </div>
    <div>Not found</div>
    <div>
      <button class="btn m-3 mt-8 text-sm" @click="router.back()">
        Back
      </button>
    </div>
  </main>
</template>
