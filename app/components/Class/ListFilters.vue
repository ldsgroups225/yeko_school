<script setup lang="ts">
const emit = defineEmits<{
  (e: 'update:searchTerm', value: string): void
}>()

const searchTerm = defineModel<string>()
</script>

<template>
  <div class="flex items-center justify-between gap-3 px-4 py-3">
    <UInput
      v-model="searchTerm"
      icon="i-heroicons-magnifying-glass-20-solid"
      placeholder="Rechercher une classe..."
      @update:model-value="(value) => emit('update:searchTerm', value)"
    />
  </div>
</template>
