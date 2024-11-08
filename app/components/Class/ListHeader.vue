<script setup lang="ts">
import type { IClassDTO } from '~~/types'
import type { ICreateClassDTO } from '~~/utils/validators'

const props = defineProps<{
  selectedYear: string
  classes?: IClassDTO[]
  yearOptions: { label: string, value: string }[]
}>()

const emit = defineEmits(['openCreateOrUpdateClassModal'])

const selectedYear = toRef(props, 'selectedYear')

function toCreateClassDTO(classData: IClassDTO): ICreateClassDTO {
  return {
    name: classData.name,
    gradeId: classData.gradeId!,
    schoolId: classData.schoolId!,
    mainTeacherName: classData.mainTeacherName!,
    id: classData.id,
    studentCount: classData.studentCount,
    mainTeacherId: classData.mainTeacherId,
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">
      Liste des classes de l'école
    </h2>
    <div class="flex items-center space-x-2">
      <ClassDataManager :classes="classes?.map(c => toCreateClassDTO(c))" />

      <UTooltip text="Nouvelle classe" :popper="{ placement: 'bottom' }">
        <UButton variant="outline" icon="i-carbon-building" class="ml-4" @click="emit('openCreateOrUpdateClassModal')" />
      </UTooltip>
      <USelectMenu v-model="selectedYear" :options="yearOptions" />
    </div>
  </div>
</template>
