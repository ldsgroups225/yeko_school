<script setup lang="ts">
const router = useRouter()

const isModalOpen = ref(false)
const modalMode = ref<'upload' | 'download'>('upload')

function openModal(mode: 'upload' | 'download') {
  modalMode.value = mode
  isModalOpen.value = true
}
</script>

<template>
  <div class="flex space-x-2">
    <UTooltip text="Exporter les données" :popper="{ placement: 'bottom' }">
      <UButton variant="soft" icon="i-clarity-upload-cloud-line" @click="openModal('download')" />
    </UTooltip>
    <UTooltip text="Importer les données" :popper="{ placement: 'bottom' }">
      <UButton variant="soft" icon="i-clarity-download-line" @click="router.push('/students/upload')" />
    </UTooltip>
  </div>
</template>
