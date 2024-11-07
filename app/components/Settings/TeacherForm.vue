<script setup lang="ts">
import { type ITeacherForm, teacherFormSchema } from '~~/utils/validators'

interface ZError {
  path: (string | number)[]
  message: string
}

const toast = useToast()
const userStore = useUserStore()
const { register } = userStore
const { error: errorUserStore } = storeToRefs(userStore)

const isSubmitting = ref(false)
const errors = ref<ZError[]>([])

const teacherForm = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
})

function getFieldErrorIfExists(field: keyof ITeacherForm): string {
  const fieldError = errors.value.find(error => error.path.includes(field))
  return fieldError?.message ?? ''
}

async function handleSubmit() {
  const result = await teacherFormSchema.safeParseAsync(teacherForm)

  if (!result.success) {
    errors.value = result.error.errors.map(error => ({ path: error.path, message: error.message }))
    return
  }

  const response = await register({
    email: teacherForm.email,
    password: teacherForm.password,
    phone: teacherForm.phone,
    firstName: teacherForm.firstName,
    lastName: teacherForm.lastName,
    confirmPassword: teacherForm.confirmPassword,
  })

  if (response && !errorUserStore.value) {
    toast.add({
      title: 'Succès',
      description: 'Ce compte professeur a bien été créé, vérifiez votre boîte mail pour le lien de confirmation.',
      color: 'emerald',
      icon: 'heroicons:check-circle',
    })
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          Création d'un compte professeur
        </h3>

        <UAlert v-if="errors.length" color="red" icon="i-heroicons-exclamation-triangle" :title="errors.map(error => error.message).join(', ')" />
      </template>
      <div class="p-4 space-y-4">
        <div class="flex w-full gap-x-2">
          <UFormGroup label="Prénom" required class="w-full" :error="getFieldErrorIfExists('firstName')">
            <UInput v-model="teacherForm.firstName" />
          </UFormGroup>

          <UFormGroup label="Nom de famille" required class="w-full" :error="getFieldErrorIfExists('lastName')">
            <UInput v-model="teacherForm.lastName" />
          </UFormGroup>
        </div>
        <UFormGroup label="Numéro de téléphone" required :error="getFieldErrorIfExists('phone')">
          <UInput v-model="teacherForm.phone" />
        </UFormGroup>

        <UFormGroup label="Email" required :error="getFieldErrorIfExists('email')">
          <UInput v-model="teacherForm.email" />
        </UFormGroup>

        <UFormGroup label="Mot de passe" required :error="getFieldErrorIfExists('password')">
          <UInput v-model="teacherForm.password" />
        </UFormGroup>

        <UFormGroup label="Confirmez votre mot de passe" required :error="getFieldErrorIfExists('confirmPassword')">
          <UInput v-model="teacherForm.confirmPassword" />
        </UFormGroup>
      </div>

      <template #footer>
        <UButton color="primary" :loading="isSubmitting" :disabled="isSubmitting" @click="handleSubmit">
          Créer
        </UButton>
      </template>
    </UCard>
  </div>
</template>
