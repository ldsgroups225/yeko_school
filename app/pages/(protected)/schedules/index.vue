<script setup lang="ts">
import type { Database } from '~~/types/database.types'
import { ERole, type IScheduleCalendarDTO } from '~~/types'
import { formatFullName } from '~~/utils/formatting'

// Store
const toast = useToast()
const router = useRouter()
const { userData } = useUserStore()

// Supabase client
const supabase = useSupabaseClient<Database>()

// Refs
const selectedClassId = ref<string | null>(null)
const isScheduleEventCreationModalOpen = ref(false)

const { data: classesGrouped, status: classGroupedFetchingStatus, execute: executeClassesGrouped } = useFetch(
  '/api/classes/classes_grouped_by_grade',
  {
    params: { schoolId: userData?.school?.id },
    immediate: false,
    onResponseError: ({ error }) => {
      toast.add({
        title: 'Erreur',
        description: 'Une erreur s\'est produite lors de la récupération des horaires.',
        color: 'red',
      })

      return Promise.reject(error)
    },
    transform: r => r.data,
  },
)

const { data: subjects } = await useAsyncData('subjects', async () => {
  const { data, error } = await supabase.from('subjects').select('id, name')
  if (error) {
    console.error('Error fetching subjects:', error)
    return []
  }
  return data
})

const { data: teachers } = await useAsyncData('teachers', async () => {
  const { data, error } = await supabase.from('users').select('id, first_name, last_name, user_roles(role_id)').eq('user_roles.role_id', ERole.TEACHER)

  if (error) {
    console.error('Error fetching subjects:', error)
    return []
  }

  return data.map(d => ({ id: d.id, name: formatFullName(d.first_name, d.last_name) }))
})

const classesMerged = computed(() => classesGrouped.value?.flatMap(c => c.subclasses.map(s => ({ id: s.id, name: c.name }))) || [])

const { data: schedules, refresh: refreshSchedules } = await useLazyAsyncData('schedules', async () => {
  if (!userData?.school)
    throw new Error('Unauthorized')

  const { data, error } = await supabase.from('schedules')
    .select('*, subject: subjects(name), teacher: users(first_name, last_name)')
    .eq('class_id', selectedClassId.value!)
    .order('day_of_week')
    .order('start_time')
  if (error)
    throw error

  return data.map((d) => {
    return {
      subjectName: d.subject ? d.subject.name : '',
      teacherName: d.teacher ? formatFullName(d.teacher.first_name, d.teacher.last_name) : '',
      classId: classesMerged.value.find(c => c.id === selectedClassId.value!)?.id || '',
      classroomName: classesMerged.value.find(c => c.id === selectedClassId.value!)?.name || '',
      dayOfWeek: d.day_of_week,
      startTime: d.start_time,
      endTime: d.end_time,
      subjectId: d.subject_id,
      teacherId: d.teacher_id,
      id: d.id,
    } satisfies IScheduleCalendarDTO
  })
}, { immediate: false })

const gradeHasSelectedSubclass = computed(() => {
  return (grade: { subclasses: { id: string }[] }) => {
    return grade.subclasses.some(subclass => selectedClassId.value === subclass.id)
  }
})

watchThrottled(selectedClassId, async () => await refreshSchedules(), { throttle: 500 })

function getDropdownItems(subclasses: { id: string, name: string }[]) {
  return subclasses.map(subclass => ({
    label: selectedClassId.value === subclass.id ? `${subclass.name} ✔️` : `${subclass.name}`,
    click: () => selectedClassId.value = subclass.id,
    selected: selectedClassId.value === subclass.id,
  }))
}

const selectedClassName = computed(() => {
  return classesMerged.value.find(c => c.id === selectedClassId.value)?.name || ''
})

onMounted(async () => await executeClassesGrouped())
</script>

<template>
  <div class="h-[calc(100vh-64px)] flex flex-col">
    <h1 class="text-2xl font-bold mb-4">
      Page de gestion des horaires
    </h1>

    <div
      v-if="(classGroupedFetchingStatus === 'success')"
      class="flex flex-col h-full"
    >
      <div class="flex flex-wrap gap-2">
        <UDropdown
          v-for="cls in classesGrouped"
          :key="cls.name"
          :items="[getDropdownItems(cls.subclasses)]"
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

      <div v-if="!selectedClassId" class="flex flex-col items-center justify-center h-full">
        <UIcon name="i-heroicons-information-circle" class="text-gray-500 dark:text-gray-400 text-8xl" />

        <p class="text-center text-gray-500 dark:text-gray-400 mt-2">
          Veillez sélectionner une classe
        </p>
      </div>

      <div v-else-if="selectedClassId && schedules?.length === 0" class="flex flex-col items-center justify-center h-full">
        <UIcon name="i-heroicons-calendar-days-20-solid" class="text-gray-500 dark:text-gray-400 text-8xl" />

        <p class="text-center text-gray-500 dark:text-gray-400 my-2">
          Aucun horaire pour cette classe
        </p>

        <UButton color="primary" @click="() => router.push('/schedules/upload')">
          Ajouter un horaire
        </UButton>
      </div>

      <div v-else class="flex flex-col items-center justify-center h-full mt-10">
        <div class="flex flex-row items-center justify-center gap-x-4 mb-4">
          <h3 class="text-2xl font-bold">
            Plage horaires de la classe {{ selectedClassName }}
          </h3>

          <UButton color="primary" @click="() => isScheduleEventCreationModalOpen = true">
            Ajouter un horaire
          </UButton>
        </div>
        <ScheduleWeekly v-if="schedules" :schedule="schedules!" class="w-full" />

        <!-- Modal for adding a new schedule event -->
        <ScheduleEventCreateModal
          v-if=" userData?.school?.id !== null && userData?.school?.id !== undefined"
          v-model:is-open="isScheduleEventCreationModalOpen"
          :subjects="subjects || []"
          :teachers="teachers || []"
          :class-id="selectedClassId"
          @refresh-schedules="refreshSchedules"
        />
      </div>
    </div>
  </div>
</template>
