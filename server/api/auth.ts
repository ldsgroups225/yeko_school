/*
import { serverSupabaseClient, serverSupabaseSession, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'
import { ERole, type IUserProfileDTO, roleToString } from '~~/types'

const loginSchema = z.object({
  email: z.string().email({ message: 'L\'email est invalide' }),
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
  rememberMe: z.boolean().optional(),
})

async function validateAndParseFormData(formData: FormData): Promise<{ email: string, password: string, rememberMe?: boolean }> {
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    rememberMe: formData.get('rememberMe') === 'on',
  })

  if (!result.success) {
    const errorMessages = result.error.errors.map(err => err.message).join(', ')
    throw createError({
      statusCode: 400,
      message: errorMessages,
    })
  }

  return result.data
}

export const loginPost = defineEventHandler(async (event) => {
  const formData = await readFormData(event)

  console.log('[BRUTE_FORM_DATA]', formData)

  const { email, password } = await validateAndParseFormData(formData)

  console.log('[VALIDATED_DATA]', { email, password })

  const client = await serverSupabaseClient(event)
  const { data, error } = await client.auth.signInWithPassword({ email, password })

  console.log('[SIGN_IN_WITH_PASSWORD]', { data, error })

  if (error) {
    throw createError({
      statusCode: 401,
      message: 'Authentication failed',
    })
  }

  return { success: true, user: data.user }
})

export const signup = defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const { email, password } = await validateAndParseFormData(formData)

  const client = await serverSupabaseClient(event)
  const { data, error } = await client.auth.signUp({ email, password })

  if (error) {
    throw createError({
      statusCode: 400,
      message: 'Signup failed',
    })
  }

  return { success: true, user: data.user }
})

export const logout = defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const { error } = await client.auth.signOut()

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Logout failed',
    })
  }

  return { success: true }
})

export const getUser = defineEventHandler(async (event) => {
  return await serverSupabaseUser(event)
})

export const getSession = defineEventHandler(async (event) => {
  return await serverSupabaseSession(event)
})

export const fetchUserProfile = defineEventHandler(async (event): Promise<IUserProfileDTO> => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé',
    })
  }

  const client = await serverSupabaseClient(event)

  const { data: profile } = await client
    .from('users')
    .select('id, email, first_name, last_name, phone, user_roles(role_id), school_id')
    .eq('id', user.id)
    .eq('user_roles.role_id', ERole.DIRECTOR)
    .single()

  if (!profile) {
    throw createError({
      statusCode: 404,
      message: 'Nous n\'avons pas trouvé votre profil, veuillez vous ré-authentifier',
    })
  }

  const { data: school } = await client
    .from('schools')
    .select('*')
    .eq('id', profile.school_id!)
    .single()

  if (!school) {
    throw createError({
      statusCode: 404,
      message: 'Nous n\'avons pas trouvé votre école, veuillez vous ré-authentifier',
    })
  }

  return {
    id: user.id,
    email: user.email!,
    firstName: profile.first_name ?? '',
    lastName: profile.last_name ?? '',
    fullName: `${profile.first_name} ${profile.last_name}`,
    phoneNumber: profile.phone ?? '',
    role: roleToString(ERole.DIRECTOR),
    school: {
      id: school.id,
      name: school.name,
      code: school.code,
      imageUrl: school.image_url ?? '',
      createdAt: school.created_at ?? '',
      createdBy: school.created_by ?? '',
      updatedAt: school.updated_at ?? '',
      updatedBy: school.updated_by ?? '',
    },
  }
})
*/
