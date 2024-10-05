<script setup lang="ts">
import type { IStudentDTO } from '~~/types'
import { formatDate, getAge } from '~~/utils/dateTime'
import { formatFullName, formatPhoneNumber } from '~~/utils/formatting'

defineProps<{
  student: IStudentDTO | null
  isLoading: boolean
}>()

function getBirthDay(date?: string | null) {
  if (!date)
    return null

  return `${formatDate(date)} (${getAge(date)} ans)`
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
      Informations personnelles
    </h2>
    <UCard>
      <div class="grid grid-cols-2 gap-4">
        <StudentDetailsInfo label="Date de naissance" :value="getBirthDay(student?.dateOfBirth)" :is-loading="isLoading" />
        <StudentDetailsInfo label="Genre" :value="student?.gender === 'M' ? 'Masculin' : 'Féminin'" :is-loading="isLoading" />
        <StudentDetailsInfo label="Adresse" :value="student?.address" :is-loading="isLoading" />
      </div>
    </UCard>
    <h3 class="text-xl font-semibold mt-6 mb-4 text-gray-900 dark:text-white">
      Information du parent
    </h3>
    <UCard v-if="student?.parent">
      <div class="grid grid-cols-2 gap-4">
        <StudentDetailsInfo label="Nom" :value="formatFullName(student.parent.firstName, student.parent.lastName)" :is-loading="isLoading" />
        <StudentDetailsInfo label="Email" :value="student.parent.email" :is-loading="isLoading" />
        <StudentDetailsInfo label="Téléphone" :value="formatPhoneNumber(student.parent.phoneNumber)" :is-loading="isLoading" />
      </div>
    </UCard>
    <p v-else class="text-red-500">
      Aucune information sur le parent disponible
    </p>
  </div>
</template>
