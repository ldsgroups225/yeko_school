/**
 * @file studentStore.ts
 * @description Defines and exports the student store for managing student data and operations.
 */

import type { IStudentDTO, IStudentFiltersDTO } from '~~/types'
import type { Database } from '~~/types/database.types'
import type { IEditingStudentDTO } from '~~/utils/validators'
import { defineStore } from 'pinia'

/**
 * @interface StudentState
 * @description Represents the full state of the student store.
 */
interface StudentState {
  /** @property {IStudentDTO[]} students - Array of student data. */
  students: IStudentDTO[]
  /** @property {IStudentDTO | null} currentStudent - Currently selected student. */
  currentStudent: IStudentDTO | null
  /** @property {boolean} isLoading - Loading state flag. */
  isLoading: boolean
  /** @property {string | null} error - Error message, if any. */
  error: string | null
}

/**
 * @interface LinkStudentParentData
 * @description Represents the data needed to link a student and parent.
 */
interface LinkStudentParentData {
  /** @property {string} studentId - The ID of the student to be linked. */
  studentId: string
  /** @property {string} otp - The one-time password for linking. */
  otp: string
}

/**
 * @constant
 * @name useStudentStore
 * @type {Store<'student', StudentState>}
 * @description Defines and exports the student store.
 */
export const useStudentStore = defineStore('student', {
  /**
   * @function state
   * @description Defines the initial state of the student store.
   * @returns {StudentState} The initial student state.
   */
  state: (): StudentState => ({
    students: [],
    currentStudent: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    /**
     * @function getStudentById
     * @description Retrieves a student by their ID.
     * @returns {(id: string) => IStudentDTO | undefined} Function to get a student by ID.
     */
    getStudentById: (state) => {
      /**
       * @param {string} id - The ID of the student to retrieve.
       * @returns {IStudentDTO | undefined} The student with the given ID, or undefined if not found.
       */
      return (id: string) => {
        return state.students.find(student => student.id === id)
      }
    },
  },

  actions: {
    /**
     * @function updateLocalStudentList
     * @description Updates the local student list and the current student if applicable.
     * @param {Partial<IStudentDTO>} updatedStudentData - The updated student data (partial).
     */
    updateLocalStudentList(updatedStudentData: Partial<IStudentDTO>) {
      if (!updatedStudentData.id) {
        console.error('Student ID is required for updating local student list')
        return
      }

      const index = this.students.findIndex(s => s.id === updatedStudentData.id)
      const isCreation = index === -1

      if (isCreation) {
        this.students.push(updatedStudentData as any)
      }
      else {
        this.students[index] = { ...this.students[index], ...updatedStudentData } as any
        if (this.currentStudent && this.currentStudent.id === updatedStudentData.id) {
          this.currentStudent = { ...this.currentStudent, ...updatedStudentData }
        }
      }
    },

    /**
     * @async
     * @function fetchStudents
     * @description Fetches students based on optional filters.
     * @param {IStudentFiltersDTO} [filters] - Optional filters for the student query.
     */
    async fetchStudents(filters?: IStudentFiltersDTO) {
      this.isLoading = true
      this.error = null

      const { userData } = useUserStore()

      const _filterByUserSchool = { ...filters, schoolId: userData?.school?.id }

      const { data, status, error } = await useFetch<{ success: boolean, data: IStudentDTO[] }>('/api/students', {
        query: _filterByUserSchool,
      })

      if (error.value) {
        this.error = error.value.message || 'An error occurred while fetching students'
        console.error('Error fetching students:', error.value)
      }
      else if (data.value && data.value.success) {
        this.students = data.value.data
      }

      this.isLoading = status.value === 'pending'
    },

    /**
     * @async
     * @function fetchStudentById
     * @description Fetches a single student by their ID.
     * @param {string} id - The ID of the student to fetch.
     */
    async fetchStudentById(id: string) {
      this.isLoading = true
      this.error = null

      const { data, status, error } = await useFetch<{ success: boolean, data: IStudentDTO }>(`/api/students/${id}`)

      if (error.value) {
        this.error = error.value.message || `An error occurred while fetching student with ID ${id}`
        console.error('Error fetching student:', error.value)
      }
      else if (data.value && data.value.success) {
        this.currentStudent = data.value.data
      }

      this.isLoading = status.value === 'pending'
    },

    /**
     * @async
     * @function updateStudent
     * @description Updates a student's information.
     * @param {string} id - The ID of the student to update.
     * @param {Partial<IStudentDTO>} studentData - The data to update for the student.
     */
    async updateStudent(id: string, studentData: Partial<IEditingStudentDTO>) {
      this.isLoading = true
      this.error = null

      try {
        const { success, message, data: updatedStudent } = await $fetch<{ success: boolean, message: any, data: IStudentDTO }>(`/api/students/${id}`, {
          method: 'PATCH',
          body: studentData,
        })

        if (!success) {
          this.error = message.message || 'An error occurred while linking student and parent'
          return false
        }

        if (success) {
          this.updateLocalStudentList(updatedStudent)
          return true
        }
        else {
          this.error = message.message || 'Failed to link student and parent'
          return false
        }
      }
      catch (e) {
        const _e = e
        this.error = 'An unexpected error occurred'
        return false
      }
      finally {
        this.isLoading = false
      }
    },

    /**
     * @async
     * @function createStudent
     * @description Creates a new student.
     * @param {Omit<IStudentDTO, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>} studentData - The data for the new student.
     */
    async createStudent(studentData: Omit<IStudentDTO, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) {
      this.isLoading = true
      this.error = null

      const { data, status, error } = await useFetch<{ success: boolean, data: IStudentDTO }>('/api/students', {
        method: 'POST',
        body: studentData,
      })

      if (error.value) {
        this.error = error.value.message || 'An error occurred while creating the student'
        console.error('Error creating student:', error.value)
      }
      else if (data.value && data.value.success) {
        this.updateLocalStudentList(data.value.data)
      }

      this.isLoading = status.value === 'pending'
    },

    /**
     * @async
     * @function linkStudentAndParent
     * @description Links a student to a parent using the provided OTP.
     * @param {LinkStudentParentData} linkData - The data for linking student and parent.
     * @returns {Promise<boolean>} A promise that resolves to true if linking was successful, false otherwise.
     */
    async linkStudentAndParent(linkData: LinkStudentParentData) {
      this.isLoading = true
      this.error = null

      try {
        const { success, message } = await $fetch<{ success: boolean, message: any }>('/api/students/link-student-and-parent', {
          method: 'PATCH',
          body: linkData,
        })

        if (!success) {
          this.error = message.message || 'An error occurred while linking student and parent'
          return false
        }

        if (success) {
          // If the linking was successful, we might want to refresh the student data
          await this.fetchStudentById(linkData.studentId)
          return true
        }
        else {
          this.error = message.message || 'Failed to link student and parent'
          return false
        }
      }
      catch (e) {
        const _e = e
        this.error = 'An unexpected error occurred'
        return false
      }
      finally {
        this.isLoading = false
      }
    },

    async removeStudentsFromClass({ students }: { students: IStudentDTO[] }): Promise<boolean> {
      this.isLoading = true
      this.error = null

      const supabase = useSupabaseClient<Database>()

      try {
        const { error } = await supabase.from('students').update({ class_id: null }).in('id', students.map(s => s.id))

        if (error) {
          this.error = error.message || 'Erreur lors du retrait des élèves de la classe'
          return false
        }

        // If the linking was successful, we might want to refresh the student data
        for (const std of students) {
          this.updateLocalStudentList({ id: std.id, classId: null, className: null })
        }

        return true
      }
      catch (e) {
        this.error = `An unexpected error occurred: ${e}`
        return false
      }
      finally {
        this.isLoading = false
      }
    },

    async removeStudentsFromSchool({ students }: { students: IStudentDTO[] }): Promise<boolean> {
      this.isLoading = true
      this.error = null

      const supabase = useSupabaseClient<Database>()

      try {
        const { error } = await supabase.from('students').update({ school_id: null, class_id: null }).in('id', students.map(s => s.id))

        if (error) {
          this.error = error.message || 'Erreur lors du retrait des élèves de l\'école'
          return false
        }

        // If the linking was successful, we might want to refresh the student data
        for (const std of students) {
          this.updateLocalStudentList({ id: std.id, schoolId: null, classId: null, className: null })
        }

        return true
      }
      catch (e) {
        this.error = `An unexpected error occurred: ${e}`
        return false
      }
      finally {
        this.isLoading = false
      }
    },

    /**
     * @function clearCurrentStudent
     * @description Clears the currently selected student.
     */
    clearCurrentStudent() {
      this.currentStudent = null
    },

    /**
     * @function clearError
     * @description Clears any error message in the store.
     */
    clearError() {
      this.error = null
    },
  },
})
