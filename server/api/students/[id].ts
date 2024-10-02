/**
 * Update Student Handler
 * This module handles updating specific attributes of a student.
 * @module UpdateStudentHandler
 */

import type { ClientType } from '~~/server/utils'
import type { IStudentDTO } from '~~/types'
import type { IEditingStudentDTO } from '~~/utils/validators'
import { csServerSupabaseClient } from '~~/server/utils'
import { convertCase } from '~~/utils/caseConverter'
import { updateStudentSchema } from '~~/utils/validators'

/**
 * Validates the student ID from the route parameter.
 *
 * @function validateStudentId
 * @param {string | undefined} id - The student ID from the route parameter.
 * @returns {string} The validated student ID.
 * @throws {H3Error} If the ID is missing or invalid.
 */
function validateStudentId(id: string | undefined): string {
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Veillez sélectionner un élève',
    })
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    throw createError({
      statusCode: 400,
      message: 'Cet élève n\'existe pas',
    })
  }

  return id
}

/**
 * Validates and parses the request body data.
 *
 * @async
 * @function validateAndParseData
 * @param {unknown} data - The raw request body data to be validated.
 * @returns {Promise<IEditingStudentDTO>} A promise that resolves to the validated and parsed data.
 * @throws {H3Error} If the validation fails, an error is thrown with details about the validation failure.
 */
async function validateAndParseData(data: any): Promise<IEditingStudentDTO> {
  if (data.avatarUrl === '')
    delete data.avatarUrl
  const result = updateStudentSchema.safeParse(data)

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
 * Updates the student record with the provided data.
 *
 * @async
 * @function updateStudent
 * @param {any} client - The Supabase client.
 * @param {string} id - The ID of the student to update.
 * @param {IEditingStudentDTO} data - The data to update for the student.
 * @throws {H3Error} If there's an error updating the student record.
 */
async function updateStudent(client: ClientType, id: string, data: IEditingStudentDTO) {
  let newAvatarUrl = data.avatarUrl

  if (data.avatarBase64) {
    const now = new Date()
    const fileName = `avatar${now.getTime()}.png`
    const { data: uploadResult, error } = await client
      .storage
      .from('user_avatar')
      .upload(fileName, data.avatarBase64, {
        contentType: 'image/png',
      })

    if (error) {
      console.error('[E_UPDATE_STUDENT]', error)
      throw createError({
        statusCode: 500,
        message: 'Erreur lors de la mise à jour de l\'élève',
      })
    }

    newAvatarUrl = uploadResult.id
    delete data.avatarBase64
  }

  const { data: newStudentData, error } = await client
    .from('students')
    .update(convertCase({ ...data, avatarUrl: newAvatarUrl }, 'snakeCase'))
    .eq('id', id)
    .select('*, class:classes(name)')
    .single()

  if (error) {
    console.error('[E_UPDATE_STUDENT]', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la mise à jour de l\'élève',
    })
  }

  return newStudentData
}

/**
 * The main handler for the /api/students/[id] endpoint.
 * Updates specific attributes of a student.
 *
 * @async
 * @function
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ success: boolean, message: string }>} A promise that resolves to an object indicating the success of the operation.
 * @throws {H3Error} If there's an error during the process of updating the student.
 */
export default defineEventHandler(async (event) => {
  // Ensure the request method is PATCH
  if (event.node.req.method !== 'PATCH') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed',
    })
  }

  const studentId = validateStudentId(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const validatedData = await validateAndParseData(body)

  const client = await csServerSupabaseClient(event)

  try {
    const newStudent = await updateStudent(client, studentId, validatedData)

    const _newStudent = newStudent as any
    _newStudent.className = _newStudent.class?.name

    delete _newStudent.class

    return {
      success: true,
      message: 'Élève mis à jour avec succès',
      data: convertCase(_newStudent, 'camelCase') as unknown as IStudentDTO,
    }
  }
  catch (error) {
    console.error('[E_UPDATE_STUDENT]', error)
    return {
      success: false,
      message: error,
      data: null,
    }
  }
})
