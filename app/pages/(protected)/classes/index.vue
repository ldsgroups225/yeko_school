<script setup lang="ts">
import type { IClassDTO } from '~~/types'
import type { Database } from '~~/types/database.types'
import type { ICreateClassDTO } from '~~/utils/validators'
import { formatFullName } from '~~/utils/formatting'
import { snakeCase } from 'change-case'
import { CLASS_COLUMNS, YEAR_OPTIONS } from '~/constants'

interface IQueryParams {
  page: number
  itemsPerPage: number
  name: string
  gradeId: string
  sort: { column: string, direction: 'asc' | 'desc' }
  hasNotMainTeacherFilter: boolean
}

const toast = useToast()
const staticEmptyClasses: ICreateClassDTO[] = []

// Supebase client
const supabase = useSupabaseClient<Database>()

// Store
const { userData } = useUserStore()
const classStore = useClassStore()
const { isLoading, error } = storeToRefs(classStore)

// State
const selectedYear = ref('2024-2025')
const selectedColumns = ref(CLASS_COLUMNS)
const selectedRows = ref<ICreateClassDTO[]>([])
const isLinkModalOpen = ref(false)
const classroomCount = ref(0)
const isCreateOrUpdateClassModalOpen = ref(false)
const selectedClassForUpdate = ref<ICreateClassDTO | null>(null)

// query params
const queryParams = reactive<IQueryParams>({
  page: 1,
  itemsPerPage: 10,
  name: '',
  gradeId: '',
  sort: { column: 'gradeId', direction: 'asc' },
  hasNotMainTeacherFilter: false,
})

function selectRow(row: ICreateClassDTO) {
  const index = selectedRows.value.findIndex(item => item === row)
  if (index === -1) {
    selectedRows.value.push(row)
  }
  else {
    selectedRows.value.splice(index, 1)
  }
}

function resetFilters() {
  queryParams.name = ''
  queryParams.gradeId = ''
  queryParams.hasNotMainTeacherFilter = false
}

function buildSupabaseQuery(client: ClientType, query: IQueryParams) {
  let supabaseQuery = client
    .from('classes')
    .select(`
      *,
      students(count),
      users(first_name, last_name, email)
    `)
    .eq('school_id', userData!.school!.id!)

  if (query.gradeId) {
    supabaseQuery = supabaseQuery.eq('grade_id', query.gradeId)
  }
  if (query.name) {
    supabaseQuery = supabaseQuery.ilike('name', `%${query.name}%`)
  }
  if (query.hasNotMainTeacherFilter) {
    supabaseQuery = supabaseQuery.is('main_teacher_id', null)
  }
  if (query.sort.column) {
    supabaseQuery = supabaseQuery.order(snakeCase(query.sort.column), { ascending: query.sort.direction === 'asc' })
  }
  else {
    supabaseQuery = supabaseQuery.order('grade_id').order('name')
  }

  return supabaseQuery.range((query.page - 1) * query.itemsPerPage, query.page * query.itemsPerPage - 1)
}

const { data: classes, execute: fetchClasses, refresh: refreshStudents } = await useLazyAsyncData('classes', async () => {
  if (!userData?.school?.id)
    return staticEmptyClasses

  const supabaseQuery = buildSupabaseQuery(supabase, queryParams)
  if (!supabaseQuery)
    return staticEmptyClasses

  const { data: clsData, error: clsError } = await supabaseQuery

  if (clsError) {
    toast.add({
      title: 'Erreur',
      description: 'Oups, nous n\'avons pas pu récupérer les classes.',
      color: 'red',
      timeout: 7000,
      icon: 'heroicons:exclamation-triangle',
    })
    return staticEmptyClasses
  }

  let countQs = supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', userData.school.id)
  if (queryParams.name) {
    countQs = countQs.ilike('name', `%${queryParams.name}%`)
  }
  if (queryParams.hasNotMainTeacherFilter) {
    countQs = countQs.is('main_teacher_id', null)
  }
  // if (queryParams.selectedClasses.length) {
  //   countQs = countQs.in('class_id', queryParams.selectedClasses)
  // }

  const { count } = await countQs
  classroomCount.value = count ?? 0

  return clsData.map((cls) => {
    return {
      id: cls.id,
      name: cls.name,
      gradeId: cls.grade_id,
      schoolId: cls.school_id,
      mainTeacherId: cls.main_teacher_id,
      mainTeacherName: cls.users ? formatFullName(cls.users.first_name, cls.users.last_name, cls.users.email) : null,
      studentCount: cls.students[0]?.count || 0,
    } satisfies IClassDTO
  })
}, { immediate: false })

watchDebounced(queryParams, async () => {
  await refreshStudents()
}, { deep: true, debounce: 500 })

const paginationRange = computed(() => {
  return calculatePaginationRange(queryParams, 100)
})

function calculatePaginationRange(params: IQueryParams, totalItems: number) {
  const pageFrom = (params.page - 1) * params.itemsPerPage
  const pageTo = pageFrom + params.itemsPerPage - 1
  const totalPages = Math.ceil(classroomCount.value / params.itemsPerPage)

  return {
    pageFrom,
    pageTo,
    totalItems,
    totalPages,
  }
}

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

      <ClassListFilters v-model:search-term="queryParams.name" />

      <ClassListControls
        v-model:items-per-page="queryParams.itemsPerPage"
        v-model:selected-columns="selectedColumns"
        :selected-rows-count="selectedRows.length"
        :search-term="queryParams.name"
        :has-not-main-teacher-active="queryParams.hasNotMainTeacherFilter"
        @reset-filters="resetFilters"
        @has-not-main-teacher-filter="() => queryParams.hasNotMainTeacherFilter = !queryParams.hasNotMainTeacherFilter"
      />

      <ClassTable
        v-if="classes"
        v-model:selected-rows="selectedRows"
        v-model:sort="queryParams.sort"
        :rows="classes"
        :columns="selectedColumns"
        :loading="isLoading"
        :page-from="paginationRange.pageFrom"
        @select="selectRow"
        @show-create-or-update-modal="(cls) => { selectedClassForUpdate = cls; isCreateOrUpdateClassModalOpen = true }"
      />

      <template #footer>
        <ClassListPagination
          v-model:current-page="queryParams.page"
          :page-from="paginationRange.pageFrom"
          :page-to="paginationRange.pageTo"
          :total="classroomCount"
          :items-per-page="queryParams.itemsPerPage"
          @change="(page) => queryParams.page = page"
        />
      </template>
    </UCard>

    <UModal v-model="isCreateOrUpdateClassModalOpen">
      <ClassForm
        v-if="isCreateOrUpdateClassModalOpen"
        :cls="selectedClassForUpdate as ICreateClassDTO"
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
