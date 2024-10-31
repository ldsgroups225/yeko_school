<script setup lang="ts">
// Generate times from 07:00 to 18:00
const times = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 7
  return `${String(hour).padStart(2, '0')}:00`
})
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="h-14" /> <!-- Header spacing -->
    <div
      v-for="time in times"
      :key="time"
      class="h-20 relative"
    >
      <span class="absolute -top-3 text-xs text-gray-500 dark:text-gray-400">
        {{ time }}
      </span>
      <div class="w-full h-px bg-gray-300 dark:bg-gray-700" />
    </div>
  </div>
</template>
