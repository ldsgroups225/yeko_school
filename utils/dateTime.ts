import { DATE_FORMAT, TIME_FORMAT } from '~~/config/constants'
import {
  differenceInMinutes,
  differenceInYears,
  format,
  isValid,
  parse,
  parseISO,
} from 'date-fns'
import { fr } from 'date-fns/locale'

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
 * @returns {string} The formatted date string.
 */
export function formatDate(date: DateInput): string {
  return formatDateWithOptions(date, DATE_FORMAT, { locale: fr })
}

/**
 * Formats a Date object or a date string to a time string.
 *
 * @param {DateInput} date - The Date object or date string to format.
 * @returns {string} The formatted time string.
 */
export function formatTime(date: DateInput): string {
  if (typeof date === 'string') {
    if (date.length === 5)
      return date
    if (date.length === 8)
      return date.substring(0, 5)
  }
  return formatDateWithOptions(date, TIME_FORMAT)
}

/**
 * Parses a date or time string to a Date object.
 *
 * @param {string} dateString - The date or time string to parse.
 * @param {string} formatString - The format string to use for parsing.
 * @returns {Date | null} The parsed Date object, or null if the parsing fails.
 */
function parseStringToDate(dateString: string, formatString: string): Date | null {
  const parsedDate = parse(dateString, formatString, new Date())
  return isValid(parsedDate) ? parsedDate : null
}

/**
 * Parses a date string to a Date object.
 *
 * @param {string} dateString - The date string to parse.
 * @returns {Date | null} The parsed Date object, or null if the parsing fails.
 */
export function parseDate(dateString: string): Date | null {
  return parseStringToDate(dateString, DATE_FORMAT)
}

/**
 * Parses a time string to a Date object.
 *
 * @param {string} timeString - The time string to parse.
 * @returns {Date | null} The parsed Date object, or null if the parsing fails.
 */
export function parseTime(timeString: string): Date | null {
  return parseStringToDate(timeString, TIME_FORMAT)
}

/**
 * Calculates the duration in minutes between a start time and an arrival time.
 *
 * @param {Date} startTime - The start time.
 * @param {Date} arrivalTime - The arrival time.
 * @returns {number} The duration in minutes, or 0 if the arrival time is before the start time.
 */
export function calculateLateDuration(startTime: Date, arrivalTime: Date): number {
  return Math.max(0, differenceInMinutes(arrivalTime, startTime))
}

/**
 * Gets the current day of the week as a number (0-6, where 0 is Sunday).
 *
 * @returns {number} The current day of the week.
 */
export function getCurrentDayOfWeek(): number {
  return new Date().getDay()
}

/**
 * Gets the current time as a string in HH:mm format.
 *
 * @returns {string} The current time in HH:mm format.
 */
export function getCurrentTimeString(): string {
  return formatTimeString(new Date())
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
 * Compares two time strings in HH:mm format.
 *
 * @param {string} time1 - The first time string.
 * @param {string} time2 - The second time string.
 * @returns {number} A negative number if time1 is before time2, 0 if they are equal, and a positive number if time1 is after time2.
 */
export function compareTimeStrings(time1: string, time2: string): number {
  const date1 = parseTimeString(time1)
  const date2 = parseTimeString(time2)
  return date1.getTime() - date2.getTime()
}

/**
 * Extracts the hour and minute (HH:mm) from an ISO 8601 date string.
 *
 * @param {string} dateString - The ISO 8601 date string to extract the time from.
 * @returns {string} The extracted hour and minute in the format "HH:mm".
 */
export function extractHourAndMinute(dateString: string): string {
  if (dateString.length === 8)
    return dateString.substring(0, 5)
  const date = parseISO(dateString)
  return formatTimeString(date)
}

/**
 * Converts a time string in the format "HH:MM" to an ISO 8601 timestamp.
 *
 * The date portion of the timestamp will be the current date.
 *
 * @param {string} timeString - The time string to convert, in the format "HH:MM".
 * @returns {string} The ISO 8601 timestamp representing the current date and the given time.
 */
export function convertToIsoTime(timeString: string): string {
  const date = parseTimeString(timeString)
  return date.toISOString()
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
