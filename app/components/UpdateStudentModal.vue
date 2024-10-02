<script setup lang="ts">
import type { IStudentDTO, IStudentEditingDTO } from '~~/types'
import { z } from 'zod'

const props = defineProps<{
  student: IStudentDTO
}>()

const emit = defineEmits(['close'])

const studentStore = useStudentStore()
const { updateStudent } = studentStore
const { error, isLoading } = storeToRefs(studentStore)

const localError = ref('')
const isConfirmationModalOpen = ref(false)

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

const isFormValid = computed(() => updateStudentSchema.safeParse(form.value).success)

onMounted(() => {
  const { firstName, lastName, gender, address, avatarUrl } = props.student
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

function openConfirmationModal() {
  if (!isFormValid.value) {
    localError.value = 'Veuillez remplir tous les champs obligatoires.'
    return
  }
  isConfirmationModalOpen.value = true
}

async function handleSubmit() {
  try {
    const changedFields = getChangedFields()

    if (Object.keys(changedFields).length === 0) {
      localError.value = 'Aucune modification détectée.'
      return
    }

    const success = await updateStudent(props.student.id, changedFields)
    if (success) {
      emit('close')
    }
    else {
      handleError()
    }
  }
  catch {
    handleError()
  }
}

function getChangedFields(): Partial<IStudentEditingDTO> {
  return Object.entries(form.value).reduce((acc, [key, currentValue]) => {
    const typedKey = key as keyof IStudentEditingDTO
    if (currentValue !== initialForm[typedKey]) {
      acc[typedKey] = currentValue as any
    }
    return acc
  }, {} as Partial<IStudentEditingDTO>)
}

function handleError() {
  localError.value = error.value || 'Une erreur est survenue lors de la mise à jour de l\'élève.'
}

function handleConfirmationModalClose(value: boolean) {
  isConfirmationModalOpen.value = value
  if (!value) {
    localError.value = ''
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
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
          <UButton color="black" variant="soft" @click="$emit('close')">
            Annuler
          </UButton>
          <UButton color="primary" :loading="isLoading" :disabled="!isFormValid" @click="openConfirmationModal">
            Mettre à jour
          </UButton>
        </div>
      </template>
    </UCard>

    <ConfirmDialog
      v-model="isConfirmationModalOpen"
      title="Confirmer la mise à jour"
      message="Êtes-vous sûr de vouloir mettre à jour les informations de cet élève ?"
      :on-confirm="handleSubmit"
      @update:model-value="handleConfirmationModalClose"
    />
  </div>
</template>
