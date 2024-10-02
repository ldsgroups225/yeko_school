export function useCsModal<T>() {
  const isOpen = ref(false)
  const selectedStudent = ref<T | null>(null)

  function openModal(student: T) {
    selectedStudent.value = student
    isOpen.value = true
  }

  function closeModal() {
    isOpen.value = false
    selectedStudent.value = null
  }

  return {
    isOpen,
    selectedStudent,
    openModal,
    closeModal,
  }
}
