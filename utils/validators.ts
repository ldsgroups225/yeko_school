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

export type IClassDTO = z.infer<typeof classSchema>

export const updateClassSchema = classSchema.partial().refine(data => Object.values(data).some(value => value !== undefined), {
  message: 'Il faut au moins un champ à mettre à jour',
})

export type IUpdateClassDTO = z.infer<typeof updateClassSchema>
