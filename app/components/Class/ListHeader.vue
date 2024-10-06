<script setup lang="ts">
const props = defineProps<{
  selectedYear: string
  yearOptions: { label: string, value: string }[]
}>()

const emit = defineEmits(['openCreateOrUpdateClassModal'])

const selectedYear = toRef(props, 'selectedYear')
</script>

<template>
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">
      Liste des classes de l'école
    </h2>
    <div class="flex items-center space-x-2">
      <UTooltip text="Nouvelle classe" :shortcuts="['⌘', 'N']" :popper="{ placement: 'left' }">
        <UButton variant="outline" icon="i-carbon-building" @click="emit('openCreateOrUpdateClassModal')" />
      </UTooltip>
      <USelectMenu v-model="selectedYear" :options="yearOptions" />
    </div>
  </div>
</template>
