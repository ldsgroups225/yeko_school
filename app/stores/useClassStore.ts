/**
 * @file classStore.ts
 * @description Defines and exports the class store for managing class data and operations.
 */
import type { IClassFiltersDTO } from '~~/types'
import type { IClassDTO, IUpdateClassDTO } from '~~/utils/validators'
import { defineStore } from 'pinia'

/**
 * @interface ClassState
 * @description Represents the full state of the class store.
 */
interface ClassState {
  /** @property {IClassDTO[]} classes - Array of class data. */
  classes: IClassDTO[]
  /** @property {IClassDTO | null} currentClass - Currently selected class. */
  currentClass: IClassDTO | null
  /** @property {boolean} isLoading - Loading state flag. */
  isLoading: boolean
  /** @property {string | null} error - Error message, if any. */
  error: string | null
}

interface ResponseType { success: boolean, message: any, data: IClassDTO | null }

/**
 * @constant
 * @name useClassStore
 * @type {Store<'class', ClassState>}
 * @description Defines and exports the class store.
 */
export const useClassStore = defineStore('class', {
  /**
   * @function state
   * @description Defines the initial state of the class store.
   * @returns {ClassState} The initial class state.
   */
  state: (): ClassState => ({
    classes: [],
    currentClass: null,
    isLoading: false,
    error: null,
  }),

  actions: {
    /**
     * @async
     * @function fetchClasses
     * @description Fetches classes based on optional filters.
     * @param {IClassFiltersDTO} [filters] - Optional filters for the class query.
     */
    async fetchClasses(filters?: IClassFiltersDTO) {
      this.isLoading = true
      this.error = null

      const { userData } = useUserStore()

      const _filterByUserSchool = { ...filters, schoolId: userData?.school?.id }

      const { data, status, error } = await useFetch<{ success: boolean, data: IClassDTO[] }>('/api/classes', {
        query: _filterByUserSchool,
      })

      if (error.value) {
        this.error = error.value.message || 'An error occurred while fetching classes'
        console.error('Error fetching classes:', error.value)
      }
      else if (data.value && data.value.success) {
        this.classes = data.value.data
      }

      this.isLoading = status.value === 'pending'
    },

    /**
     * @async
     * @function fetchClassById
     * @description Fetches a single class by their ID.
     * @param {string} id - The ID of the class to fetch.
     */
    async fetchClassById(id: string) {
      this.isLoading = true
      this.error = null

      const { data, status, error } = await useFetch<{ success: boolean, data: IClassDTO }>(`/api/classes/${id}`)

      if (error.value) {
        this.error = error.value.message || `An error occurred while fetching class with ID ${id}`
        console.error('Error fetching class:', error.value)
      }
      else if (data.value && data.value.success) {
        this.currentClass = data.value.data
      }

      this.isLoading = status.value === 'pending'
    },

    /**
     * @async
     * @function createClass
     * @description Creates a new class.
     * @param {IClassDTO} classData - The data for the new class.
     * @returns {Promise<boolean>} True if the class was created successfully, false otherwise.
     */
    async createClass(classData: IClassDTO): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const { success, message, data } = await $fetch<ResponseType>('/api/classes', {
          method: 'POST',
          body: classData,
        })

        if (!success) {
          this.error = message.message || 'An error occurred while creating the class'
          return false
        }
        else if (success) {
          this.classes.push(data)
          this.classes = this.classes.sort((a, b) => a.gradeId - b.gradeId).sort((a, b) => a.name.localeCompare(b.name))
          return true
        }
        else {
          this.error = 'An unknown error occurred while creating the class.'
          return false
        }
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
     * @async
     * @function updateClass
     * @description Updates an existing class.
     * @param {string} id - The ID of the class to update.
     * @param {IUpdateClassDTO} classData - The data for the updated class.
     * @returns {Promise<boolean>} True if the class was updated successfully, false otherwise.
     */
    async updateClass(id: string, classData: IUpdateClassDTO): Promise<boolean> {
      this.isLoading = true
      this.error = null

      try {
        const { success, message, data } = await $fetch<ResponseType>(`/api/classes/${id}`, {
          method: 'PATCH',
          body: classData,
        })

        if (!success) {
          this.error = message.message || `An error occurred while updating class with ID ${id}`
          return false
        }
        else if (success) {
          const index = this.classes.findIndex(c => c.id === id)
          if (index !== -1) {
            this.classes[index] = data
          }
          return true
        }
        else {
          this.error = `An unknown error occurred while updating class with ID ${id}`
          return false
        }
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
     * @function clearCurrentClass
     * @description Clears the currently selected class.
     */
    clearCurrentClass() {
      this.currentClass = null
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
