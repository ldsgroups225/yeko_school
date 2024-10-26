import type { IClassDTO } from '~~/types'
import { type ClientType, csServerSupabaseClient } from '~~/server/utils'
import { formatFullName } from '~~/utils/formatting'
import { z } from 'zod'

/**
 * Schema for validating query parameters
 */
const querySchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  gradeId: z.string().optional(),
  schoolId: z.string().uuid().optional(),
})

/**
 * Type for the validated query parameters
 */
type ValidatedQueryParams = z.infer<typeof querySchema>

/**
 * Throws an error with a specified message and status code
 * @param {string} message - The error message
 * @param {number} statusCode - The HTTP status code (default: 400)
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
    .from('classes')
    .select(`
      *,
      students(count),
      users(first_name, last_name, email)
    `)
    .order('grade_id')
    .order('name')

  if (query.name) {
    supabaseQuery = supabaseQuery.ilike('name', `%${query.name}%`)
  }
  if (query.gradeId) {
    supabaseQuery = supabaseQuery.eq('grade_id', query.gradeId)
  }
  if (query.schoolId) {
    supabaseQuery = supabaseQuery.eq('school_id', query.schoolId)
  }

  return supabaseQuery
}

/**
 * Main event handler for fetching students
 * @param {H3Event} event - The H3 event object
 * @returns {Promise<{ success: boolean; data: IClassDTO[] }>} - The response object with fetched students
 */
export default defineEventHandler(async (event) => {
  const client = await csServerSupabaseClient(event)
  const rawQuery = getQuery(event)

  // Validate and parse query parameters
  const query = await validateAndParseQueryParams(rawQuery)

  // Build and execute the Supabase query
  const supabaseQuery = buildSupabaseQuery(client, query)
  const { data: classes, error } = await supabaseQuery

  if (error) {
    console.error('[E_FETCH_STUDENTS]', error)
    throwI18nError('Erreur lors de la récupération des étudiants', 500)
  }

  const parsedClasses = classes.map((cls) => {
    return {
      id: cls.id,
      name: cls.name,
      gradeId: cls.grade_id,
      schoolId: cls.school_id,
      mainTeacherId: cls.main_teacher_id,
      mainTeacherName: cls.users ? formatFullName(cls.users.first_name, cls.users.last_name, cls.users.email) : null,
      studentCount: cls.students[0]?.count || 0,
    } satisfies IClassDTO
  })

  return { success: true, data: parsedClasses }
})
