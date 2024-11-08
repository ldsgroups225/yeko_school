import type { IStudentDTO } from '~~/types'
import { type ClientType, csServerSupabaseClient } from '~~/server/utils'
import { z } from 'zod'

/**
 * Zod schema for validating query parameters.
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
 * Type definition for the validated query parameters.
 */
type ValidatedQueryParams = z.infer<typeof querySchema>

/**
 * Throws an H3Error with a specified message and status code.
 *
 * @param {string} message - The error message to be displayed.
 * @param {number} [statusCode] - The HTTP status code for the error (default is 400).
 */
function throwI18nError(message: string, statusCode: number = 400): never {
  throw createError({
    statusCode,
    message,
  })
}

/**
 * Validates and parses the query parameters using the Zod schema.
 *
 * @param {unknown} query - The raw query object to be validated.
 * @returns {Promise<ValidatedQueryParams>} A promise that resolves to the validated and parsed query parameters.
 *
 * @example
 * const rawQuery = { name: "John", ageMin: "18" };
 * const validatedQuery = await validateAndParseQueryParams(rawQuery);
 * console.log(validatedQuery); // { name: "John", ageMin: 18 }
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
 * Builds a Supabase query based on the provided filters.
 *
 * @param {SupabaseClient} client - The Supabase client instance.
 * @param {ValidatedQueryParams} query - The validated query parameters to filter the students.
 * @returns {SupabaseClient['from']['select']} A Supabase query object with applied filters.
 *
 * @example
 * const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
 * const query = { name: "Smith", ageMin: 18 };
 * const supabaseQuery = buildSupabaseQuery(supabase, query);
 * const { data, error } = await supabaseQuery;
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
 * Main event handler for fetching students based on query parameters.
 *
 * This function validates the incoming query, builds a Supabase query,
 * fetches the students data, and returns the parsed results.
 *
 * @param {H3Event} event - The H3 event object containing the request details.
 * @returns {Promise<{ success: boolean; data: IStudentDTO[] }>} A promise that resolves to an object containing:
 *   - success: A boolean indicating whether the operation was successful.
 *   - data: An array of parsed student DTOs.
 *
 * @example
 * // Assuming this is used in a Nuxt 3 API route
 * export default defineEventHandler(async (event) => {
 *   try {
 *     const result = await fetchStudents(event);
 *     return result;
 *   } catch (error) {
 *     console.error(error);
 *     return { success: false, error: error.message };
 *   }
 * });
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
    throwI18nError('Erreur lors de la récupération des élèves', 500)
  }

  const parsedStudents = students.map((student) => {
    return {
      id: student.id,
      parentId: student.parent_id,
      schoolId: student.school_id,
      classId: student.class_id,
      classroomName: student.class?.name || null,
      idNumber: student.id_number,
      firstName: student.first_name,
      lastName: student.last_name,
      dateOfBirth: student.date_of_birth,
      gender: (student.gender || 'M') as 'M' | 'F',
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
