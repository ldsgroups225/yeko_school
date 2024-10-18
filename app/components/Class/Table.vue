<script setup lang="ts">
import type { IClassDTO } from '~~/utils/validators'
import type { CLASS_COLUMNS } from '~/constants'

defineProps<{
  rows: IClassDTO[]
  columns: typeof CLASS_COLUMNS
  loading: boolean
  pageFrom: number
}>()

const emit = defineEmits<{
  (e: 'update:selectedRows', value: IClassDTO[]): void
  (e: 'update:sort', value: { column: string, direction: 'asc' | 'desc' } | null): void
  (e: 'showCreateOrUpdateModal', value: IClassDTO): void
  (e: 'select', value: IClassDTO): void
}>()
const selectedRows = defineModel<IClassDTO[]>('selectedRows', { default: [] })
const sort = defineModel<{ column: string, direction: 'asc' | 'desc' }>('sort')

function getActionItems(row: IClassDTO) {
  return [
    [
      {
        label: 'Voir',
        icon: 'i-heroicons-eye-20-solid',
        click: () => {
          throw new Error('View class details was not implemented yet')
        },
      },
      {
        label: 'Modifier',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => emit('showCreateOrUpdateModal', row),
      },
      {
        label: 'Supprimer',
        icon: 'i-heroicons-trash-20-solid',
        click: () => {
          throw new Error('Delete class was not implemented yet')
        },
      },
    ],
  ]
}
</script>

<template>
  <UTable
    v-model="selectedRows"
    v-model:sort="sort"
    :rows="rows"
    :columns="columns"
    :loading="loading"
    sort-asc-icon="i-heroicons-arrow-up"
    sort-desc-icon="i-heroicons-arrow-down"
    :ui="{
      td: { base: 'max-w-[0] truncate' },
      default: { checkbox: { color: 'primary' as any } },
    }"
    @select="emit('select', $event)"
  >
    <template #index-data="{ index }">
      {{ pageFrom + index }}
    </template>

    <template #mainTeacherId-data="{ row }">
      {{ row.mainTeacherName }}
    </template>

    <template #actions-data="{ row }">
      <UDropdown :items="getActionItems(row)">
        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
      </UDropdown>
    </template>
    <slot />
  </UTable>
</template>
