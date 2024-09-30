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
    [ERole.TEACHER]: 'Teacher',
    [ERole.DIRECTOR]: 'Director',
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

export interface ISchoolDTO {
  id: string
  name: string
  code: string
  cycleId: string
  imageUrl: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
}

export interface IUserProfileDTO {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  fullName?: string
  phoneNumber?: string
  avatar?: string | null
  school: ISchoolDTO
}

export interface IStudentDTO {
  id: string
  parentId: string
  schoolId: string | null
  classId: string | null
  className: string | null
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
