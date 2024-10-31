<script setup lang="ts">
import type { IStudentImportDTO } from '~~/utils/validators'
import { formatDate } from '~~/utils/dateTime'

const router = useRouter()

const toast = useToast()

const { students } = useStudentStore()
const { exportToCsv } = useDataExport()

function handleExport() {
  const studentsExportFormated = students.map((student) => {
    return {
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender,
      idNumber: student.idNumber,
      address: student.address,
      avatarUrl: student.avatarUrl,
      classroomName: student.classroomName,
      dateOfBirth: student.dateOfBirth ? formatDate(student.dateOfBirth) : null,
    } satisfies IStudentImportDTO
  })
  const result = exportToCsv(studentsExportFormated, 'students')
  if (!result.success) {
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de l\'exportation des données',
      color: 'red',
      timeout: 7000,
    })
  }
  else {
    toast.add({
      title: 'Succès',
      description: 'Les données ont été exportées avec succès',
      color: 'emerald',
    })
  }
}
</script>

<template>
  <div class="flex space-x-2">
    <UTooltip text="Exporter les données" :popper="{ placement: 'bottom' }">
      <UButton variant="soft" icon="i-clarity-upload-cloud-line" @click="handleExport" />
    </UTooltip>
    <UTooltip text="Importer les données" :popper="{ placement: 'bottom' }">
      <UButton variant="soft" icon="i-clarity-download-line" @click="router.push('/students/upload')" />
    </UTooltip>
  </div>
</template>
