<script setup lang="ts">
import { classSchema, type IClassDTO } from '~~/utils/validators'

const { classes } = defineProps<{
  classes?: IClassDTO[]
}>()

const isModalOpen = ref(false)
const modalMode = ref<'upload' | 'download'>('upload')

function openModal(mode: 'upload' | 'download') {
  modalMode.value = mode
  isModalOpen.value = true
}

async function handleClassUpload(data: IClassDTO[]) {
  try {
    // Here you would typically send the data to your backend API
    console.log('Uploading user data:', data)
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Class data uploaded successfully')
  }
  catch (error) {
    console.error('Error uploading user data:', error)
    throw error
  }
}

async function handleClassDownload(): Promise<IClassDTO[]> {
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
