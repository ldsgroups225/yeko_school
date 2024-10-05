/**
 * Update Student Handler
 * This module handles updating specific attributes of a student.
 * @module UpdateStudentHandler
 */

import type { ClientType } from '~~/server/utils'
import type { IAttendanceDTO, IStudentDTO } from '~~/types'
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

  // If id length is equal to 9 (first 8 are letter and last is number) or is uuid then okay
  if (id.length === 9) {
    return id
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
 * Fetches a student by ID from the database.
 *
 * @async
 * @function fetchStudentById
 * @param {ClientType} client - The Supabase client.
 * @param {string} id - The ID of the student to fetch.
 * @returns {Promise<IStudentDTO>} A promise that resolves to the student data.
 * @throws {H3Error} If there's an error fetching the student or if the student is not found.
 */
async function fetchStudentById(client: ClientType, id: string): Promise<IStudentDTO> {
  const qs = client
    .from('students')
    .select(`
    *,
    class:classes(name),
    parent:users(first_name, last_name, phone, email),
    attendances(*)
    `)

  if (id.length === 9) {
    qs.eq('id_number', id)
  }
  else {
    qs.eq('id', id)
  }

  const { data, error } = await qs.single()

  if (error) {
    console.error('[E_FETCH_STUDENT]', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des données de l\'élève',
    })
  }

  if (!data) {
    throw createError({
      statusCode: 404,
      message: 'Élève non trouvé',
    })
  }

  const studentData = {
    ...data,
    className: data.class?.name,
    parent: {
      firstName: data.parent?.first_name,
      lastName: data.parent?.last_name,
      phoneNumber: data.parent?.phone,
      email: data.parent?.email,
    },
    attendances: data.attendances.map((attendance: any) => ({
      classId: attendance.class_id,
      date: attendance.created_at,
      from: attendance.starts_at,
      to: attendance.ends_at,
      status: attendance.status,
      id: attendance.id,
      studentId: attendance.student_id,
    }) satisfies IAttendanceDTO),
  } as any

  delete studentData.class

  return convertCase(studentData, 'camelCase') as unknown as IStudentDTO
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
 * Handles both GET (fetch) and PATCH (update) operations for a student.
 *
 * @async
 * @function
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<{ success: boolean, message?: string, data?: IStudentDTO }>} A promise that resolves to an object indicating the success of the operation and containing the student data if applicable.
 * @throws {H3Error} If there's an error during the process of fetching or updating the student.
 */
export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const studentId = validateStudentId(getRouterParam(event, 'id'))
  const client = await csServerSupabaseClient(event)

  try {
    if (method === 'GET') {
      const student = await fetchStudentById(client, studentId)
      return {
        success: true,
        data: student,
      }
    }
    else if (method === 'PATCH') {
      const body = await readBody(event)
      const validatedData = await validateAndParseData(body)
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
    else {
      throw createError({
        statusCode: 405,
        message: 'Method Not Allowed',
      })
    }
  }
  catch (error: any) {
    console.error('[E_STUDENT_OPERATION]', error)
    return {
      success: false,
      message: error.message || 'Une erreur inattendue s\'est produite',
      data: null,
    }
  }
})
