<script setup lang="ts">
const props = defineProps<{
  studentId: string
  studentName: string
}>()

const emit = defineEmits(['close'])

const otp = ref('')
const isLoading = ref(false)
const localError = ref('')
const isConfirmationModalOpen = ref(false)

const studentStore = useStudentStore()
const { linkStudentAndParent, clearError } = studentStore
const { error } = storeToRefs(studentStore)

function openConfirmationModal() {
  if (otp.value.length !== 6) {
    localError.value = 'Le code OTP doit contenir 6 chiffres.'
    return
  }
  isConfirmationModalOpen.value = true
}

async function submitOTP() {
  isLoading.value = true
  localError.value = ''
  try {
    const success = await linkStudentAndParent({
      studentId: props.studentId,
      otp: otp.value,
    })
    if (success) {
      clearError()
      emit('close')
    }
    else {
      localError.value = error.value || 'Une erreur est survenue lors de la liaison.'
    }
  }
  catch (e) {
    const _e = e
    localError.value = 'Une erreur inattendue est survenue.'
  }
  finally {
    isLoading.value = false
    isConfirmationModalOpen.value = false
  }
}

function handleComplete(value: string) {
  otp.value = value
}

function handleConfirmationModalClose(value: boolean) {
  isConfirmationModalOpen.value = value
  if (!value) {
    localError.value = ''
  }
}
</script>

<template>
  <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          {{ studentName }}
        </h3>
        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="$emit('close')" />
      </div>
    </template>
    <div class="p-4">
      <p class="mb-4">
        Entrez le code OTP pour lier l'élève à son parent.
      </p>
      <CustomPinInput
        :length="6"
        placeholder="○"
        @complete="handleComplete"
      />
      <UAlert v-if="localError" color="red" icon="i-heroicons-exclamation-triangle" :title="localError" class="mt-4" />
    </div>
    <template #footer>
      <div class="flex justify-end space-x-3">
        <UButton color="black" variant="soft" @click="$emit('close')">
          Annuler
        </UButton>
        <UButton color="primary" :loading="isLoading" @click="openConfirmationModal">
          Lier
        </UButton>
      </div>
    </template>
  </UCard>

  <ConfirmDialog
    v-model="isConfirmationModalOpen"
    title="Confirmer la liaison"
    message="Êtes-vous sûr de vouloir lier cet élève à son parent avec le code OTP fourni ?"
    :on-confirm="submitOTP"
    @update:model-value="handleConfirmationModalClose"
  />
</template>
