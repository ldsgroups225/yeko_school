import { DATE_FORMAT_SHORT } from '~~/config/constants'
import {
  differenceInYears,
  format,
  isValid,
  parse,
  parseISO,
} from 'date-fns'
import { enUS, fr } from 'date-fns/locale'

type DateInput = Date | string

/**
 * Parses a date input to a Date object.
 *
 * @param {DateInput} date - The Date object or date string to parse.
 * @returns {Date} The parsed Date object.
 */
function parseToDate(date: DateInput): Date {
  return typeof date === 'string' ? new Date(date) : date
}

/**
 * Formats a Date object or a date string using the provided format.
 *
 * @param {DateInput} date - The Date object or date string to format.
 * @param {string} formatString - The format string to use.
 * @param {object} options - Additional options for formatting.
 * @returns {string} The formatted date string.
 */
function formatDateWithOptions(date: DateInput, formatString: string, options?: Parameters<typeof format>[2]): string {
  return format(parseToDate(date), formatString, options)
}

/**
 * Formats a Date object or a date string to a localized date string.
 *
 * @param {DateInput} date - The Date object or date string to format.
 * @param format
 * @param locale
 * @returns {string} The formatted date string.
 */
export function formatDate(date: DateInput, format: string = DATE_FORMAT_SHORT, locale: 'fr' | 'en' = 'fr'): string {
  return formatDateWithOptions(date, format, { locale: locale === 'fr' ? fr : enUS })
}

/**
 * Parses a date or time string to a Date object.
 *
 * @param {string} dateString - The date or time string to parse.
 * @param {string} formatString - The format string to use for parsing.
 * @returns {Date | null} The parsed Date object, or null if the parsing fails.
 */
export function parseStringToDate(dateString: string, formatString: string): Date | null {
  const parsedDate = parse(dateString, formatString, new Date())
  return isValid(parsedDate) ? parsedDate : null
}

/**
 * Parse date string in French format (DD/MM/YYYY) to Date object.
 *
 * @param {string} dateString - The date string to parse (e.g., "01/01/1970").
 * @returns {Date | null} The parsed Date object, or null if the parsing fails.
 */
export function parseFrenchDate(dateString: string): Date | null {
  return parseStringToDate(dateString, 'dd/MM/yyyy')
}

/**
 * Formats a Date object to a time string in HH:mm format.
 *
 * @param {Date} date - The Date object to format.
 * @returns {string} The formatted time string in HH:mm format.
 */
export function formatTimeString(date: Date): string {
  return date.toTimeString().slice(0, 5)
}

/**
 * Parses a time string in HH:mm format to a Date object.
 *
 * @param {string} timeString - The time string in HH:mm format.
 * @returns {Date} The parsed Date object.
 */
export function parseTimeString(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number)

  if (!hours || !minutes) {
    throw new TypeError('Invalid time string')
  }

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new TypeError('Invalid time string')
  }

  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

/**
 * Calculates the age of a person based on their birthday.
 *
 * @param {string} birthday - The birthday in ISO string format (e.g., "1990-01-01T00:00:00.000Z")
 * @returns {number} The calculated age
 */
export function getAge(birthday: string): number {
  const birthDate = parseISO(birthday)
  const today = new Date()

  if (!isValid(birthDate)) {
    throw new Error('Invalid birthday format. Please provide a valid ISO string date.')
  }

  return differenceInYears(today, birthDate)
}
