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
