<script setup lang="ts">
import type { IStudentDTO } from '~~/types'
import type { Database } from '~~/types/database.types'
import { formatDate, getAge } from '~~/utils/dateTime.js'
import { snakeCase } from 'change-case'
import { STUDENT_COLUMNS, YEAR_OPTIONS } from '~/constants'

interface IQueryParams {
  page: number
  itemsPerPage: number
  searchTerm: string
  isStudent: boolean
  isTeacher: boolean
  isAdmin: boolean
  selectedClasses: string[]
  sort: { column: string, direction: 'asc' | 'desc' }
  hasNotParentFilter: boolean
  hasNotClassFilter: boolean
}

// Store
const { userData } = useUserStore()
const studentStore = useStudentStore()
const { updateStudent, updateLocalStudentList } = studentStore
const { isLoading, error } = storeToRefs(studentStore)

// State
const { data: classes, status: classFetchingStatus } = useFetch('/api/classes/classes_grouped_by_grade', { params: { schoolId: userData?.school?.id } })
const studentCount = ref(0)
const selectedYear = ref('2024 2025')
const selectedColumns = ref(STUDENT_COLUMNS)
const selectedRows = ref<IStudentDTO[]>([])
const isLinkModalOpen = ref(false)
const selectedStudentForLink = ref<{ id: string, name: string } | null>(null)
const isUpdateModalOpen = ref(false)
const isAssignClassModalOpen = ref(false)
const selectedStudentForUpdate = ref<IStudentDTO | null>(null)
const selectedStudentForAssignClass = ref<string>('')
const selectedClassToAssign = ref<{ id: string, label: string, click?: () => void }>({ id: '', label: '' })

const toast = useToast()

const staticEmptyStudents: IStudentDTO[] = []

// Supebase client
const supabase = useSupabaseClient<Database>()

// query params
const queryParams = reactive<IQueryParams>({
  page: 1,
  itemsPerPage: 10,
  searchTerm: '',
  isStudent: false,
  isTeacher: false,
  isAdmin: false,
  selectedClasses: [],
  sort: { column: 'lastName', direction: 'asc' },
  hasNotParentFilter: false,
  hasNotClassFilter: false,
})

function buildSupabaseQuery(client: ClientType, query: typeof queryParams) {
  let supabaseQuery = client
    .from('students')
    .select(`
      *,
      class:classes(name)
    `)
    .eq('school_id', userData!.school!.id!)

  if (query.searchTerm) {
    supabaseQuery = supabaseQuery.or(`first_name.ilike.%${query.searchTerm}%,last_name.ilike.%${query.searchTerm}%,id_number.ilike.%${query.searchTerm}%`)
  }
  if (query.selectedClasses.length) {
    supabaseQuery = supabaseQuery.in('class_id', query.selectedClasses)
  }
  if (query.hasNotClassFilter) {
    supabaseQuery = supabaseQuery.is('class_id', null)
  }
  if (query.hasNotParentFilter) {
    supabaseQuery = supabaseQuery.is('parent_id', null)
  }
  if (query.sort.column) {
    supabaseQuery = supabaseQuery.order(snakeCase(query.sort.column), { ascending: query.sort.direction === 'asc' })
  }

  return supabaseQuery.range((query.page - 1) * query.itemsPerPage, query.page * query.itemsPerPage - 1)
}

const { data: students, execute: fetchStudents, refresh: refreshStudents } = await useLazyAsyncData('students', async () => {
  if (!userData?.school?.id)
    return staticEmptyStudents

  const supabaseQuery = buildSupabaseQuery(supabase, queryParams)
  if (!supabaseQuery)
    return staticEmptyStudents

  const { data: stData, error: stError } = await supabaseQuery

  if (stError) {
    toast.add({
      title: 'Erreur',
      description: 'Oups, nous n\'avons pas pu récupérer les élèves.',
      color: 'red',
      timeout: 7000,
      icon: 'heroicons:exclamation-triangle',
    })
    return staticEmptyStudents
  }

  let countQs = supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', userData.school.id)
  if (queryParams.searchTerm) {
    countQs = countQs.or(`first_name.ilike.%${queryParams.searchTerm}%,last_name.ilike.%${queryParams.searchTerm}%,id_number.ilike.%${queryParams.searchTerm}%`)
  }
  if (queryParams.selectedClasses.length) {
    countQs = countQs.in('class_id', queryParams.selectedClasses)
  }

  const { count } = await countQs
  studentCount.value = count ?? 0

  return stData.map((st) => {
    return {
      id: st.id,
      parentId: st.parent_id,
      schoolId: st.school_id,
      classId: st.class_id,
      classroomName: st.class?.name || null,
      idNumber: st.id_number,
      firstName: st.first_name,
      lastName: st.last_name,
      dateOfBirth: st.date_of_birth,
      gender: (st.gender || 'M') as 'M' | 'F',
      address: st.address,
      avatarUrl: st.avatar_url,
      createdAt: st.created_at,
      createdBy: st.created_by,
      updatedAt: st.updated_at,
      updatedBy: st.updated_by,
    } satisfies IStudentDTO
  })
}, { immediate: false })

watchDebounced(queryParams, async () => {
  await refreshStudents()
}, { deep: true, debounce: 500 })

const {
  isConfirmDialogOpen,
  confirmDialogConfig,
  openConfirmDialog,
} = useConfirmDialog()

// Methods
function toggleSubclassSelection(subclassValue: string) {
  queryParams.selectedClasses = queryParams.selectedClasses.includes(subclassValue)
    ? queryParams.selectedClasses.filter(c => c !== subclassValue)
    : [...queryParams.selectedClasses, subclassValue]
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

function resetFilters() {
  queryParams.searchTerm = ''
  queryParams.selectedClasses = []
}

// Computed
const gradeHasSelectedSubclass = computed(() => {
  return (grade: { subclasses: { id: string }[] }) => {
    return grade.subclasses.some(subclass => queryParams.selectedClasses.includes(subclass.id))
  }
})

const paginationRange = computed(() => {
  return calculatePaginationRange(queryParams, 100)
})

function calculatePaginationRange(params: IQueryParams, totalItems: number) {
  const pageFrom = (params.page - 1) * params.itemsPerPage
  const pageTo = pageFrom + params.itemsPerPage - 1
  const totalPages = Math.ceil(studentCount.value / params.itemsPerPage)

  return {
    pageFrom,
    pageTo,
    totalItems,
    totalPages,
  }
}

async function handleAssignClass() {
  const studentId = selectedStudentForAssignClass.value
  const classId = toRaw(selectedClassToAssign.value).id

  if (!userData || !userData?.school || !userData?.school.id) {
    throw new Error('Unauthorized')
  }

  const { error: classAssignmentError } = await supabase
    .from('students')
    .update({ class_id: classId })
    .eq('school_id', userData.school.id)
    .eq('id', studentId)

  if (classAssignmentError) {
    toast.add({
      title: 'Erreur',
      description: 'Oups, nous n\'avons pas pu assigner cet élève à la classe sélectionnée.',
      color: 'red',
      timeout: 7000,
      icon: 'heroicons:exclamation-triangle',
    })

    return
  }

  updateLocalStudentList({ id: studentId, classId, classroomName: selectedClassToAssign.value.label })
  toast.add({
    title: 'Succès',
    description: 'L\'élève a bien été assigné à la classe sélectionnée.',
    color: 'emerald',
  })

  isAssignClassModalOpen.value = false
  selectedClassToAssign.value = { id: '', label: '', click: () => {} }
  selectedStudentForAssignClass.value = ''
}

function onSelect(option: { click: () => void }) {
  if (option.click) {
    option.click()
  }
}

function selectRow(row: IStudentDTO) {
  const index = selectedRows.value.findIndex(item => item === row)
  if (index === -1) {
    selectedRows.value.push(row)
  }
  else {
    selectedRows.value.splice(index, 1)
  }
}

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
        v-model:search-term="queryParams.searchTerm"
        :classes="classes?.data"
        :selected-classes="queryParams.selectedClasses"
        :grade-has-selected-subclass="gradeHasSelectedSubclass"
        @toggle-subclass="toggleSubclassSelection"
      />

      <StudentListControls
        v-model:items-per-page="queryParams.itemsPerPage"
        v-model:selected-columns="selectedColumns"
        :selected-rows="selectedRows"
        :search-term="queryParams.searchTerm"
        :selected-classes="queryParams.selectedClasses"
        :has-not-parent-filter-active="queryParams.hasNotParentFilter"
        :has-not-class-filter-active="queryParams.hasNotClassFilter"
        @reset-filters="resetFilters"
        @has-not-parent-filter="() => queryParams.hasNotParentFilter = !queryParams.hasNotParentFilter"
        @has-not-class-filter="() => queryParams.hasNotClassFilter = !queryParams.hasNotClassFilter"
      />

      <StudentTable
        v-if="students"
        v-model:selected-rows="selectedRows"
        v-model:sort="queryParams.sort"
        :rows="students"
        :columns="selectedColumns"
        :loading="isLoading || classFetchingStatus === 'pending'"
        :page-from="paginationRange.pageFrom"
        @select="selectRow"
        @show-link-modal="(student) => { selectedStudentForLink = student; isLinkModalOpen = true }"
        @show-update-modal="(student) => { selectedStudentForUpdate = student; isUpdateModalOpen = true }"
        @show-assign-class-modal="(studentId) => { selectedStudentForAssignClass = studentId; isAssignClassModalOpen = true }"
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
          v-model:current-page="queryParams.page"
          :page-from="paginationRange.pageFrom"
          :page-to="paginationRange.pageTo"
          :total="studentCount"
          :items-per-page="queryParams.itemsPerPage"
          @change="(page) => queryParams.page = page"
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

    <UModal v-model="isAssignClassModalOpen">
      <UCommandPalette
        v-model="selectedClassToAssign"
        :autoselect="false"
        placeholder="Rechercher une classe"
        :empty-state="{ icon: 'i-heroicons-magnifying-glass-20-solid', label: 'Aucune classe trouvée', queryLabel: 'Nous n\'avons trouvé aucune classe correspondante à votre recherche' }"
        :groups="[{ key: 'classes', commands: classes?.data.flatMap(item => item.subclasses.map(subclass => ({ label: subclass.name, id: subclass.id, click: () => handleAssignClass() }))) }]"
        @update:model-value="onSelect"
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
