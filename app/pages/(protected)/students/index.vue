<script setup lang="ts">
import type { IStudentDTO } from '~~/types'
import { formatDate, getAge } from '~~/utils/dateTime.js'
import { STUDENT_COLUMNS, YEAR_OPTIONS } from '~/constants'

// Store
const { userData } = useUserStore()
const studentStore = useStudentStore()
const { fetchStudents, updateStudent } = studentStore
const { students, isLoading, error } = storeToRefs(studentStore)

// State
const { data: classes, status: classFetchingStatus } = useFetch('/api/classes/classes_grouped_by_grade', { params: { schoolId: userData?.school?.id } })
const selectedYear = ref('2024 2025')
const selectedColumns = ref(STUDENT_COLUMNS)
const isLinkModalOpen = ref(false)
const selectedStudentForLink = ref<{ id: string, name: string } | null>(null)
const isUpdateModalOpen = ref(false)
const selectedStudentForUpdate = ref<IStudentDTO | null>(null)

// Composables
const {
  currentPage,
  itemsPerPage,
  sort,
  selectedRows,
  paginatedData,
  pageCount,
  pageFrom,
  pageTo,
  onPageChange,
  selectRow,
  searchTerm,
  selectedClasses,
  resetFilters,
  hasNotParentFilter,
  hasNotClassFilter,
} = useTableState<IStudentDTO>(students)

const {
  isConfirmDialogOpen,
  confirmDialogConfig,
  openConfirmDialog,
} = useConfirmDialog()

// Methods
function toggleSubclassSelection(subclassValue: string) {
  selectedClasses.value = selectedClasses.value.includes(subclassValue)
    ? selectedClasses.value.filter(c => c !== subclassValue)
    : [...selectedClasses.value, subclassValue]
}

function handleRemoveStudentFromClass(studentId: string) {
  return openConfirmDialog({
    title: 'Confirmer le retrait de la classe',
    message: 'Êtes-vous sûr de vouloir retirer cet élève de sa classe actuelle ?',
    onConfirm: () => updateStudent(studentId, { classId: null }),
  })
}

function handleRemoveStudentFromSchool(studentId: string) {
  return openConfirmDialog({
    title: 'Confirmer le retrait de l\'école',
    message: 'Êtes-vous sûr de vouloir retirer cet élève de l\'école ? Cette action est irréversible.',
    onConfirm: () => updateStudent(studentId, { schoolId: null }),
  })
}

// Computed
const gradeHasSelectedSubclass = computed(() => {
  return (grade: { subclasses: { id: string }[] }) => {
    return grade.subclasses.some(subclass => selectedClasses.value.includes(subclass.id))
  }
})

// Lifecycle
onMounted(async () => {
  await fetchStudents()
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
        <StudentListHeader :selected-year="selectedYear" :year-options="YEAR_OPTIONS" />
      </template>

      <StudentListFilters
        v-model:search-term="searchTerm"
        :classes="classes?.data"
        :selected-classes="selectedClasses"
        :grade-has-selected-subclass="gradeHasSelectedSubclass"
        @toggle-subclass="toggleSubclassSelection"
      />

      <StudentListControls
        v-model:items-per-page="itemsPerPage"
        v-model:selected-columns="selectedColumns"
        :selected-rows-count="selectedRows.length"
        :search-term="searchTerm"
        :selected-classes="selectedClasses"
        :has-not-parent-filter-active="hasNotParentFilter"
        :has-not-class-filter-active="hasNotClassFilter"
        @reset-filters="resetFilters"
        @has-not-parent-filter="() => hasNotParentFilter = !hasNotParentFilter"
        @has-not-class-filter="() => hasNotClassFilter = !hasNotClassFilter"
      />

      <StudentTable
        v-model:selected-rows="selectedRows"
        v-model:sort="sort"
        :rows="paginatedData"
        :columns="selectedColumns"
        :loading="isLoading || classFetchingStatus === 'pending'"
        :page-from="pageFrom"
        @select="selectRow"
        @show-link-modal="(student) => { selectedStudentForLink = student; isLinkModalOpen = true }"
        @show-update-modal="(student) => { selectedStudentForUpdate = student; isUpdateModalOpen = true }"
        @remove-from-class="handleRemoveStudentFromClass"
        @remove-from-school="handleRemoveStudentFromSchool"
      >
        <template #date-of-birth-data="{ row }">
          {{ formatDate(row.dateOfBirth) }}
        </template>
        <template #age-data="{ row }">
          {{ getAge(row.dateOfBirth) }}
        </template>
      </StudentTable>

      <template #footer>
        <StudentListPagination
          v-model:current-page="currentPage"
          :page-from="pageFrom"
          :page-to="pageTo"
          :total="students.length"
          :page-count="itemsPerPage"
          :total-pages="pageCount"
          @change="onPageChange"
        />
      </template>
    </UCard>

    <UModal v-model="isLinkModalOpen">
      <LinkStudentParentModal
        v-if="selectedStudentForLink"
        :student-id="selectedStudentForLink.id"
        :student-name="selectedStudentForLink.name"
        @close="isLinkModalOpen = false; selectedStudentForLink = null"
      />
    </UModal>

    <UModal v-model="isUpdateModalOpen">
      <UpdateStudentModal
        v-if="selectedStudentForUpdate"
        :student="selectedStudentForUpdate"
        @close="isUpdateModalOpen = false; selectedStudentForUpdate = null"
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
