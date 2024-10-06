import type { Class } from '~~/types'
import { type ClientType, csServerSupabaseClient } from '~~/server/utils'
import { z } from 'zod'

// Schema for query validation
const querySchema = z.object({ schoolId: z.string().uuid() })

// Validates and parses query parameters
async function validateQuery(query: unknown) {
  const result = querySchema.safeParse(query)
  if (!result.success)
    throw createError({ statusCode: 400, message: result.error.message })
  return result.data
}

// Builds and executes the Supabase RPC query
async function fetchClasses(client: ClientType, schoolId: string) {
  const { data, error } = await client.rpc('get_classes_by_school', { school_id: schoolId })
  if (error)
    throw createError({ statusCode: 500, message: 'Erreur lors de la récupération des étudiants' })
  return data
}

// Main event handler
export default defineEventHandler(async (event) => {
  const client = await csServerSupabaseClient(event)
  const query = await validateQuery(getQuery(event))

  const students = await fetchClasses(client, query.schoolId)

  const parsedStudents = students.map((c: any, index: number) => ({
    id: index.toString(),
    name: c.grade_name,
    count: c.count,
    subclasses: c.subclasses.map((s: { id: string, name: string }) => ({ id: s.id, name: s.name })),
  } satisfies Class)) as Class[]

  return { success: true, data: parsedStudents }
})
