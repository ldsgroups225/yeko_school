import type { IStudentDTO } from '~~/types'

interface ILinkLinkStudentDTO {
  id: string
  name: string
}

type MaybeStudent = ILinkLinkStudentDTO | IStudentDTO | null

export function useCsModal<T extends MaybeStudent>() {
  const isOpen = ref(false)
  const selectedStudent = ref<T | null>(null)

  const isLinkModalOpen = computed(() =>
    isOpen.value && isLinkLinkStudentDTO(selectedStudent.value),
  )

  const isStudentModalOpen = computed(() =>
    isOpen.value && isEditingStudentDTO(selectedStudent.value),
  )

  function isLinkLinkStudentDTO(student: T | null): student is T & ILinkLinkStudentDTO {
    return (
      student !== null
      && 'id' in student
      && 'name' in student
      && typeof student.id === 'string'
      && typeof student.name === 'string'
    )
  }

  function isEditingStudentDTO(student: T | null): student is T & IStudentDTO {
    if (student === null)
      return false

    if (
      !('id' in student)
      || !('parentId' in student)
      || !('schoolId' in student)
      || !('classId' in student)
      || !('className' in student)
      || !('idNumber' in student)
      || !('firstName' in student)
      || !('lastName' in student)
      || !('gender' in student)
    ) {
      return false
    }

    const studentDTO = student as IStudentDTO

    if (studentDTO.gender !== 'M' && studentDTO.gender !== 'F')
      return false

    const requiredStringProps: (keyof IStudentDTO)[] = [
      'id',
      'parentId',
      'idNumber',
      'firstName',
      'lastName',
    ]

    const optionalStringProps: (keyof IStudentDTO)[] = [
      'schoolId',
      'classId',
      'className',
      'dateOfBirth',
      'address',
      'avatarUrl',
      'createdAt',
      'createdBy',
      'updatedAt',
      'updatedBy',
    ]

    if (!requiredStringProps.every(prop => typeof studentDTO[prop] === 'string')) {
      return false
    }

    if (!optionalStringProps.every(prop =>
      studentDTO[prop] === null || studentDTO[prop] === undefined || typeof studentDTO[prop] === 'string',
    )) {
      return false
    }

    if ('controlNoteAverage' in studentDTO
      && studentDTO.controlNoteAverage !== undefined
      && typeof studentDTO.controlNoteAverage !== 'number') {
      return false
    }

    return true
  }

  function openModal(student: T) {
    selectedStudent.value = student
    isOpen.value = true
  }

  function closeModal() {
    isOpen.value = false
    selectedStudent.value = null
  }

  return {
    selectedStudent,
    isLinkModalOpen,
    isStudentModalOpen,
    openModal,
    closeModal,
  }
}
