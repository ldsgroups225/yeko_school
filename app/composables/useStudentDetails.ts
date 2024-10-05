import type { IStudentEditingDTO } from '~~/types'
import { formatFullName } from '~~/utils/formatting'
import {
  calculateAttendancePercentage,
  calculateParticipationAverage,
  getAttendanceStats,
  getOverallPerformance,
} from '~~/utils/studentHelpers'

export function useStudentDetails(studentId: string) {
  const studentStore = useStudentStore()
  const { fetchStudentById, updateStudent } = studentStore
  const { currentStudent, isLoading, error } = storeToRefs(studentStore)
  const activeSection = ref('overview')
  const isEditModalOpen = ref(false)
  const isUpdating = ref(false)

  const editForm = ref<IStudentEditingDTO>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'M',
    address: '',
  })

  const fullName = computed(() =>
    currentStudent.value ? formatFullName(currentStudent.value.firstName, currentStudent.value.lastName) : '',
  )

  const attendanceStats = computed(() =>
    currentStudent.value?.attendances ? getAttendanceStats(currentStudent.value.attendances) : { present: 0, absent: 0, late: 0 },
  )

  const participationAverage = computed(() =>
    currentStudent.value?.participations ? calculateParticipationAverage(currentStudent.value.participations) : 0,
  )

  const controlNoteAverage = computed(() =>
    currentStudent.value?.controlNoteAverage?.toFixed(2) || 'N/A',
  )

  const attendancePercentage = computed(() =>
    calculateAttendancePercentage(attendanceStats.value),
  )

  const overallPerformance = computed(() =>
    getOverallPerformance(participationAverage.value, currentStudent.value?.controlNoteAverage || null),
  )

  async function fetchStudentData() {
    await fetchStudentById(studentId)
  }

  function populateEditForm() {
    if (currentStudent.value) {
      editForm.value = {
        firstName: currentStudent.value.firstName,
        lastName: currentStudent.value.lastName,
        dateOfBirth: currentStudent.value.dateOfBirth || '',
        gender: currentStudent.value.gender,
        address: currentStudent.value.address || '',
      }
    }
  }

  async function handleUpdateStudent() {
    if (currentStudent.value) {
      isUpdating.value = true
      try {
        await updateStudent(currentStudent.value.id, editForm.value)
        isEditModalOpen.value = false
        // Optional: Add success notification
      }
      catch (error) {
        console.error('Error updating student:', error)
        // Optional: Add error notification
      }
      finally {
        isUpdating.value = false
      }
    }
  }

  return {
    currentStudent,
    isLoading,
    error,
    activeSection,
    isEditModalOpen,
    isUpdating,
    editForm,
    fullName,
    attendanceStats,
    participationAverage,
    controlNoteAverage,
    attendancePercentage,
    overallPerformance,
    fetchStudentData,
    populateEditForm,
    handleUpdateStudent,
  }
}
