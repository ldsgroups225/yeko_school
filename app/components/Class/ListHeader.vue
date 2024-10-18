<script setup lang="ts">
import type { IClassDTO } from '~~/utils/validators'

const props = defineProps<{
  selectedYear: string
  classes?: IClassDTO[]
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
      <ClassDataManager :classes="classes" />

      <UTooltip text="Nouvelle classe" :popper="{ placement: 'bottom' }">
        <UButton variant="outline" icon="i-carbon-building" class="ml-4" @click="emit('openCreateOrUpdateClassModal')" />
      </UTooltip>
      <USelectMenu v-model="selectedYear" :options="yearOptions" />
    </div>
  </div>
</template>
