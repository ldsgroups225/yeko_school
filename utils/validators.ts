import { z } from 'zod'

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
    .refine(val => val.trim().length > 0 || val === null, {
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
  className: z
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

export type IStudentImportDTO = z.infer<typeof studentImportDTOSchema>
