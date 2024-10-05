import type { IAttendanceDTO, IParticipationDTO } from '~~/types'

type TBadgeColor = 'green' | 'lime' | 'yellow' | 'orange' | 'red' | 'gray'

export function getAttendanceStats(attendances: IAttendanceDTO[]): { present: number, absent: number, late: number } {
  return attendances.reduce(
    (acc, attendance) => {
      acc[attendance.status.toLowerCase() as 'present' | 'absent' | 'late']++
      return acc
    },
    { present: 0, absent: 0, late: 0 },
  )
}

export function calculateParticipationAverage(participations: IParticipationDTO[]): number {
  if (participations.length === 0)
    return 0
  const sum = participations.reduce((acc, p) => acc + p.note, 0)
  return Number((sum / participations.length).toFixed(2))
}

export function calculateAttendancePercentage(stats: { present: number, absent: number, late: number }): string {
  const total = stats.present + stats.absent + stats.late
  return total > 0 ? ((stats.present / total) * 100).toFixed(1) : '0'
}

export function getOverallPerformance(participationAverage: number, controlNoteAverage: number | null): string {
  if (controlNoteAverage === null)
    return 'N/A'
  const average = (participationAverage + controlNoteAverage) / 2
  if (average >= 16)
    return 'Excellent'
  if (average >= 14)
    return 'Très bien'
  if (average >= 12)
    return 'Bien'
  if (average >= 10)
    return 'Assez bien'
  return 'À améliorer'
}

export function getPerformanceColor(performance: string): TBadgeColor {
  switch (performance) {
    case 'Excellent': return 'green'
    case 'Très bien': return 'lime'
    case 'Bien': return 'yellow'
    case 'Assez bien': return 'orange'
    default: return 'red'
  }
}

export function getAttendanceColor(status: string): TBadgeColor {
  switch (status) {
    case 'present': return 'green'
    case 'absent': return 'red'
    case 'late': return 'yellow'
    default: return 'gray'
  }
}

export function getGradeColor(note: number): TBadgeColor {
  if (note >= 16)
    return 'green'
  if (note >= 14)
    return 'lime'
  if (note >= 12)
    return 'yellow'
  if (note >= 10)
    return 'orange'
  return 'red'
}
