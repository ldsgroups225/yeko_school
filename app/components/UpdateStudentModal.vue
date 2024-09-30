<script setup lang="ts">
import type { IStudentDTO, IStudentEditingDTO } from '~~/types'
import { z } from 'zod'

/**
 * Props and emits definition
 */
const { student } = defineProps<{
  student: IStudentDTO
}>()

const emit = defineEmits(['close'])

/**
 * Store setup
 */
const studentStore = useStudentStore()
const { updateStudent } = studentStore
const { error, isLoading } = storeToRefs(studentStore)

const localError = ref('')

/**
 * Initial form and gender options
 */
let initialForm: IStudentEditingDTO

const form = ref<IStudentEditingDTO>({
  firstName: '',
  lastName: '',
  gender: 'M',
  address: '',
  avatarUrl: '',
  avatarBase64: '',
})

const genderOptions = [
  { label: 'Masculin', value: 'M' },
  { label: 'Féminin', value: 'F' },
]

/**
 * Schema for student update validation
 */
const updateStudentSchema = z.object({
  firstName: z.string().min(2, 'Le prénom ne peut pas être vide').max(50, 'Le prénom doit faire moins de 50 caractères').optional(),
  lastName: z.string().min(2, 'Le nom ne peut pas être vide').max(50, 'Le nom doit faire moins de 50 caractères').optional(),
  gender: z.enum(['M', 'F'], { message: 'Le genre doit être "Masculin" ou "Féminin"' }).optional(),
  address: z.string().optional(),
  avatarUrl: z.string().optional(),
  avatarBase64: z.string().optional(),
}).refine(data => Object.values(data).some(value => value !== undefined), {
  message: 'Il faut au moins un champ à mettre à jour',
})

/**
 * Computed property to check form validity
 */
const isFormValid = computed(() => updateStudentSchema.safeParse(form.value).success)

/**
 * Initialize form with student data on mount
 */
onMounted(() => {
  const { firstName, lastName, gender, address, avatarUrl } = student
  initialForm = {
    firstName,
    lastName,
    gender,
    address: address || '',
    avatarUrl: avatarUrl || '',
    avatarBase64: avatarUrl || '',
  }
  form.value = { ...initialForm }
})

/**
 * Submit form and update student if changes are detected
 * @returns {Promise<void>}
 */
async function handleSubmit() {
  if (!isFormValid.value) {
    localError.value = 'Veuillez remplir tous les champs obligatoires.'
    return
  }

  try {
    const changedFields = getChangedFields()

    if (Object.keys(changedFields).length === 0) {
      localError.value = 'Aucune modification détectée.'
      return
    }

    const success = await updateStudent(student.id, changedFields)
    success ? emit('close') : handleError()
  }
  catch {
    handleError()
  }
}

/**
 * Get changed fields by comparing current form data with initial form data
 * @returns {Partial<IStudentEditingDTO>}
 */
function getChangedFields(): Partial<IStudentEditingDTO> {
  return Object.entries(form.value).reduce((acc, [key, currentValue]) => {
    const typedKey = key as keyof IStudentEditingDTO
    if (currentValue !== initialForm[typedKey]) {
      acc[typedKey] = currentValue as any
    }
    return acc
  }, {} as Partial<IStudentEditingDTO>)
}

/**
 * Handle errors and display appropriate message
 */
function handleError() {
  localError.value = error.value || 'Une erreur est survenue lors de la mise à jour de l\'élève.'
}
</script>

<template>
  <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          Modifier l'élève
        </h3>
        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="$emit('close')" />
      </div>
    </template>
    <div class="p-4 space-y-4">
      <div class="flex justify-center">
        <AvatarUploader
          v-model="form.avatarBase64!"
          size="3xl"
        />
      </div>

      <UFormGroup label="Prénom" required>
        <UInput v-model="form.firstName" />
      </UFormGroup>

      <UFormGroup label="Nom" required>
        <UInput v-model="form.lastName" />
      </UFormGroup>

      <UFormGroup label="Genre" required>
        <URadioGroup v-model="form.gender" :options="genderOptions" />
      </UFormGroup>

      <UFormGroup label="Adresse">
        <UTextarea v-model="form.address" />
      </UFormGroup>

      <UAlert v-if="localError || error" color="red" icon="i-heroicons-exclamation-triangle" :title="localError" />
    </div>
    <template #footer>
      <div class="flex justify-end space-x-3">
        <UButton color="gray" variant="soft" @click="$emit('close')">
          Annuler
        </UButton>
        <UButton color="primary" :loading="isLoading" :disabled="!isFormValid" @click="handleSubmit">
          Mettre à jour
        </UButton>
      </div>
    </template>
  </UCard>
</template>
