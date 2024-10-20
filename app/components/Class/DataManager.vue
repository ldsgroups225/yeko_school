<script setup lang="ts">
import { classSchema, type ICreateClassDTO } from '~~/utils/validators'

const { classes } = defineProps<{
  classes?: ICreateClassDTO[]
}>()

const isModalOpen = ref(false)
const modalMode = ref<'upload' | 'download'>('upload')

function openModal(mode: 'upload' | 'download') {
  modalMode.value = mode
  isModalOpen.value = true
}

async function handleClassUpload(data: ICreateClassDTO[]) {
  const _data = data // TODO: remove it
  try {
    // Here you would typically send the data to your backend API
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  catch (error) {
    console.error('Error uploading user data:', error)
    throw error
  }
}

async function handleClassDownload(): Promise<ICreateClassDTO[]> {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return classes ?? []
  }
  catch (error) {
    console.error('Error downloading user data:', error)
    throw error
  }
}
</script>

<template>
  <div>
    <div class="flex space-x-2">
      <UTooltip text="Exporter les données" :popper="{ placement: 'bottom' }">
        <UButton variant="soft" icon="i-clarity-upload-cloud-line" @click="openModal('download')" />
      </UTooltip>
      <UTooltip text="Importer les données" :popper="{ placement: 'bottom' }">
        <UButton variant="soft" icon="i-clarity-download-line" @click="openModal('upload')" />
      </UTooltip>
    </div>

    <DataUploaderModal
      :schema="classSchema"
      :on-upload="handleClassUpload"
      :on-download="handleClassDownload"
      :is-open="isModalOpen"
      :mode="modalMode"
      @close="isModalOpen = false"
    />
  </div>
</template>
