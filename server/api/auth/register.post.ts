import { csServerSupabaseClient } from '~~/server/utils'
import { throwI18nErrorBasedOnCode } from '~~/utils/throwI18nErrorBasedOnCode'
import { type ITeacherForm, teacherFormSchema } from '~~/utils/validators'

/**
 * Validates and parses the login form data using the Zod schema.
 *
 * @param {unknown} formData - The raw form data to be validated.
 * @returns {Promise<ITeacherForm>} A promise that resolves to the validated and parsed login form data.
 *
 * @example
 * const rawFormData = { email: "user@example.com", password: "password123" };
 * try {
 *   const validatedData = await validateAndParseFormData(rawFormData);
 *   console.log(validatedData);
 * } catch (error) {
 *   console.error(error.statusCode, error.message);
 * }
 */
async function validateAndParseFormData(formData: unknown): Promise<ITeacherForm> {
  const result = teacherFormSchema.safeParse(formData)

  if (!result.success) {
    const errorMessages = result.error.errors.map(err => err.message).join(', ')
    throw createError({
      statusCode: 400,
      message: errorMessages,
    })
  }

  return result.data
}

/**
 * Main event handler for user login.
 *
 * This function validates the incoming form data, attempts to sign in the user
 * using Supabase authentication, and returns the user ID on success.
 *
 * @param {H3Event} event - The H3 event object containing the request details.
 * @returns {Promise<{ success: boolean; data: string | undefined }>} A promise that resolves to an object containing:
 *   - success: A boolean indicating whether the login was successful.
 *   - data: The user ID if login was successful, undefined otherwise.
 *
 * @example
 * // Assuming this is used in a Nuxt 3 API route
 * export default defineEventHandler(async (event) => {
 *   try {
 *     const result = await loginHandler(event);
 *     return result;
 *   } catch (error) {
 *     console.error(error);
 *     return { success: false, error: error.message };
 *   }
 * });
 */
export default defineEventHandler(async (event) => {
  try {
    const formData = await readBody(event)
    const { email, password, phone, firstName, lastName } = await validateAndParseFormData(formData)

    const client = await csServerSupabaseClient(event)
    const { error } = await client.auth.signUp({
      email,
      password,
      phone,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (error) {
      console.error('[E_SIGN_UP]', error.code)
      throwI18nErrorBasedOnCode(event, error.code ?? 'unexpected_failure')
    }

    return { success: true, message: null }
  }
  catch (error) {
    return {
      success: false,
      message: error,
    }
  }
})
