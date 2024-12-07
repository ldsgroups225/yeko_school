import type { H3Event } from 'h3'
import type { Database } from '~~/types/database.types'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export async function csServerSupabaseClient(event: H3Event) {
  return await serverSupabaseClient<Database>(event)
}

export async function csServerSupabaseUser(event: H3Event) {
  return await serverSupabaseUser(event)
}

// export client type without awaiting
export type ClientType = Awaited<ReturnType<typeof csServerSupabaseClient>>
