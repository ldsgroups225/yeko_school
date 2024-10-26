// Application-wide constants

import type { IGradeDTO } from '~~/types'
// Date formats
export const DATE_FORMAT_SHORT = 'P'
export const TIME_FORMAT_24H = 'HH:mm'

export const primaryGrades: IGradeDTO[] = [
  { id: 1, name: 'CP1' },
  { id: 2, name: 'CP2' },
  { id: 3, name: 'CE1' },
  { id: 4, name: 'CE2' },
  { id: 5, name: 'CM1' },
  { id: 6, name: 'CM2' },
]

export const secondaryGrades: IGradeDTO[] = [
  { id: 7, name: '6e' },
  { id: 8, name: '5e' },
  { id: 9, name: '4e' },
  { id: 10, name: '3e' },
  { id: 11, name: '2nde' },
  { id: 12, name: '1ere' },
  { id: 13, name: 'Tle' },
]
