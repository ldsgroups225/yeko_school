<script setup lang="ts">
import type { IStudentEditingDTO } from '~~/types'

const props = defineProps<{
  student: IStudentEditingDTO
  isUpdating: boolean
}>()

const emit = defineEmits<{
  (e: 'update', form: IStudentEditingDTO): void
  (e: 'close'): void
}>()

const isOpen = defineModel<boolean>({
  default: false,
})

const form = ref<IStudentEditingDTO>({ ...props.student })

function handleSubmit() {
  emit('update', form.value)
}
</script>

<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">
          Modifier le profil
        </h3>
      </template>
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Prénom" name="firstName">
            <UInput v-model="form.firstName" placeholder="Prénom" />
          </UFormGroup>
          <UFormGroup label="Nom" name="lastName">
            <UInput v-model="form.lastName" placeholder="Nom" />
          </UFormGroup>
          <UFormGroup label="Date de naissance" name="dateOfBirth">
            <UInput v-model="form.dateOfBirth" type="date" />
          </UFormGroup>
          <UFormGroup label="Genre" name="gender">
            <USelect
              v-model="form.gender" :options="[
                { label: 'Masculin', value: 'M' },
                { label: 'Féminin', value: 'F' },
              ]"
            />
          </UFormGroup>
          <UFormGroup label="Adresse" name="address" class="col-span-2">
            <UTextarea v-model="form.address" placeholder="Adresse" />
          </UFormGroup>
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <UButton color="gray" @click="emit('close')">
            Annuler
          </UButton>
          <UButton type="submit" color="primary" :loading="isUpdating">
            Sauvegarder
          </UButton>
        </div>
      </form>
    </UCard>
  </UModal>
</template>
