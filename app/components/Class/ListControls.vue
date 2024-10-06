<script setup lang="ts">
import { CLASS_COLUMNS } from '~/constants'

defineProps<{
  itemsPerPage: number
  selectedRowsCount: number
  searchTerm: string
  hasNotMainTeacherActive: boolean
}>()

const emit = defineEmits<{
  (e: 'update:itemsPerPage', value: number): void
  (e: 'update:selectedColumns', value: typeof CLASS_COLUMNS): void
  (e: 'resetFilters'): void
  (e: 'hasNotMainTeacherFilter'): void
}>()

const selectedColumns = defineModel<typeof CLASS_COLUMNS>('selectedColumns', { default: CLASS_COLUMNS })
</script>

<template>
  <div class="flex justify-between items-center w-full px-4 py-3">
    <div class="flex items-center gap-1.5">
      <span class="text-sm leading-5">Lignes par page:</span>
      <USelect
        :model-value="parseInt(itemsPerPage.toString(), 10)"
        :options="[5, 10, 20, 30, 50]"
        class="me-2 w-20"
        size="xs"
        @update:model-value="(value) => emit('update:itemsPerPage', parseInt(value, 10))"
      />
    </div>
    <div class="flex gap-1.5 items-center">
      <UButton leading-icon="i-carbon-user-favorite" trailing :color="!hasNotMainTeacherActive ? 'black' : 'blue'" variant="outline" size="xs" label="Pas de Prof Principal" @click="emit('hasNotMainTeacherFilter')" />

      <UDropdown v-if="selectedRowsCount > 1" :items="[]">
        <UButton
          icon="i-heroicons-chevron-down"
          trailing
          color="gray"
          size="xs"
        >
          Actions groupées
        </UButton>
      </UDropdown>
      <USelectMenu
        v-model="selectedColumns"
        :options="CLASS_COLUMNS"
        multiple
        @update:model-value="(value) => emit('update:selectedColumns', value)"
      >
        <UButton
          icon="i-heroicons-view-columns"
          color="gray"
          size="xs"
        >
          Colonnes
        </UButton>
      </USelectMenu>
      <UButton
        icon="i-heroicons-funnel"
        color="gray"
        size="xs"
        :disabled="searchTerm === ''"
        @click="emit('resetFilters')"
      >
        Réinitialiser
      </UButton>
    </div>
  </div>
</template>
