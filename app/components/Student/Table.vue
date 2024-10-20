<script setup lang="ts">
import type { IStudentDTO } from '~~/types'
import { getAge } from '~~/utils/dateTime.js'
import { formatFullName } from '~~/utils/formatting'
import type { STUDENT_COLUMNS } from '~/constants'

defineProps<{
  rows: IStudentDTO[]
  columns: typeof STUDENT_COLUMNS
  loading: boolean
  pageFrom: number
}>()

const emit = defineEmits<{
  (e: 'update:selectedRows', value: IStudentDTO[]): void
  (e: 'update:sort', value: { column: string, direction: 'asc' | 'desc' } | null): void
  (e: 'select', value: IStudentDTO): void
  (e: 'showLinkModal', value: { id: string, name: string }): void
  (e: 'showUpdateModal', value: IStudentDTO): void
  (e: 'removeFromClass', value: string): void
  (e: 'removeFromSchool', value: string): void
  (e: 'showAssignClassModal', value: string): void
}>()
const selectedRows = defineModel<IStudentDTO[]>('selectedRows', { default: [] })
const sort = defineModel<{ column: string, direction: 'asc' | 'desc' }>('sort')

function getActionItems(row: IStudentDTO) {
  return [
    [
      {
        label: 'Voir',
        icon: 'i-heroicons-eye-20-solid',
        click: () => navigateTo(`/students/${row.idNumber}`),
      },
      {
        label: 'Modifier',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => {
          emit('select', row)
          emit('showUpdateModal', row)
        },
      },
      {
        label: 'Attribuer à une classe',
        slot: 'assign-class',
      },
      {
        label: 'Lier à son parent',
        icon: 'i-heroicons-link-20-solid',
        click: () => {
          emit('select', row)
          emit('showLinkModal', {
            id: row.id,
            name: formatFullName(row.firstName, row.lastName),
          })
        },
      },
      {
        label: 'Retirer',
        slot: 'remove-student',
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

    <template #age-data="{ row }">
      {{ getAge(row.dateOfBirth) }}
    </template>

    <template #actions-data="{ row }">
      <UDropdown :items="getActionItems(row)">
        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />

        <template #assign-class>
          <UButton
            color="gray"
            variant="ghost"
            label="Attribuer à une classe"
            class="w-full"
            icon="i-heroicons-link-20-solid"
            :padded="false"
            :ui="{ color: { gray: { ghost: 'text-gray-700 dark:text-gray-300' } } }"
            @click="emit('showAssignClassModal', row.id)"
          />
        </template>

        <template #remove-student>
          <div class="group">
            <UButton color="red" variant="ghost" label="Danger" class="w-full" />

            <div mode="hover" class="w-full hidden group-hover:flex">
              <div class="flex p-4 flex-col rounded-md mt-1 gap-2 group-hover:bg-red-600/10">
                <UButton color="red" variant="ghost" label="Retirer de la classe" class="w-full" @click="emit('removeFromClass', row.id)" />
                <UButton color="red" variant="ghost" label="Retirer de l'école" class="w-full" @click="emit('removeFromSchool', row.id)" />
              </div>
            </div>
          </div>
        </template>
      </UDropdown>
    </template>
    <slot />
  </UTable>
</template>
