import { csServerSupabaseClient } from '~~/server/utils'
import { z } from 'zod'

/**
 * Represents the structure of the login form data.
 */
interface LoginFormData {
  /** The user's email address. */
  email: string
  /** The user's password. */
  password: string
  /** Optional flag to remember the user's session. */
  rememberMe?: boolean
}

/**
 * Zod schema for validating login form data.
 */
const loginSchema = z.object({
  email: z.string().email({ message: 'L\'email est invalide' }),
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
  rememberMe: z.boolean().optional(),
})

/**
 * Throws an H3Error with a localized message based on the provided error code.
 *
 * @param {string} code - The error code to look up.
 * @throws {H3Error} An H3 error object with the appropriate status code and localized message.
 *
 * @example
 * try {
 *   throwI18nErrorBasedOnCode('invalid_credentials');
 * } catch (error) {
 *   console.error(error.statusCode, error.message);
 *   // Output: 400 "Email ou mot de passe incorrect"
 * }
 */
function throwI18nErrorBasedOnCode(code: string): never {
  const errorMessages: Record<any, { statusCode: number, message: string }> = {
    // General errors
    unexpected_failure: { statusCode: 500, message: 'Une erreur inattendue s\'est produite' },
    validation_failed: { statusCode: 400, message: 'La validation a échoué' },
    conflict: { statusCode: 409, message: 'Un conflit est survenu' },

    // Authentication errors
    bad_jwt: { statusCode: 401, message: 'Jeton d\'authentification invalide' },
    not_admin: { statusCode: 403, message: 'Accès administrateur requis' },
    no_authorization: { statusCode: 401, message: 'Autorisation requise' },
    user_not_found: { statusCode: 404, message: 'Utilisateur non trouvé' },
    session_not_found: { statusCode: 404, message: 'Session non trouvée' },
    user_banned: { statusCode: 403, message: 'Compte utilisateur banni' },
    invalid_credentials: { statusCode: 400, message: 'Email ou mot de passe incorrect' },

    // Registration errors
    email_exists: { statusCode: 409, message: 'Cet email est déjà utilisé' },
    phone_exists: { statusCode: 409, message: 'Ce numéro de téléphone est déjà utilisé' },
    signup_disabled: { statusCode: 403, message: 'L\'inscription est désactivée' },

    // Flow state errors
    flow_state_not_found: { statusCode: 404, message: 'État du flux non trouvé' },
    flow_state_expired: { statusCode: 410, message: 'État du flux expiré' },

    // Provider errors
    provider_email_needs_verification: { statusCode: 400, message: 'L\'email du fournisseur nécessite une vérification' },
    bad_oauth_state: { statusCode: 400, message: 'État OAuth invalide' },
    bad_oauth_callback: { statusCode: 400, message: 'Callback OAuth invalide' },
    oauth_provider_not_supported: { statusCode: 400, message: 'Fournisseur OAuth non pris en charge' },
    unexpected_audience: { statusCode: 400, message: 'Audience inattendue' },

    // Identity errors
    single_identity_not_deletable: { statusCode: 400, message: 'Impossible de supprimer la seule identité' },
    email_conflict_identity_not_deletable: { statusCode: 409, message: 'Conflit d\'email, identité non supprimable' },
    identity_already_exists: { statusCode: 409, message: 'Cette identité existe déjà' },
    identity_not_found: { statusCode: 404, message: 'Identité non trouvée' },

    // Provider status errors
    email_provider_disabled: { statusCode: 403, message: 'Fournisseur d\'email désactivé' },
    phone_provider_disabled: { statusCode: 403, message: 'Fournisseur de téléphone désactivé' },
    provider_disabled: { statusCode: 403, message: 'Fournisseur désactivé' },

    // MFA errors
    too_many_enrolled_mfa_factors: { statusCode: 400, message: 'Trop de facteurs MFA enregistrés' },
    mfa_factor_name_conflict: { statusCode: 409, message: 'Conflit de nom pour le facteur MFA' },
    mfa_factor_not_found: { statusCode: 404, message: 'Facteur MFA non trouvé' },
    mfa_ip_address_mismatch: { statusCode: 400, message: 'Adresse IP MFA non concordante' },
    mfa_challenge_expired: { statusCode: 410, message: 'Challenge MFA expiré' },
    mfa_verification_failed: { statusCode: 400, message: 'Vérification MFA échouée' },
    mfa_verification_rejected: { statusCode: 400, message: 'Vérification MFA rejetée' },
    insufficient_aal: { statusCode: 400, message: 'Niveau d\'assurance d\'authentification insuffisant' },

    // CAPTCHA error
    captcha_failed: { statusCode: 400, message: 'Échec du CAPTCHA' },

    // SAML errors
    saml_provider_disabled: { statusCode: 403, message: 'Fournisseur SAML désactivé' },
    saml_relay_state_not_found: { statusCode: 404, message: 'État de relais SAML non trouvé' },
    saml_relay_state_expired: { statusCode: 410, message: 'État de relais SAML expiré' },
    saml_idp_not_found: { statusCode: 404, message: 'Fournisseur d\'identité SAML non trouvé' },
    saml_assertion_no_user_id: { statusCode: 400, message: 'Assertion SAML sans ID utilisateur' },
    saml_assertion_no_email: { statusCode: 400, message: 'Assertion SAML sans email' },
    saml_metadata_fetch_failed: { statusCode: 500, message: 'Échec de récupération des métadonnées SAML' },
    saml_idp_already_exists: { statusCode: 409, message: 'Le fournisseur d\'identité SAML existe déjà' },
    saml_entity_id_mismatch: { statusCode: 400, message: 'ID d\'entité SAML non concordant' },

    // SSO errors
    sso_provider_not_found: { statusCode: 404, message: 'Fournisseur SSO non trouvé' },
    sso_domain_already_exists: { statusCode: 409, message: 'Le domaine SSO existe déjà' },
    user_sso_managed: { statusCode: 403, message: 'Utilisateur géré par SSO' },

    // Other authentication errors
    manual_linking_disabled: { statusCode: 403, message: 'Liaison manuelle désactivée' },
    invite_not_found: { statusCode: 404, message: 'Invitation non trouvée' },
    reauthentication_needed: { statusCode: 401, message: 'Ré-authentification nécessaire' },
    same_password: { statusCode: 400, message: 'Nouveau mot de passe identique à l\'ancien' },
    reauthentication_not_valid: { statusCode: 401, message: 'Ré-authentification non valide' },
    otp_expired: { statusCode: 410, message: 'OTP expiré' },
    otp_disabled: { statusCode: 403, message: 'OTP désactivé' },
    weak_password: { statusCode: 400, message: 'Mot de passe trop faible' },

    // Communication errors
    sms_send_failed: { statusCode: 500, message: 'Échec d\'envoi du SMS' },
    email_not_confirmed: { statusCode: 400, message: 'Email non confirmé' },
    phone_not_confirmed: { statusCode: 400, message: 'Téléphone non confirmé' },
    reauth_nonce_missing: { statusCode: 400, message: 'Nonce de ré-authentification manquant' },

    // Rate limiting errors
    over_request_rate_limit: { statusCode: 429, message: 'Limite de requêtes dépassée' },
    over_email_send_rate_limit: { statusCode: 429, message: 'Limite d\'envoi d\'emails dépassée' },
    over_sms_send_rate_limit: { statusCode: 429, message: 'Limite d\'envoi de SMS dépassée' },

    // Miscellaneous
    user_already_exists: { statusCode: 409, message: 'L\'utilisateur existe déjà' },
    bad_code_verifier: { statusCode: 400, message: 'Vérificateur de code invalide' },
  }

  const error = errorMessages[code] || { statusCode: 500, message: 'Une erreur s\'est produite' }
  throw createError(error)
}

/**
 * Validates and parses the login form data using the Zod schema.
 *
 * @param {unknown} formData - The raw form data to be validated.
 * @returns {Promise<LoginFormData>} A promise that resolves to the validated and parsed login form data.
 * @throws {H3Error} If the validation fails, an error is thrown with details about the validation failure.
 *
 * @example
 * const rawFormData = { email: "user@example.com", password: "password123" };
 * try {
 *   const validatedData = await validateAndParseFormData(rawFormData);
 *   console.log(validatedData);
 * } catch (error) {
 *   console.error(error.statusCode, error.message);
 * }
 */
async function validateAndParseFormData(formData: unknown): Promise<LoginFormData> {
  const result = loginSchema.safeParse(formData)

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
 * Main event handler for user login.
 *
 * This function validates the incoming form data, attempts to sign in the user
 * using Supabase authentication, and returns the user ID on success.
 *
 * @param {H3Event} event - The H3 event object containing the request details.
 * @returns {Promise<{ success: boolean; data: string | undefined }>} A promise that resolves to an object containing:
 *   - success: A boolean indicating whether the login was successful.
 *   - data: The user ID if login was successful, undefined otherwise.
 * @throws {H3Error} If there's an error during the login process, including validation errors or authentication failures.
 *
 * @example
 * // Assuming this is used in a Nuxt 3 API route
 * export default defineEventHandler(async (event) => {
 *   try {
 *     const result = await loginHandler(event);
 *     return result;
 *   } catch (error) {
 *     console.error(error);
 *     return { success: false, error: error.message };
 *   }
 * });
 */
export default defineEventHandler(async (event) => {
  try {
    const formData = await readBody(event)
    const { email, password } = await validateAndParseFormData(formData)

    const client = await csServerSupabaseClient(event)
    const { error } = await client.auth.signInWithPassword({ email, password })

    if (error) {
      console.error('[E_SIGN_IN]', error.code)
      throwI18nErrorBasedOnCode(error.code ?? 'unexpected_failure')
    }

    return { success: true, message: null }
  }
  catch (error) {
    return {
      success: false,
      message: error,
    }
  }
})
