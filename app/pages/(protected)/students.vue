<script setup lang="ts">
import type { IStudentDTO } from '~~/types'
import { formatDate, getAge } from '~~/utils/dateTime.js'
import { STUDENT_COLUMNS, YEAR_OPTIONS } from '~/constants'

// Store
const { userData } = useUserStore()
const studentStore = useStudentStore()
const { students, isLoading, error } = storeToRefs(studentStore)

// State
const { data: classes, status: classFetchingStatus } = useFetch('/api/classes/classes_grouped_by_grade', { params: { schoolId: userData?.school?.id } })
const selectedYear = ref('2024 2025')
const selectedColumns = ref(STUDENT_COLUMNS)

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
} = useTableState<IStudentDTO>(students)

// Methods
function getActionItems(row: { id: string }) {
  return [
    [{
      label: 'Modifier',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => studentStore.fetchStudentById(row.id),
    }, {
      label: 'Voir',
      icon: 'i-heroicons-eye-20-solid',
      click: () => studentStore.fetchStudentById(row.id),
    }],
  ]
}

function getDropdownItems(subclasses: { label: string, value: string }[]) {
  return subclasses.map(subclass => ({
    label: selectedClasses.value.includes(subclass.value) ? `${subclass.label} ✔️` : `${subclass.label}`,
    click: () => {
      if (selectedClasses.value.includes(subclass.value)) {
        selectedClasses.value = selectedClasses.value.filter(c => c !== subclass.value)
      }
      else {
        selectedClasses.value.push(subclass.value)
      }
    },
    selected: selectedClasses.value.includes(subclass.value),
  }))
}

// Computed
const gradeHasSelectedSubclass = computed(() => {
  return (grade: { subclasses: { id: string }[] }) => {
    return grade.subclasses.some(subclass => selectedClasses.value.includes(subclass.id))
  }
})

// Lifecycle
onMounted(async () => {
  await studentStore.fetchStudents()
})
</script>

<template>
  <div class="space-y-6 p-6">
    <UAlert v-if="error" color="red" icon="i-heroicons-exclamation-triangle" :title="error" />

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
      <!-- Header -->
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            Liste des étudiants
          </h2>
          <div class="flex items-center space-x-2">
            <UButton variant="outline" icon="i-heroicons-users" />
            <USelectMenu v-model="selectedYear" :options="YEAR_OPTIONS" />
          </div>
        </div>
      </template>

      <!-- Search and Filters -->
      <div class="flex items-center justify-between gap-3 px-4 py-3">
        <UInput v-model="searchTerm" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Rechercher un étudiant..." />
        <div class="flex flex-wrap gap-2">
          <UDropdown
            v-for="cls in classes?.data"
            :key="cls.name"
            :items="[getDropdownItems(cls.subclasses.map(s => ({ label: s.name, value: s.id })))]"
          >
            <UButton variant="outline" class="flex items-center">
              {{ cls.name }}
              <UIcon name="i-heroicons-chevron-down" class="ml-2 h-4 w-4" />
              <UIcon
                v-if="gradeHasSelectedSubclass(cls)"
                name="i-heroicons-eye-20-solid"
                class="ml-1 h-4 w-4 text-green-700 dark:text-green-400"
              />
            </UButton>
          </UDropdown>
        </div>
      </div>

      <!-- Table Controls -->
      <div class="flex justify-between items-center w-full px-4 py-3">
        <div class="flex items-center gap-1.5">
          <span class="text-sm leading-5">Lignes par page:</span>
          <USelect
            v-model="itemsPerPage"
            :options="[5, 10, 20, 30, 50]"
            class="me-2 w-20"
            size="xs"
          />
        </div>
        <div class="flex gap-1.5 items-center">
          <UDropdown v-if="selectedRows.length > 1" :items="[]">
            <UButton
              icon="i-heroicons-chevron-down"
              trailing
              color="gray"
              size="xs"
            >
              Actions groupées
            </UButton>
          </UDropdown>
          <USelectMenu v-model="selectedColumns" :options="STUDENT_COLUMNS" multiple>
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
            @click="resetFilters"
          >
            Réinitialiser
          </UButton>
        </div>
      </div>

      <!-- Table -->
      <UTable
        v-model="selectedRows"
        v-model:sort="sort"
        :rows="paginatedData"
        :columns="selectedColumns"
        :loading="isLoading || classFetchingStatus === 'pending'"
        sort-asc-icon="i-heroicons-arrow-up"
        sort-desc-icon="i-heroicons-arrow-down"
        :ui="{
          td: { base: 'max-w-[0] truncate' },
          default: { checkbox: { color: 'primary' as any } },
        }"
        @select="selectRow"
      >
        <template #index-data="{ index }">
          {{ pageFrom + index }}
        </template>
        <template #dateOfBirth-data="{ row }">
          {{ formatDate(row.dateOfBirth) }}
        </template>
        <template #age-data="{ row }">
          {{ getAge(row.dateOfBirth) }}
        </template>
        <template #actions-data="{ row }">
          <UDropdown :items="getActionItems(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>

      <!-- Footer -->
      <template #footer>
        <div class="flex flex-wrap justify-between items-center">
          <div>
            <span class="text-sm leading-5">
              Affichage de
              <span class="font-medium">{{ pageFrom }}</span>
              à
              <span class="font-medium">{{ pageTo }}</span>
              sur
              <span class="font-medium">{{ paginatedData.length }}</span>
              résultats
            </span>
          </div>
          <UPagination
            v-model="currentPage"
            :page-count="itemsPerPage"
            :total="pageCount"
            :ui="{
              wrapper: 'flex items-center gap-1',
              rounded: '!rounded-full min-w-[32px] justify-center',
              default: {
                activeButton: {
                  variant: 'outline',
                },
              },
            }"
            @change="onPageChange"
          />
        </div>
      </template>
    </UCard>
  </div>
</template>
