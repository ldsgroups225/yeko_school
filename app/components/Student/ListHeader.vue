<script setup lang="ts">
const props = defineProps<{
  selectedYear: string
  yearOptions: { label: string, value: string }[]
}>()

const selectedYear = toRef(props, 'selectedYear')
</script>

<template>
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">
      Liste des étudiants
    </h2>
    <div class="flex items-center space-x-2">
      <UButton variant="outline" icon="i-heroicons-users" />
      <USelectMenu v-model="selectedYear" :options="yearOptions" />
    </div>
  </div>
</template>
