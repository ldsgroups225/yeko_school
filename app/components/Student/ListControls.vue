<script setup lang="ts">
import type { IStudentDTO } from '~~/types'
import { STUDENT_COLUMNS } from '~/constants'

const props = defineProps<{
  itemsPerPage: number
  selectedRows: IStudentDTO[]
  searchTerm: string
  selectedClasses: string[]
  hasNotParentFilterActive: boolean
  hasNotClassFilterActive: boolean
}>()

const emit = defineEmits<{
  (e: 'update:itemsPerPage', value: number): void
  (e: 'update:selectedColumns', value: typeof STUDENT_COLUMNS): void
  (e: 'resetFilters'): void
  (e: 'hasNotParentFilter'): void
  (e: 'hasNotClassFilter'): void
}>()

const { removeStudentsFromClass, removeStudentsFromSchool } = useStudentStore()
const selectedColumns = defineModel<typeof STUDENT_COLUMNS>('selectedColumns', { default: STUDENT_COLUMNS })

const {
  isConfirmDialogOpen,
  confirmDialogConfig,
  openConfirmDialog,
} = useConfirmDialog()

const groupedActionDropdownItems = computed(() => [
  [
    {
      label: 'Les retirer de la classe',
      icon: 'i-heroicons-trash',
      click: () => openConfirmDialog({
        title: 'Confirmer le retrait de la classe',
        message: `Êtes-vous sûr de vouloir retirer ces ${props.selectedRows.length} élèves de leur classe actuelle ?`,
        onConfirm: handleRemoveStudentsFromClass,
      }),
    },
    {
      label: 'Les retirer de l\'école',
      icon: 'i-heroicons-trash',
      click: () => openConfirmDialog({
        title: 'Confirmer le retrait de l\'école',
        message: `Êtes-vous sûr de vouloir retirer ces ${props.selectedRows.length} élèves de l'école ? Cette action est irréversible.`,
        onConfirm: handleRemoveStudentsFromSchool,
      }),
    },
  ],
])

async function handleRemoveStudentsFromClass() {
  await removeStudentsFromClass({ students: props.selectedRows })
}

async function handleRemoveStudentsFromSchool() {
  await removeStudentsFromSchool({ students: props.selectedRows })
}
</script>

<template>
  <div class="flex justify-between items-center w-full px-4 py-3">
    <div class="flex items-center gap-1.5">
      <span class="text-sm leading-5">Lignes par page:</span>
      <USelect
        :model-value="parseInt(itemsPerPage.toString(), 10)"
        :options="[5, 10, 20, 30, 50]"
        class="me-2 w-20"
        size="xs"
        @update:model-value="(value) => emit('update:itemsPerPage', parseInt(value, 10))"
      />
    </div>
    <div class="flex gap-1.5 items-center">
      <UButton leading-icon="i-carbon-user-favorite" trailing :color="!hasNotParentFilterActive ? 'black' : 'blue'" variant="outline" size="xs" label="Pas de parent" @click="emit('hasNotParentFilter')" />
      <UButton leading-icon="i-heroicons-link-slash" trailing :color="!hasNotClassFilterActive ? 'black' : 'blue'" variant="outline" size="xs" label="Pas de classe" @click="emit('hasNotClassFilter')" />
      <UDropdown v-if="selectedRows.length > 1" :items="groupedActionDropdownItems">
        <UButton
          icon="i-heroicons-chevron-down"
          trailing
          color="gray"
          size="xs"
        >
          Actions groupées
        </UButton>
      </UDropdown>
      <USelectMenu
        v-model="selectedColumns"
        :options="STUDENT_COLUMNS"
        multiple
        @update:model-value="(value) => emit('update:selectedColumns', value)"
      >
        <UButton
          icon="i-heroicons-view-columns"
          color="gray"
          size="xs"
        >
          Colonnes
        </UButton>
      </USelectMenu>
      <UButton
        icon="i-heroicons-funnel"
        color="gray"
        size="xs"
        :disabled="searchTerm === '' && selectedClasses.length === 0"
        @click="emit('resetFilters')"
      >
        Réinitialiser
      </UButton>
    </div>

    <ConfirmDialog
      v-model="isConfirmDialogOpen"
      :title="confirmDialogConfig.title"
      :message="confirmDialogConfig.message"
      :on-confirm="async () => confirmDialogConfig.onConfirm()"
    />
  </div>
</template>
