<script setup lang="ts">
// Route
const { params: { id: studentId } } = useRoute('students-id')

// Composables
const {
  currentStudent,
  isLoading,
  error,
  activeSection,
  isEditModalOpen,
  isUpdating,
  editForm,
  attendanceStats,
  participationAverage,
  controlNoteAverage,
  attendancePercentage,
  overallPerformance,
  fetchStudentData,
  populateEditForm,
  handleUpdateStudent,
} = useStudentDetails(studentId)

// Fetch student data
onMounted(async () => {
  await fetchStudentData()
})

watch(isEditModalOpen, (newValue) => {
  if (newValue) {
    populateEditForm()
  }
})

const navItems = [
  { key: 'overview', label: 'Vue d\'ensemble', icon: 'i-heroicons-chart-bar' },
  { key: 'personal', label: 'Informations personnelles', icon: 'i-heroicons-user' },
  { key: 'academic', label: 'Parcours académique', icon: 'i-heroicons-academic-cap' },
  { key: 'attendance', label: 'Ponctualité', icon: 'i-heroicons-clock' },
  { key: 'performance', label: 'Performance', icon: 'i-heroicons-chart-bar' },
]

function onChange(index: number) {
  const item = navItems[index]

  if (item && item.key !== activeSection.value)
    activeSection.value = item.key
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <UContainer>
      <UCard v-if="error" color="red" class="my-4">
        <p class="text-red-600 dark:text-red-400">
          {{ error }}
        </p>
      </UCard>

      <div v-else class="py-8">
        <StudentDetailsHeader
          :student="currentStudent"
          :is-loading="isLoading"
          @edit="isEditModalOpen = true"
        />

        <UTabs :items="navItems" class="mb-6" :disabled="isLoading" @change="onChange" />

        <div class="mt-6">
          <StudentDetailsOverviewSection
            v-if="activeSection === 'overview'"
            :student="currentStudent"
            :is-loading="isLoading"
            :attendance-stats="attendanceStats"
            :participation-average="participationAverage"
            :control-note-average="controlNoteAverage"
            :attendance-percentage="attendancePercentage"
            :overall-performance="overallPerformance"
          />

          <StudentDetailsPersonalInfoSection
            v-if="activeSection === 'personal'"
            :student="currentStudent"
            :is-loading="isLoading"
          />

          <StudentDetailsAcademicInfoSection
            v-if="activeSection === 'academic'"
            :student="currentStudent"
            :is-loading="isLoading"
          />

          <StudentDetailsAttendanceSection
            v-if="activeSection === 'attendance'"
            :student="currentStudent"
            :is-loading="isLoading"
            :attendance-stats="attendanceStats"
          />

          <StudentDetailsPerformanceSection
            v-if="activeSection === 'performance'"
            :student="currentStudent"
            :is-loading="isLoading"
          />
        </div>
      </div>

      <StudentDetailsEditStudentModal
        :is-open="isEditModalOpen"
        :student="editForm"
        :is-updating="isUpdating"
        @update="handleUpdateStudent"
        @close="isEditModalOpen = false"
      />
    </UContainer>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
