<script setup lang="ts">
import type { IStudentDTO } from '~~/types'
import { formatDate } from '~~/utils/dateTime'
import { getAttendanceColor } from '~~/utils/studentHelpers'

defineProps<{
  student: IStudentDTO | null
  isLoading: boolean
  attendanceStats: { present: number, absent: number, late: number }
}>()

function translateAttendanceToFrench(word: string) {
  switch (word) {
    case 'present':
      return 'Présent'
    case 'absent':
      return 'Absent'
    case 'late':
      return 'Retard'

    default:
      return 'Présent'
  }
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
      Ponctualité
    </h2>
    <UCard class="mb-6">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold text-green-600">
            {{ attendanceStats.present }}
          </p>
          <p class="text-sm text-gray-500">
            Présent
          </p>
        </div>
        <div>
          <p class="text-2xl font-bold text-red-600">
            {{ attendanceStats.absent }}
          </p>
          <p class="text-sm text-gray-500">
            Absent
          </p>
        </div>
        <div>
          <p class="text-2xl font-bold text-yellow-600">
            {{ attendanceStats.late }}
          </p>
          <p class="text-sm text-gray-500">
            En retard
          </p>
        </div>
      </div>
    </UCard>
    <UCard>
      <USkeleton v-if="isLoading" class="h-64 w-full" />
      <UTable
        v-else
        :columns="[
          { key: 'date', label: 'Date' },
          { key: 'status', label: 'Statut' },
        ]" :rows="student?.attendances || []"
      >
        <template #date-data="{ row }">
          Le {{ formatDate(row.date) }} de {{ row.from.substring(0, 5) }} à {{ row.to.substring(0, 5) }}
        </template>
        <template #status-data="{ row }">
          <UBadge :color="getAttendanceColor(row.status)" variant="subtle">
            {{ translateAttendanceToFrench(row.status) }}
          </UBadge>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
