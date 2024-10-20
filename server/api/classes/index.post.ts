/**
 * Create Class Handler
 * This module handles creating a new class.
 * @module CreateClassHandler
 */

import type { ClientType } from '~~/server/utils'
import type { IClassDTO } from '~~/types'
import type { ICreateClassDTO } from '~~/utils/validators'
import { csServerSupabaseClient } from '~~/server/utils'
import { convertCase } from '~~/utils/caseConverter'
import { formatFullName } from '~~/utils/formatting'
import { classSchema } from '~~/utils/validators'

/**
 * Validates and parses the request body data.
 *
 * @async
 * @function validateAndParseData
 * @param {unknown} data - The raw request body data to be validated.
 * @returns {Promise<ICreateClassDTO>} A promise that resolves to the validated and parsed data.
 * @throws Error If the validation fails, an error is thrown with details about the validation failure.
 */
async function validateAndParseData(data: any): Promise<ICreateClassDTO> {
  const result = classSchema.safeParse(data)

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
 * Creates a new class record in the database.
 *
 * @async
 * @function createClass
 * @param {any} client - The Supabase client.
 * @param {ICreateClassDTO} data - The data for the new class.
 * @throws Error If there's an error creating the class record.
 */
async function createClass(client: ClientType, data: ICreateClassDTO) {
  const { data: newClassData, error } = await client
    .from('classes')
    .insert(convertCase({ ...data }, 'snakeCase') as any)
    .select('*, users(first_name, last_name, email)')
    .single()

  if (error) {
    console.error('[E_CREATE_CLASS]', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la création de la classe',
    })
  }

  const _newClassData: any = {
    ...newClassData,
    mainTeacherName: formatFullName(newClassData.users!.first_name, newClassData.users!.last_name, newClassData.users!.email),
    studentCount: 0,
  }

  delete _newClassData.users
  return _newClassData
}

/**
 * The main handler for the /api/classes endpoint.
 * Handles only POST (create) operations for a class.
 *
 * @async
 * @function
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ success: boolean, message?: string, data?: IClassDTO }>} A promise that resolves to an object indicating the success of the operation and containing the class data if applicable.
 * @throws Error If there's an error during the process of creating the class.
 */
export default defineEventHandler(async (event) => {
  const client = await csServerSupabaseClient(event)

  try {
    const body = await readBody(event)
    const validatedData = await validateAndParseData(body)
    const newClass = await createClass(client, validatedData)

    return {
      success: true,
      message: 'Classe créée avec succès',
      data: convertCase(newClass, 'camelCase') as unknown as IClassDTO,
    }
  }
  catch (error: any) {
    console.error('[E_CLASS_OPERATION]', error.message)
    return {
      success: false,
      message: error.message || 'Une erreur inattendue s\'est produite',
      data: null,
    }
  }
})
