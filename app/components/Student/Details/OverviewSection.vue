<script setup lang="ts">
import type { IStudentDTO } from '~~/types'
import { getPerformanceColor } from '~~/utils/studentHelpers'

defineProps<{
  student: IStudentDTO | null
  isLoading: boolean
  attendanceStats: { present: number, absent: number, late: number }
  participationAverage: number
  controlNoteAverage: string | number
  attendancePercentage: string
  overallPerformance: string
}>()
</script>

<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
      Vue d'ensemble
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <UCard v-for="(item, index) in ['Ponctualité', 'Participation', 'Notes']" :key="index">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ item }}
            </h3>
            <UIcon :name="['i-heroicons-clock', 'i-heroicons-hand-raised', 'i-heroicons-academic-cap'][index] ?? 'i-heroicons-info'" class="text-primary-500 h-6 w-6" />
          </div>
        </template>
        <USkeleton v-if="isLoading" class="h-12 w-32 mb-2" />
        <p v-else class="text-3xl font-bold">
          {{ index === 0 ? `${attendanceStats.present} / ${attendanceStats.present + attendanceStats.absent + attendanceStats.late}`
            : index === 1 ? participationAverage
              : controlNoteAverage }}
        </p>
        <USkeleton v-if="isLoading" class="h-4 w-40" />
        <p v-else class="text-sm text-gray-500">
          {{ index === 0 ? `${attendancePercentage}% de présence`
            : index === 1 ? 'Moyenne de participation'
              : 'Moyenne générale' }}
        </p>
      </UCard>
    </div>
    <UCard v-if="student?.generatedDescriptionBasedOnPerformance">
      <template #header>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          Performance globale
        </h3>
      </template>
      <div class="flex items-center justify-between">
        <p class="text-lg text-gray-700 dark:text-gray-300">
          Évaluation générale:
        </p>
        <UBadge :color="getPerformanceColor(overallPerformance)" class="text-lg px-4 py-2">
          {{ overallPerformance }}
        </UBadge>
      </div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">
        {{ student.generatedDescriptionBasedOnPerformance }}
      </p>
    </UCard>
  </div>
</template>
