<script setup lang="ts">
import type { z } from 'zod'

const props = defineProps<{
  schema: z.ZodObject<any, any, any, any>
  onUpload: (data: any[]) => Promise<void>
  onDownload: () => Promise<any[]>
  isOpen: boolean
  mode: 'upload' | 'download'
}>()

const emit = defineEmits(['close'])

const isUploading = ref(false)
const isDownloading = ref(false)

const {
  parsedData,
  errors,
  fileError,
  validationMessage,
  getRootProps,
  getInputProps,
  isDragActive,
  columns,
  errorRows,
} = useDataImport(props.schema)

const { exportToCsv } = useDataExport()

async function handleUpload() {
  if (errors.value.length > 0) {
    validationMessage.value = {
      type: 'error',
      title: 'Erreur de validation',
      description: 'Oups, veuillez corriger les erreurs avant de sauvegarder.',
    }
    return
  }

  if (parsedData.value.length === 0) {
    validationMessage.value = {
      type: 'error',
      title: 'Aucune donnée',
      description: 'Il n\'y a pas de données à sauvegarder. Veuillez d\'abord uploader un fichier.',
    }
    return
  }

  isUploading.value = true
  try {
    await props.onUpload(parsedData.value)
    validationMessage.value = {
      type: 'success',
      title: 'Sauvegarde réussie',
      description: 'Vos données ont été sauvegardées avec succès.',
    }
    parsedData.value = []
    errors.value = []
    emit('close')
  }
  catch (error) {
    validationMessage.value = {
      type: 'error',
      title: 'Erreur de sauvegarde',
      description: `Une erreur s'est produite lors de la sauvegarde de vos données : ${(error as Error).message}`,
    }
  }
  finally {
    isUploading.value = false
  }
}

async function handleDownload() {
  isDownloading.value = true
  try {
    const data = await props.onDownload()
    const result = exportToCsv(data)
    if (!result.success) {
      validationMessage.value = {
        type: 'error',
        title: 'Erreur d\'exportation',
        description: result.message,
      }
    }
    else {
      emit('close')
    }
  }
  catch (error) {
    validationMessage.value = {
      type: 'error',
      title: 'Erreur de téléchargement',
      description: `Une erreur s'est produite lors du téléchargement des données : ${(error as Error).message}`,
    }
  }
  finally {
    isDownloading.value = false
  }
}

const modalTitle = computed(() => props.mode === 'upload' ? 'Importer les données' : 'Exporter les données')
</script>

<template>
  <UModal :model-value="isOpen" @close="emit('close')">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            {{ modalTitle }}
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="emit('close')" />
        </div>
      </template>

      <div v-if="mode === 'upload'" class="p-4">
        <div v-bind="getRootProps()" class="border-2 border-dashed p-4 mb-4 text-center cursor-pointer">
          <input v-bind="getInputProps()">
          <p v-if="isDragActive">
            Déposez le fichier ici ...
          </p>
          <p v-else>
            Glissez-déposez un fichier CSV, Excel ou JSON ici, ou cliquez pour en sélectionner un
          </p>
        </div>

        <UAlert v-if="fileError" color="red" variant="solid" class="mb-4" :title="fileError.title" :description="fileError.description || ''" />

        <UAlert v-if="validationMessage" :color="validationMessage.type === 'success' ? 'green' : 'red'" variant="solid" class="mb-4" :title="validationMessage.title" :description="validationMessage.description || ''" />

        <UAlert v-if="errors.length > 0" color="yellow" variant="solid" class="mb-4" title="Erreurs d'analyse CSV">
          <template #description>
            <ul>
              <li v-for="(error, index) in errors" :key="index">
                Ligne {{ error.row ?? 0 + 1 }}: {{ error.message }} (Type: {{ error.type }}, Code: {{ error.code }})
              </li>
            </ul>
          </template>
        </UAlert>

        <template v-if="parsedData.length > 0">
          <UTable :rows="parsedData" :columns="columns">
            <template #default="{ row, index }">
              <tr :class="{ 'bg-red-100': errorRows.has(index + 1) }">
                <td v-for="column in columns" :key="column.key">
                  {{ row[column.key] }}
                </td>
              </tr>
            </template>
          </UTable>
        </template>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton color="gray" variant="soft" @click="emit('close')">
            Annuler
          </UButton>
          <UButton v-if="mode === 'upload'" :loading="isUploading" :disabled="isUploading || errors.length > 0" @click="handleUpload">
            {{ isUploading ? 'Sauvegarde en cours...' : 'Sauvegarder les données' }}
          </UButton>
          <UButton v-else :loading="isDownloading" :disabled="isDownloading" @click="handleDownload">
            {{ isDownloading ? 'Téléchargement en cours...' : 'Télécharger les données' }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
