import type { IStudentDTO } from '~~/types'
import { type ClientType, csServerSupabaseClient } from '~~/server/utils'
import { z } from 'zod'

/**
 * Schema for validating query parameters
 */
const querySchema = z.object({
  name: z.string().optional(),
  idNumber: z.string().optional(),
  classId: z.string().uuid().optional(),
  schoolId: z.string().uuid().optional(),
  ageMin: z.string().regex(/^\d+$/).transform(Number).optional(),
  ageMax: z.string().regex(/^\d+$/).transform(Number).optional(),
})

/**
 * Type for the validated query parameters
 */
type ValidatedQueryParams = z.infer<typeof querySchema>

/**
 * Throws an error with a specified message and status code
 * @param {string} message - The error message
 * @param {number} statusCode - The HTTP status code (default: 400)
 * @throws {H3Error} - An H3 error object
 */
function throwI18nError(message: string, statusCode: number = 400): never {
  throw createError({
    statusCode,
    message,
  })
}

/**
 * Validates and parses the query parameters
 * @param {unknown} query - The raw query object
 * @returns {Promise<ValidatedQueryParams>} - The validated and parsed query parameters
 * @throws {H3Error} - If validation fails
 */
async function validateAndParseQueryParams(query: unknown): Promise<ValidatedQueryParams> {
  const result = querySchema.safeParse(query)
  if (!result.success) {
    const errorMessages = result.error.errors.map(err => err.message).join(', ')
    throwI18nError(errorMessages)
  }
  return result.data
}

/**
 * Builds the Supabase query based on the provided filters
 * @param {SupabaseClient} client - The Supabase client
 * @param {ValidatedQueryParams} query - The validated query parameters
 * @returns {SupabaseClient['from']['select']} - The built Supabase query
 */
function buildSupabaseQuery(client: ClientType, query: ValidatedQueryParams) {
  let supabaseQuery = client
    .from('students')
    .select(`
      *,
      class:classes(name)
    `)

  if (query.name) {
    supabaseQuery = supabaseQuery.or(`first_name.ilike.%${query.name}%,last_name.ilike.%${query.name}%`)
  }
  if (query.idNumber) {
    supabaseQuery = supabaseQuery.eq('id_number', query.idNumber)
  }
  if (query.classId) {
    supabaseQuery = supabaseQuery.eq('class_id', query.classId)
  }
  if (query.schoolId) {
    supabaseQuery = supabaseQuery.eq('school_id', query.schoolId)
  }
  if (query.ageMin) {
    const minDate = new Date()
    minDate.setFullYear(minDate.getFullYear() - query.ageMin)
    supabaseQuery = supabaseQuery.lte('date_of_birth', minDate.toISOString())
  }
  if (query.ageMax) {
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() - query.ageMax)
    supabaseQuery = supabaseQuery.gte('date_of_birth', maxDate.toISOString())
  }

  return supabaseQuery
}

/**
 * Main event handler for fetching students
 * @param {H3Event} event - The H3 event object
 * @returns {Promise<{ success: boolean; data: IStudentDTO[] }>} - The response object with fetched students
 * @throws {H3Error} - If an error occurs during the process
 */
export default defineEventHandler(async (event) => {
  const client = await csServerSupabaseClient(event)
  const rawQuery = getQuery(event)

  // Validate and parse query parameters
  const query = await validateAndParseQueryParams(rawQuery)

  // Build and execute the Supabase query
  const supabaseQuery = buildSupabaseQuery(client, query)
  const { data: students, error } = await supabaseQuery

  if (error) {
    console.error('[E_FETCH_STUDENTS]', error)
    throwI18nError('Erreur lors de la récupération des étudiants', 500)
  }

  const parsedStudents = students.map((student) => {
    return {
      id: student.id,
      parentId: student.parent_id,
      schoolId: student.school_id,
      classId: student.class_id,
      className: student.class?.name,
      idNumber: student.id_number,
      firstName: student.first_name,
      lastName: student.last_name,
      dateOfBirth: student.date_of_birth,
      gender: (student.gender ?? 'M') as 'M' | 'F',
      address: student.address,
      avatarUrl: student.avatar_url,
      createdAt: student.created_at,
      createdBy: student.created_by,
      updatedAt: student.updated_at,
      updatedBy: student.updated_by,
    } satisfies IStudentDTO
  })

  return { success: true, data: parsedStudents }
})
