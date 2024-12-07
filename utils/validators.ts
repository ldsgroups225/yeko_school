import { z } from 'zod'
import { parseTime } from '~~/utils/dateTime'
import { dayOfWeekMap } from '~~/utils/mapDaysOfTheWeek'

export const updateStudentSchema = z.object({
  firstName: z.string().min(2, 'Le prénom ne peut pas être vide').max(50, 'Le prénom doit faire moins de 50 caractères').optional(),
  lastName: z.string().min(2, 'Le nom ne peut pas être vide').max(50, 'Le nom doit faire moins de 50 caractères').optional(),
  gender: z.enum(['M', 'F'], { message: 'Le genre doit être "Masculin" ou "Féminin"' }).optional(),
  classId: z.string().uuid('Cette classe n\'existe pas').nullish(),
  schoolId: z.string().uuid('Cette école n\'existe pas').nullish(),
  address: z.string().optional(),
  avatarUrl: z.string().optional(),
  avatarBase64: z.string().optional(),
}).refine(data => Object.values(data).some(value => value !== undefined), {
  message: 'Il faut au moins un champ à mettre à jour',
})

export type IEditingStudentDTO = z.infer<typeof updateStudentSchema>

export const classSchema = z.object({
  id: z.string().uuid('Cette classe n\'existe pas').optional(),
  schoolId: z.string().uuid('Cette école n\'existe pas'),
  gradeId: z.number().int('L\'identifiant du niveau doit être un entier').positive('L\'identifiant du niveau doit être positif'),
  name: z.string().min(2, 'Le nom de la classe ne peut pas être vide').max(50, 'Le nom de la classe doit faire moins de 50 caractères'),
  mainTeacherId: z.string().uuid('Cet enseignant n\'existe pas').optional().nullable(),
  mainTeacherName: z.string().optional(),
  studentCount: z.number().int().optional(),
})

export type ICreateClassDTO = z.infer<typeof classSchema>

export const updateClassSchema = classSchema.partial().refine(data => Object.values(data).some(value => value !== undefined), {
  message: 'Il faut au moins un champ à mettre à jour',
})

export type IUpdateClassDTO = z.infer<typeof updateClassSchema>

function refineStringAndNullify(schema: z.ZodString) {
  return schema
    .refine(val => val.trim().length > 0 || false, {
      message: 'La chaîne ne peut pas être vide.',
    })
    .transform(val => (val?.trim().length === 0 ? null : val))
}

function capitalize(str: string) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const frenchErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === 'invalid_string') {
    if (issue.validation === 'email') {
      return { message: 'Adresse e-mail invalide.' }
    }
    if (issue.validation === 'url') {
      return { message: 'URL invalide.' }
    }
  }
  if (issue.code === 'too_small') {
    return { message: `Minimum ${issue.minimum} caractère(s).` }
  }
  return { message: ctx.defaultError }
}

// Set the error map globally
z.setErrorMap(frenchErrorMap)

export const studentImportDTOSchema = z.object({
  idNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, { message: 'Le numéro d\'identification doit contenir au moins 2 caractères.' }),
  firstName: z
    .string()
    .trim()
    .min(2, { message: 'Le prénom doit contenir au moins 2 caractères.' })
    .transform(capitalize),
  classroomName: z
    .string()
    .trim()
    .min(2, { message: 'Le nom de la classe doit contenir au moins 2 caractères.' })
    .nullish(),
  lastName: z
    .string()
    .trim()
    .min(2, { message: 'Le nom de famille doit contenir au moins 2 caractères.' })
    .transform(capitalize),
  dateOfBirth: z
    .string()
    .nullable()
    .optional()
    .refine((val) => {
      if (val) {
        const [day, month, year] = val.split('/')
        const dob = new Date(`${year}-${month}-${day}`)

        if (Number.isNaN(dob.getTime())) {
          return false // Invalid date string
        }
        const nineYearsAgo = new Date()
        nineYearsAgo.setFullYear(nineYearsAgo.getFullYear() - 9)
        return dob <= nineYearsAgo
      }
      return true // Allow null/undefined
    }, {
      message: 'L\'élève doit avoir au moins 9 ans.',
    }),
  gender: z
    .string()
    .trim()
    .toUpperCase()
    .refine(val => ['M', 'F'].includes(val), {
      message: 'Le genre doit être M, F ou O.',
    }),
  address: refineStringAndNullify(z.string()).nullish(),
  avatarUrl: z.string().nullish(),
})

export const scheduleCreationSchema = z.object({
  classId: z.string().uuid('Cette classe n\'existe pas').min(1, { message: 'Veillez sélectionner une classe.' }),
  startTime: z.string().min(5, { message: 'L\'heure de début doit contenir au moins 5 caractères.' }).transform(val => val.trim()),
  endTime: z.string().min(5, { message: 'L\'heure de fin doit contenir au moins 5 caractères.' }).transform(val => val.trim()),
  dayOfWeek: z
    .union([z.string(), z.number()])
    .transform(val => Number(val))
    .refine(val => val !== undefined, { message: 'Le jour de la semaine est invalide.' }),
  subjectId: z.string({ required_error: 'Veuillez sélectionner une matière valide.' })
    .uuid('Veuillez sélectionner une matière valide.')
    .min(1, { message: 'Veuillez sélectionner une matière valide.' }),
  teacherId: z.string().uuid('Cet enseignant n\'existe pas'),
  room: refineStringAndNullify(z.string()).nullish(),
})

export type IScheduleCreationDTO = z.infer<typeof scheduleCreationSchema>

export const scheduleImportDTOSchema = z.object({
  className: z.string().min(2, { message: 'Le nom de la classe doit contenir au moins 2 caractères.' }).transform(val => val.trim()),
  dayOfWeek: z
    .string()
    .transform(val => dayOfWeekMap[val])
    .refine(val => val !== undefined, { message: 'Le jour de la semaine est invalide.' }),
  startTime: z
    .string()
    .refine(val => parseTime(val) !== null, { message: 'L\'heure de début est invalide.' }),
  endTime: z
    .string()
    .refine(val => parseTime(val) !== null, { message: 'L\'heure de fin est invalide.' }),
  subjectName: z.string().min(2, { message: 'Le nom de la matière doit contenir au moins 2 caractères.' }).transform(val => val.trim()),
  teacherEmail: z.string().email({ message: 'Adresse e-mail invalide.' }).transform(val => val.trim().toLowerCase()),
  room: refineStringAndNullify(z.string()).nullish(),
})

export type IStudentImportDTO = z.infer<typeof studentImportDTOSchema>
export type IScheduleImportDTO = z.infer<typeof scheduleImportDTOSchema>

export const teacherFormSchema = z.object({
  firstName: z.string({
    required_error: 'Le prénom est obligatoire.',
  }).min(2, 'Le prenom doit contenir au moins 2 caractères.'),
  lastName: z.string({
    required_error: 'Le nom de famille est obligatoire.',
  }).min(2, 'Le nom de famille doit contenir au moins 2 caractères.'),
  phone: z.string({
    required_error: 'Le numéro de téléphone est obligatoire.',
  }).min(10, 'Le numéro de téléphone doit contenir au moins 10 caractères.'),
  email: z.string({
    required_error: 'L\'adresse email est obligatoire.',
  }).email('L\'adresse email n\'est pas valide.'),
  password: z.string({
    required_error: 'Le mot de passe est obligatoire.',
  }).min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
  confirmPassword: z.string({
    required_error: 'Confirmez votre mot de passe.',
  }).min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas.',
  path: ['confirmPassword'],
})

export type ITeacherForm = z.infer<typeof teacherFormSchema>
