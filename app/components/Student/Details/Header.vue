<script setup lang="ts">
import type { IStudentDTO } from '~~/types'
import { formatFullName } from '~~/utils/formatting'

defineProps<{
  student: IStudentDTO | null
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'edit'): void
}>()
</script>

<template>
  <div class="mb-6 flex justify-between items-center">
    <div class="flex items-center space-x-4">
      <USkeleton v-if="isLoading" class="h-24 w-24" :ui="{ rounded: 'rounded-full' }" />
      <UAvatar v-else-if="student" :src="student.avatarUrl || ''" :alt="formatFullName(student.firstName, student.lastName)" size="3xl" />
      <div>
        <USkeleton v-if="isLoading" class="h-8 w-64 mb-2" />
        <h1 v-else-if="student" class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ formatFullName(student.firstName, student.lastName) }}
        </h1>
        <USkeleton v-if="isLoading" class="h-5 w-48" />
        <p v-else-if="student" class="text-lg text-gray-600 dark:text-gray-300">
          Matricule: {{ student.idNumber }}
          <UBadge v-if="student.classroomName" color="primary" class="ml-2">
            {{ student.classroomName }}
          </UBadge>
        </p>
      </div>
    </div>
    <UButton color="primary" icon="i-heroicons-pencil" :disabled="isLoading" @click="emit('edit')">
      Modifier le profil
    </UButton>
  </div>
</template>
