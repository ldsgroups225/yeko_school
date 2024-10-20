/**
 * Update Class Handler
 * This module handles updating specific attributes of a class.
 * @module UpdateClassHandler
 */

import type { ClientType } from '~~/server/utils'
import type { IClassDTO } from '~~/types'
import type { IUpdateClassDTO } from '~~/utils/validators'
import { csServerSupabaseClient } from '~~/server/utils'
import { convertCase } from '~~/utils/caseConverter'
import { formatFullName } from '~~/utils/formatting'
import { updateClassSchema } from '~~/utils/validators'
import { z } from 'zod'

/**
 * Validates the class ID from the route parameter.
 *
 * @function validateClassId
 * @param {string | undefined} id - The class ID from the route parameter.
 * @returns {string} The validated class ID.
 * @throws Error If the ID is missing or invalid.
 */
function validateClassId(id: string | undefined): string {
  const uuidRegex = z.object({
    id: z.string().uuid(),
  })
  if (!uuidRegex.safeParse({ id }).success) {
    throw createError({
      statusCode: 400,
      message: 'Cete classe n\'existe pas',
    })
  }

  return id || ''
}

/**
 * Validates and parses the request body data.
 *
 * @async
 * @function validateAndParseData
 * @param {unknown} data - The raw request body data to be validated.
 * @returns {Promise<IUpdateClassDTO>} A promise that resolves to the validated and parsed data.
 * @throws Error If the validation fails, an error is thrown with details about the validation failure.
 */
async function validateAndParseData(data: any): Promise<IUpdateClassDTO> {
  const result = updateClassSchema.safeParse(data)

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
 * Fetches a class by ID from the database.
 *
 * @async
 * @function fetchClassById
 * @param {ClientType} client - The Supabase client.
 * @param {string} id - The ID of the class to fetch.
 * @returns {Promise<IClassDTO>} A promise that resolves to the class data.
 * @throws Error If there's an error fetching the class or if the class is not found.
 */
async function fetchClassById(client: ClientType, id: string): Promise<IClassDTO> {
  const { data, error } = await client
    .from('classes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[E_FETCH_CLASS]', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des données de la classe',
    })
  }

  if (!data) {
    throw createError({
      statusCode: 404,
      message: 'Élève non trouvé',
    })
  }

  return convertCase(data, 'camelCase') as unknown as IClassDTO
}

/**
 * Updates the class record with the provided data.
 *
 * @async
 * @function updateClass
 * @param {any} client - The Supabase client.
 * @param {string} id - The ID of the class to update.
 * @param {IUpdateClassDTO} data - The data to update for the class.
 * @throws Error If there's an error updating the class record.
 */
async function updateClass(client: ClientType, id: string, data: IUpdateClassDTO) {
  const { data: newClassData, error } = await client
    .from('classes')
    .update(convertCase({ ...data }, 'snakeCase'))
    .eq('id', id)
    .select('*, students(count), users(first_name, last_name, email)')
    .single()

  if (error) {
    console.error('[E_UPDATE_CLASS]', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la mise à jour de la classe',
    })
  }

  const _newClassData: any = {
    ...newClassData,
    mainTeacherName: formatFullName(newClassData.users!.first_name, newClassData.users!.last_name, newClassData.users!.email),
    studentCount: newClassData.students[0]?.count || 0,
  }

  delete _newClassData.students
  delete _newClassData.users
  return _newClassData
}

/**
 * The main handler for the /api/classes/[id] endpoint.
 * Handles both GET (fetch) and PATCH (update) operations for a class.
 *
 * @async
 * @function
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ success: boolean, message?: string, data?: IClassDTO }>} A promise that resolves to an object indicating the success of the operation and containing the class data if applicable.
 * @throws Error If there's an error during the process of fetching or updating the class.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const classId = validateClassId(getRouterParam(event, 'id'))
  const client = await csServerSupabaseClient(event)

  try {
    if (method === 'GET') {
      const cls = await fetchClassById(client, classId)
      return {
        success: true,
        data: cls,
      }
    }
    else if (method === 'PATCH') {
      const body = await readBody(event)
      const validatedData = await validateAndParseData(body)
      const newClass = await updateClass(client, classId, validatedData)

      return {
        success: true,
        message: 'Classe mis à jour avec succès',
        data: convertCase(newClass, 'camelCase') as unknown as IClassDTO,
      }
    }
    else {
      throw createError({
        statusCode: 405,
        message: 'Method Not Allowed',
      })
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
