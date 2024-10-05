<script setup lang="ts">
import type { IStudentDTO } from '~~/types'
import { formatDate } from '~~/utils/dateTime'

defineProps<{
  student: IStudentDTO | null
  isLoading: boolean
}>()
</script>

<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
      Parcours académique
    </h2>
    <UCard>
      <div class="grid grid-cols-2 gap-4">
        <StudentDetailsInfo label="Classe actuelle" :value="student?.className" :is-loading="isLoading" />
        <StudentDetailsInfo label="Année scolaire" value="2023-2024" :is-loading="isLoading" />
        <StudentDetailsInfo label="Date d'inscription" :value="student?.createdAt ? formatDate(student.createdAt) : null" :is-loading="isLoading" />
      </div>
    </UCard>
  </div>
</template>
