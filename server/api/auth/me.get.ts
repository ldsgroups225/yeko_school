/**
 * Authentication Me Handler
 * This module handles fetching and formatting user data for the authenticated user.
 * @module AuthMeHandler
 */

import type { ISchoolDTO, IUserProfileDTO } from '../../../types'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { ERole, roleToString } from '../../../types'

type IUserProfileDTOExeceptSchool = Omit<IUserProfileDTO, 'school'> & { schoolId: string }

/**
 * Represents a user profile retrieved from the database.
 * @typedef {object} UserProfile
 * @property {string} id - The user's unique identifier.
 * @property {string} email - The user's email address.
 * @property {string|null} first_name - The user's first name.
 * @property {string|null} last_name - The user's last name.
 * @property {string|null} phone - The user's phone number.
 * @property {string} school_id - The ID of the school associated with the user.
 * @property {Array<{role_id: number}>} user_roles - The roles associated with the user.
 */

/**
 * Represents a school retrieved from the database.
 * @typedef {object} School
 * @property {string} id - The school's unique identifier.
 * @property {string} name - The name of the school.
 * @property {string} code - The school's code.
 * @property {string|null} image_url - The URL of the school's image.
 * @property {string|null} created_at - The creation date of the school record.
 * @property {string|null} created_by - The ID of the user who created the school record.
 * @property {string|null} updated_at - The last update date of the school record.
 * @property {string|null} updated_by - The ID of the user who last updated the school record.
 */

/**
 * Represents the formatted user response.
 * @typedef {object} UserResponse
 * @property {boolean} success - Indicates if the operation was successful.
 * @property {object} data - The user data.
 * @property {string} data.id - The user's unique identifier.
 * @property {string} data.email - The user's email address.
 * @property {string} data.firstName - The user's first name.
 * @property {string} data.lastName - The user's last name.
 * @property {string} data.fullName - The user's full name.
 * @property {string} data.phoneNumber - The user's phone number.
 * @property {string} data.role - The user's role.
 * @property {object} data.school - The user's associated school.
 * @property {string} data.school.id - The school's unique identifier.
 * @property {string} data.school.name - The name of the school.
 * @property {string} data.school.code - The school's code.
 * @property {string} data.school.imageUrl - The URL of the school's image.
 * @property {string} data.school.createdAt - The creation date of the school record.
 * @property {string} data.school.createdBy - The ID of the user who created the school record.
 * @property {string} data.school.updatedAt - The last update date of the school record.
 * @property {string} data.school.updatedBy - The ID of the user who last updated the school record.
 */

/**
 * Fetches the user profile from the database.
 * @async
 * @function fetchUserProfile
 * @param {any} client - The Supabase client.
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Promise<IUserProfileDTOExeceptSchool>} The user profile.
 * @throws {Error} If the profile is not found or there's a database error.
 */
async function fetchUserProfile(client: any, userId: string): Promise<IUserProfileDTOExeceptSchool> {
  const { data: profile, error } = await client
    .from('users')
    .select('id, email, first_name, last_name, phone, user_roles(role_id), school_id')
    .eq('id', userId)
    .eq('user_roles.role_id', ERole.DIRECTOR)
    .single()

  if (error || !profile) {
    console.error('[E_USER_PROFILE]', error)
    throw createError({
      statusCode: 404,
      message: 'Nous n\'avons pas trouvé votre profil, veuillez vous ré-authentifier',
    })
  }

  return {
    id: profile.id,
    firstName: profile.first_name ?? '',
    lastName: profile.last_name ?? '',
    email: profile.email ?? '',
    role: roleToString(ERole.DIRECTOR),
    fullName: `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim(),
    phoneNumber: profile.phone ?? '',
    schoolId: profile.school_id ?? '',
  }
}

/**
 * Fetches the school data from the database.
 * @async
 * @function fetchSchool
 * @param {any} client - The Supabase client.
 * @param {string} schoolId - The ID of the school to fetch.
 * @returns {Promise<School>} The school data.
 * @throws {Error} If the school is not found or there's a database error.
 */
async function fetchSchool(client: any, schoolId: string): Promise<ISchoolDTO> {
  const { data: school, error } = await client
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .single()

  if (error || !school) {
    console.error('[E_SCHOOL]', error)
    throw createError({
      statusCode: 404,
      message: 'Nous n\'avons pas trouvé votre école, veuillez vous ré-authentifier',
    })
  }

  return school
}

/**
 * Formats the user response.
 * @function formatUserResponse
 * @param {any} user - The user object from Supabase auth.
 * @param {IUserProfileDTOExeceptSchool} profile - The user profile from the database.
 * @param {ISchoolDTO} school - The school data from the database.
 * @returns {{success: boolean, data: IUserProfileDTO}} The formatted user response.
 */
function formatUserResponse(user: any, profile: IUserProfileDTOExeceptSchool, school: ISchoolDTO): { success: boolean, data: IUserProfileDTO } {
  return {
    success: true,
    data: {
      id: user.id,
      email: user.email!,
      firstName: profile.firstName,
      lastName: profile.lastName,
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
      role: profile.role,
      school,
    },
  }
}

/**
 * The main handler for the /api/auth/me endpoint.
 * @async
 * @function
 * @param {H3Event} event - The H3 event object.
 * @returns {Promise<UserResponse>} The user data response.
 * @throws {Error} If the user is not authenticated or if there's an error fetching data.
 */
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Non autorisé',
    })
  }

  const client = await serverSupabaseClient(event)

  try {
    const profile = await fetchUserProfile(client, user.id)
    const school = await fetchSchool(client, profile.schoolId)

    return formatUserResponse(user, profile, school)
  }
  catch (error) {
    console.error('[E_USER_DATA]', error)
    throw error
  }
})
