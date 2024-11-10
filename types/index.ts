/**
 * Enumeration representing different roles in the system.
 * @enum {number}
 */
export enum ERole {
  /** Represents a parent role */
  PARENT = 1,
  /** Represents a teacher role */
  TEACHER = 2,
  /** Represents a director role */
  DIRECTOR = 3,
}

/**
 * Converts an ERole enum value to its string representation.
 *
 * @param {ERole} role - The role enum value to convert.
 * @returns {string} The string representation of the role.
 * @throws {Error} If an invalid role is provided.
 *
 * @example
 * const roleString = roleToString(ERole.PARENT);
 * console.log(roleString); // Output: 'Parent'
 */
export function roleToString(role: ERole): string {
  const roleMap: { [key in ERole]: string } = {
    [ERole.PARENT]: 'Parent',
    [ERole.TEACHER]: 'Enseignant',
    [ERole.DIRECTOR]: 'Directeur',
  }

  const result = roleMap[role]
  if (!result) {
    throw new Error(`Invalid role: ${role}`)
  }
  return result
}

/**
 * Converts a string representation of a role to its corresponding ERole enum value.
 *
 * @param {string} roleString - The string representation of the role.
 * @returns {ERole | undefined} The corresponding ERole enum value, or undefined if no match is found.
 *
 * @example
 * const role = stringToRole('Teacher');
 * if (role !== undefined) {
 *   console.log(role); // Output: 2 (ERole.TEACHER)
 * } else {
 *   console.log('Invalid role string');
 * }
 */
export function stringToRole(roleString: string): ERole | undefined {
  const stringRoleMap: { [key: string]: ERole } = {
    Parent: ERole.PARENT,
    Teacher: ERole.TEACHER,
    Director: ERole.DIRECTOR,
  }

  return stringRoleMap[roleString]
}

/**
 * Base roles definition using const assertion
 * The 'as const' makes the object immutable and its properties read-only
 */
export const ERoleAttributes = {
  TEACHER: 2,
  DIRECTOR: 3,
  FOUNDER: 4,
} as const

// Create type from const assertion
// This creates a union type of all possible values
export type TRoleAttributes = typeof ERoleAttributes[keyof typeof ERoleAttributes]

export const roleOptions: { label: string, value: TRoleAttributes }[] = [
  { label: 'Enseignant', value: ERoleAttributes.TEACHER },
  { label: 'Directeur', value: ERoleAttributes.DIRECTOR },
  { label: 'Fondateur', value: ERoleAttributes.FOUNDER },
]

/**
 * Utility class for role operations
 */
export class RoleManager {
  /**
   * Gets available role transitions for a given role
   */
  static getAvailableTransitions(currentRole: TRoleAttributes): TRoleAttributes[] {
    const transitions: Record<TRoleAttributes, TRoleAttributes[]> = {
      [ERoleAttributes.FOUNDER]: [ERoleAttributes.TEACHER, ERoleAttributes.DIRECTOR],
      [ERoleAttributes.DIRECTOR]: [ERoleAttributes.TEACHER],
      [ERoleAttributes.TEACHER]: [],
    }

    return transitions[currentRole] || []
  }
}

export interface ISchoolDTO {
  id?: string
  name: string
  code: string
  phone: string
  email: string
  cycleId: string
  imageUrl?: File | string | null
  address?: string
  isTechnicalEducation?: boolean
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}

export interface IParentDTO {
  id?: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  avatarUrl: string | null
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}

export interface IUserProfileDTO extends IParentDTO {
  role: string
  fullName?: string
  school: ISchoolDTO
}

export interface IAttendanceDTO {
  id: string
  studentId: string
  classId: string
  date: string
  from: string
  to: string
  status: 'Present' | 'Absent' | 'Late'
}

export interface IParticipationDTO {
  id: string
  studentId: string
  classId: string
  subjectId: string
  subjectName: string
  note: number
  date: string
}

export interface IControlNoteDTO {
  id?: string
  teacherId: string
  classId: string
  subjectId: string
  subjectName: string
  note: number
  date: string
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}

export interface IStudentDTO {
  id: string
  parentId: string | null
  schoolId: string | null
  classId: string | null
  classroomName?: string | null
  idNumber: string
  firstName: string
  lastName: string
  dateOfBirth?: string | null
  gender: 'M' | 'F'
  address?: string | null
  avatarUrl?: string | null
  createdAt: string | null
  createdBy: string | null
  updatedAt: string | null
  updatedBy: string | null
  parent?: IParentDTO
  controlNotes?: IControlNoteDTO[]
  controlNoteAverage?: number
  participations?: IParticipationDTO[]
  attendances?: IAttendanceDTO[]
  generatedDescriptionBasedOnPerformance?: string
}

export interface IStudentEditingDTO {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  gender: 'M' | 'F'
  address?: string
  avatarUrl?: string
  avatarBase64?: string
}

export interface IStudentFiltersDTO {
  name?: string
  idNumber?: string
  classId?: string
  schoolId?: string
  ageMin?: number
  ageMax?: number
}

export interface IClassDTO {
  id?: string
  name: string
  description?: string | null
  gradeId?: number
  schoolId?: string
  mainTeacherId?: string | null
  mainTeacherName?: string | null
  studentCount?: number
}

export interface IClassFiltersDTO {
  name?: string
  gradeId?: number
  schoolId?: string
  mainTeacherId?: string | null
}

export interface IGradeDTO {
  id?: number
  name: string
}

// TODO: remove this
export interface Class {
  id?: string
  name: string
  count: number
  subclasses: {
    id: string
    name: string
  }[]
}

export enum ECycle {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

/**
 * Represents a schedule entry in the calendar
 * @interface IScheduleCalendarDTO
 */
export interface IScheduleCalendarDTO {
  id: string
  classId: string
  classroomName?: string
  subjectId: string
  subjectName?: string
  teacherId: string
  teacherName?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  room?: string
}

export interface ZError {
  path: (string | number)[]
  message: string
}
