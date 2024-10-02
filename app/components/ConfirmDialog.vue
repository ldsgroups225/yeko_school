<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => Promise<void>
  onCancel?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirmer',
  cancelText: 'Annuler',
  onCancel: () => {},
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const isLoading = ref(false)

const isOpenComputed = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

async function handleConfirm() {
  isLoading.value = true
  try {
    await props.onConfirm()
  }
  catch (error) {
    console.error('Error during confirmation:', error)
  }
  finally {
    isLoading.value = false
    isOpenComputed.value = false
  }
}

function handleCancel() {
  props.onCancel()
  isOpenComputed.value = false
}
</script>

<template>
  <UModal v-model="isOpenComputed" :prevent-close="true" :ui="{ wrapper: 'z-[9999]' }">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            {{ title }}
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="handleCancel"
          />
        </div>
      </template>

      <div class="py-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ message }}
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton
            color="black"
            variant="soft"
            :disabled="isLoading"
            @click="handleCancel"
          >
            {{ cancelText }}
          </UButton>
          <UButton
            color="primary"
            :loading="isLoading"
            :disabled="isLoading"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
