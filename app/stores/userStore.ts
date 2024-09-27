/**
 * @file userStore.ts
 * @description Defines and exports the user store for managing user authentication and data.
 */

import type { IUserProfileDTO } from '~~/types'
import { defineStore } from 'pinia'

/**
 * @interface UserState
 * @description Represents the full state of the user store.
 */
interface UserState {
  userData: IUserProfileDTO | null
  isLoading: boolean
  error: string | null
}

/**
 * @interface LoginFormData
 * @description Represents the data required for user login.
 */
interface LoginFormData {
  /** @property {string} email - The user's email address. */
  email: string
  /** @property {string} password - The user's password. */
  password: string
  /** @property {boolean} [rememberMe] - Optional flag to remember the user's login. */
  rememberMe?: boolean
}

/**
 * @constant
 * @name useUserStore
 * @type {Store<'user', UserState>}
 * @description Defines and exports the user store.
 */
export const useUserStore = defineStore('user', {
  /**
   * @function state
   * @description Defines the initial state of the user store.
   * @returns {UserState} The initial user state.
   */
  state: (): UserState => ({
    userData: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    /**
     * @function isAuthenticated
     * @description Determines if the user is authenticated.
     * @returns {boolean} True if the user is authenticated, false otherwise.
     */
    isAuthenticated(): boolean {
      return !!this.userData?.id
    },
  },

  actions: {
    /**
     * @async
     * @function login
     * @description Attempts to log in the user with the provided credentials.
     * @param {LoginFormData} credentials - The user's login credentials.
     * @throws {Error} If login fails or an error occurs during the process.
     */
    async login(credentials: LoginFormData) {
      this.isLoading = true
      this.error = null
      try {
        const { data, error } = await useFetch<{ success: boolean }>('/api/auth/login', {
          method: 'POST',
          body: credentials,
        })
        if (error.value) {
          throw createError(error.value)
        }
        if (data.value && data.value.success) {
          // If login is successful, fetch user data
          await this.fetchUserData()
        }
        else {
          throw new Error('Login failed')
        }
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'An unknown error occurred'
        console.error('Error during login:', error)
      }
      finally {
        this.isLoading = false
      }
    },

    /**
     * @async
     * @function fetchUserData
     * @description Fetches the user's data from the server and updates the store.
     * @throws {Error} If fetching user data fails or an error occurs during the process.
     */
    async fetchUserData() {
      this.isLoading = true
      this.error = null
      try {
        const { data, success } = await $fetch('/api/auth/me')

        if (success) {
          this.userData = data
        }
        else {
          throw new Error('Failed to fetch user data')
        }
      }
      catch (error) {
        this.error = error instanceof Error ? error.message : 'An unknown error occurred'
        console.error('Error fetching user data:', error)
      }
      finally {
        this.isLoading = false
      }
    },

    /**
     * @function clearUserData
     * @description Resets the user store to its initial state.
     */
    clearUserData() {
      this.$reset()
    },

    /**
     * @async
     * @function logout
     * @description Logs out the user and clears the user data.
     * @todo Implement logout logic (e.g., call a logout API endpoint).
     */
    async logout() {
      // Implement logout logic here (e.g., call a logout API endpoint)
      // Then clear the user data
      this.clearUserData()
    },
  },
})
