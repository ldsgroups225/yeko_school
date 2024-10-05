import type { Database } from '~~/types/database.types'
import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export async function csServerSupabaseClient(event: H3Event) {
  const supabase = await serverSupabaseClient<Database>(event)
  return supabase
}

export async function csServerSupabaseUser(event: H3Event) {
  const user = await serverSupabaseUser(event)
  return user
}

// export client type without awaiting
export type ClientType = Awaited<ReturnType<typeof csServerSupabaseClient>>
