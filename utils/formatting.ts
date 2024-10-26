/**
 * Formats a full name by combining the first name and last name.
 *
 * @param {string} firstName - The first name of the person.
 * @param {string} lastName - The last name of the person.
 * @param {string} email - The email of the person.
 * @returns {string} The full name in the format "FirstName LastName".
 */
export function formatFullName(firstName: string | null, lastName: string | null, email?: string | null): string {
  const fullName: string[] = []
  if ((!firstName || !firstName.length) && (!lastName || !lastName.length))
    return (email && email.length) ? capitalizeFirstLetter(email.split('@')[0] || '') : 'Non renseigné'
  if (firstName && firstName.length)
    fullName.push(firstName)
  if (lastName && lastName.length)
    fullName.push(lastName)
  return fullName.join(' ')
}

/**
 * Formats a phone number into the standard (XXX) XXX-XXXX format.
 *
 * @param {string} phoneNumber - The phone number to format.
 * @returns {string} The formatted phone number. If the input cannot be formatted, returns the original phone number.
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = (`${phoneNumber}`).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{4})$/)
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`
  }
  return phoneNumber
}

/**
 * Capitalize the first letter of a string.
 * @param {string} text - The text to capitalize.
 * @returns {string} The capitalized text.
 */
export function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
