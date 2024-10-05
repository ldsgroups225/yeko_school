/**
 * Link Student and Parent Handler
 * This module handles linking a student to a parent using an OTP.
 * @module LinkStudentParentHandler
 */

import type { ClientType } from '~~/server/utils'
import { csServerSupabaseClient } from '~~/server/utils'
import { z } from 'zod'

/**
 * Zod schema for validating the request body.
 */
const linkStudentParentSchema = z.object({
  studentId: z.string({
    required_error: 'Il manque l\'ID de l\'élève à lier',
    invalid_type_error: 'L\'ID de l\'élève à lier n\'est pas valide',
  }).uuid('L\'ID de l\'élève à lier n\'est pas valide'),
  otp: z.string({
    required_error: 'Il manque le code OTP',
    invalid_type_error: 'Le code OTP n\'est pas valide',
  }).length(6, 'Le code OTP doit contenir 6 chiffres'),
})

/**
 * Represents the structure of the link request data.
 */
type LinkStudentParentData = z.infer<typeof linkStudentParentSchema>

/**
 * Validates and parses the request body data.
 *
 * @async
 * @function validateAndParseData
 * @param {unknown} data - The raw request body data to be validated.
 * @returns {Promise<LinkStudentParentData>} A promise that resolves to the validated and parsed data.
 * @throws {H3Error} If the validation fails, an error is thrown with details about the validation failure.
 *
 * @example
 * try {
 *   const validData = await validateAndParseData({ student_id: '123e4567-e89b-12d3-a456-426614174000', otp: '123456' });
 *   console.log(validData);
 * } catch (error) {
 *   console.error(error.statusCode, error.message);
 * }
 */
async function validateAndParseData(data: unknown): Promise<LinkStudentParentData> {
  const result = linkStudentParentSchema.safeParse(data)

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
 * Checks if the provided OTP is valid, not used, and not expired.
 *
 * @async
 * @function checkOTP
 * @param {any} client - The Supabase client.
 * @param {string} otp - The OTP to check.
 * @returns {Promise<string>} A promise that resolves to the parent ID associated with the OTP.
 * @throws {H3Error} If the OTP is invalid, expired, or already used.
 *
 * @example
 * try {
 *   const parentId = await checkOTP(supabaseClient, '123456');
 *   console.log('Parent ID:', parentId);
 * } catch (error) {
 *   console.error(error.statusCode, error.message);
 * }
 */
async function checkOTP(client: ClientType, otp: string): Promise<string> {
  const { data, error } = await client
    .from('link_student_parent')
    .select('parent_id, is_used, expired_at')
    .eq('otp', otp)
    .single()

  if (error || !data) {
    throw createError({
      statusCode: 404,
      message: 'OTP invalide',
    })
  }

  if (data.is_used) {
    throw createError({
      statusCode: 400,
      message: 'Ce code a déjà été utilisé',
    })
  }

  if (new Date(data.expired_at) < new Date()) {
    throw createError({
      statusCode: 400,
      message: 'Ce code a expiré',
    })
  }

  return data.parent_id
}

/**
 * Updates the student record with the new parent ID.
 *
 * @async
 * @function updateStudentParent
 * @param {any} client - The Supabase client.
 * @param {string} studentId - The ID of the student to update.
 * @param {string} parentId - The ID of the parent to link to the student.
 * @throws {H3Error} If there's an error updating the student record.
 *
 * @example
 * try {
 *   await updateStudentParent(supabaseClient, '123e4567-e89b-12d3-a456-426614174000', '098f6bcd-4621-3373-8ade-4e832627b4f6');
 *   console.log('Student updated successfully');
 * } catch (error) {
 *   console.error(error.statusCode, error.message);
 * }
 */
async function updateStudentParent(client: ClientType, studentId: string, parentId: string): Promise<void> {
  const { error } = await client
    .from('students')
    .update({ parent_id: parentId })
    .eq('id', studentId)

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la mise à jour de l\'étudiant',
    })
  }
}

/**
 * Marks the OTP as used by setting is_used to true.
 *
 * @async
 * @function markOTPAsUsed
 * @param {any} client - The Supabase client.
 * @param {string} otp - The OTP to mark as used.
 * @throws {H3Error} If there's an error updating the OTP status.
 *
 * @example
 * try {
 *   await markOTPAsUsed(supabaseClient, '123456');
 *   console.log('OTP marked as used');
 * } catch (error) {
 *   console.error(error.statusCode, error.message);
 * }
 */
async function markOTPAsUsed(client: ClientType, otp: string): Promise<void> {
  const { error } = await client
    .from('link_student_parent')
    .update({ is_used: true })
    .eq('otp', otp)

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la mise à jour du statut de l\'OTP',
    })
  }
}

/**
 * The main handler for the /api/link-student-and-parent endpoint.
 * Links a student to a parent using the provided OTP.
 *
 * @async
 * @function
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ success: boolean, message: string }>} A promise that resolves to an object indicating the success of the operation.
 * @throws {H3Error} If there's an error during the process of linking the student and parent.
 *
 * @example
 * // Assuming this is used in a Nuxt 3 API route
 * export default defineEventHandler(async (event) => {
 *   try {
 *     const result = await linkStudentParentHandler(event);
 *     return result;
 *   } catch (error) {
 *     console.error(error);
 *     return { success: false, message: error.message };
 *   }
 * });
 */
export default defineEventHandler(async (event) => {
  // Ensure the request method is PATCH
  if (event.node.req.method !== 'PATCH') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    })
  }

  const body = await readBody(event)
  const { studentId, otp } = await validateAndParseData(body)

  const client = await csServerSupabaseClient(event)

  try {
    const parentId = await checkOTP(client, otp)
    await updateStudentParent(client, studentId, parentId)
    await markOTPAsUsed(client, otp)

    return {
      success: true,
      message: 'Élève lié au parent avec succès',
    }
  }
  catch (error) {
    console.error('[E_LINK_STUDENT_PARENT]:', error)
    return {
      success: false,
      message: error,
    }
  }
})
