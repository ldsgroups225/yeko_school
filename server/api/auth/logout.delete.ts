/**
 * Logout Handler
 * This module handles user logout.
 * @module LogoutHandler
 */
import { csServerSupabaseClient } from '~~/server/utils'

/**
 * The main handler for the /api/auth/logout endpoint.
 * Signs out the current user.
 *
 * @async
 * @function
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ success: boolean, message: string | null }>} A promise that resolves to an object indicating the success of the operation.
 * @throws {H3Error} If there's an error during the logout process.
 *
 * @example
 * // Assuming this is used in a Nuxt 3 API route
 * export default defineEventHandler(async (event) => {
 *   try {
 *     const result = await logoutHandler(event);
 *     return result;
 *   } catch (error) {
 *     console.error(error);
 *     return { success: false, message: error.message };
 *   }
 * });
 */
export default defineEventHandler(async (event) => {
  const client = await csServerSupabaseClient(event)

  try {
    const { error } = await client.auth.signOut()

    if (error) {
      console.error('[E_LOGOUT]', error)
      throw createError({
        statusCode: 500,
        message: 'Une erreur est survenue lors de la déconnexion',
      })
    }

    return {
      success: true,
      message: 'Déconnexion réussie',
    }
  }
  catch (error) {
    console.error('[E_LOGOUT]', error)
    return {
      success: false,
      message: error,
    }
  }
})
