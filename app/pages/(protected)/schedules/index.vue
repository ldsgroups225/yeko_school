<script setup lang="ts">
import type { IScheduleCalendarDTO } from '~~/types'
import type { Database } from '~~/types/database.types'
import { formatFullName } from '~~/utils/formatting'

// Store
const toast = useToast()
const router = useRouter()
const { userData } = useUserStore()

// Supabase client
const supabase = useSupabaseClient<Database>()

// Refs
const selectedClassId = ref<string | null>(null)

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

const classesMerged = computed(() => classesGrouped.value?.flatMap(c => c.subclasses.map(s => ({ id: s.id, name: c.name }))) || [])

const { data: schedules, execute: executeSchedules } = await useAsyncData('schedules', async () => {
  if (!userData?.school)
    throw new Error('Unauthorized')

  const { data, error } = await supabase.from('schedules')
    .select('*, subject: subjects(name), teacher: users(first_name, last_name)')
    .eq('class_id', selectedClassId.value!)
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
})

const gradeHasSelectedSubclass = computed(() => {
  return (grade: { subclasses: { id: string }[] }) => {
    return grade.subclasses.some(subclass => selectedClassId.value === subclass.id)
  }
})

watchThrottled(selectedClassId, async () => await executeSchedules(), { throttle: 500 })

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
        <h3 class="text-2xl font-bold mb-4">
          Plage horaires de la classe {{ selectedClassName }}
        </h3>
        <ScheduleWeekly v-if="schedules" :schedule="schedules!" />
      </div>
    </div>
  </div>
</template>
