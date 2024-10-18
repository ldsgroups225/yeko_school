<script setup lang="ts">
import type { IClassDTO } from '~~/utils/validators'
import { CLASS_COLUMNS, YEAR_OPTIONS } from '~/constants'

// Store
const classStore = useClassStore()
const { fetchClasses } = classStore
const { classes, isLoading, error } = storeToRefs(classStore)

// State
const selectedYear = ref('2024 2025')
const selectedColumns = ref(CLASS_COLUMNS)
const isLinkModalOpen = ref(false)
const isCreateOrUpdateClassModalOpen = ref(false)
const selectedClassForUpdate = ref<IClassDTO | null>(null)

// Composables
const {
  currentPage,
  itemsPerPage,
  sort,
  selectedRows,
  sortedData,
  paginatedData,
  pageCount,
  pageFrom,
  pageTo,
  onPageChange,
  selectRow,
  searchTerm,
  resetFilters,
  hasNotMainTeacherFilter,
} = useClassTableState<IClassDTO>(classes)

const {
  isConfirmDialogOpen,
  confirmDialogConfig,
} = useConfirmDialog()

// Lifecycle
onMounted(async () => {
  await fetchClasses()
})
</script>

<template>
  <div class="space-y-6 p-6">
    <UAlert v-if="error && !isLinkModalOpen" color="red" icon="i-heroicons-exclamation-triangle" :title="error" />

    <UCard
      :ui="{
        base: '',
        ring: '',
        divide: 'divide-y divide-gray-200 dark:divide-gray-700',
        header: { padding: 'px-4 py-5' },
        body: { padding: '', base: 'divide-y divide-gray-200 dark:divide-gray-700' },
        footer: { padding: 'p-4' },
      }"
    >
      <template #header>
        <ClassListHeader :selected-year="selectedYear" :classes :year-options="YEAR_OPTIONS" @open-create-or-update-class-modal="isCreateOrUpdateClassModalOpen = true" />
      </template>

      <ClassListFilters v-model:search-term="searchTerm" />

      <ClassListControls
        v-model:items-per-page="itemsPerPage"
        v-model:selected-columns="selectedColumns"
        :selected-rows-count="selectedRows.length"
        :search-term="searchTerm"
        :has-not-main-teacher-active="hasNotMainTeacherFilter"
        @reset-filters="resetFilters"
        @has-not-main-teacher-filter="() => hasNotMainTeacherFilter = !hasNotMainTeacherFilter"
      />

      <ClassTable
        v-model:selected-rows="selectedRows"
        v-model:sort="sort"
        :rows="paginatedData"
        :columns="selectedColumns"
        :loading="isLoading"
        :page-from="pageFrom"
        @select="selectRow"
        @show-create-or-update-modal="(cls) => { selectedClassForUpdate = cls; isCreateOrUpdateClassModalOpen = true }"
      />

      <template #footer>
        <ClassListPagination
          v-model="currentPage"
          :page-from="pageFrom"
          :page-to="pageTo"
          :page-count="pageCount"
          :total-items="sortedData.length"
          @change="onPageChange"
        />
      </template>
    </UCard>

    <UModal v-model="isCreateOrUpdateClassModalOpen">
      <ClassForm
        v-if="isCreateOrUpdateClassModalOpen"
        :cls="selectedClassForUpdate as IClassDTO"
        @close="isCreateOrUpdateClassModalOpen = false; selectedClassForUpdate = null"
      />
    </UModal>

    <ConfirmDialog
      v-model="isConfirmDialogOpen"
      :title="confirmDialogConfig.title"
      :message="confirmDialogConfig.message"
      :on-confirm="async () => confirmDialogConfig.onConfirm()"
    />
  </div>
</template>
