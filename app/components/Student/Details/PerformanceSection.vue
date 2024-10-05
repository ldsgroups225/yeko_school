<script setup lang="ts">
import type { IStudentDTO } from '~~/types'
import { formatDate } from '~~/utils/dateTime'
import { getGradeColor } from '~~/utils/studentHelpers'

defineProps<{
  student: IStudentDTO | null
  isLoading: boolean
}>()
</script>

<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
      Performance
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Participation en classe
          </h3>
        </template>
        <USkeleton v-if="isLoading" class="h-64 w-full" />
        <UTable
          v-else
          :columns="[
            { key: 'date', label: 'Date' },
            { key: 'subjectName', label: 'Matière' },
            { key: 'note', label: 'Note' },
          ]" :rows="student?.participations || []"
        >
          <template #date-data="{ row }">
            {{ formatDate(row.date) }}
          </template>
          <template #note-data="{ row }">
            <UBadge :color="getGradeColor(row.note)">
              {{ row.note }}
            </UBadge>
          </template>
        </UTable>
      </UCard>
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Notes des interrogations/devoirs
          </h3>
        </template>
        <USkeleton v-if="isLoading" class="h-64 w-full" />
        <UTable
          v-else
          :columns="[
            { key: 'date', label: 'Date' },
            { key: 'subjectName', label: 'Matière' },
            { key: 'note', label: 'Note' },
          ]" :rows="student?.controlNotes || []"
        >
          <template #date-data="{ row }">
            {{ formatDate(row.date) }}
          </template>
          <template #note-data="{ row }">
            <UBadge :color="getGradeColor(row.note)">
              {{ row.note }}
            </UBadge>
          </template>
        </UTable>
      </UCard>
    </div>
  </div>
</template>
