<script setup lang="ts">
import type { Database } from '~~/types/database.types'
import type { IScheduleImportDTO } from '~~/utils/validators'
// Assuming a utility to parse time
import { scheduleImportDTOSchema } from '~~/utils/validators'

type InsertSchedule = Database['public']['Tables']['schedules']['Insert']

// Store
const toast = useToast()
const router = useRouter()
const { userData } = useUserStore()

// Supabase client
const supabase = useSupabaseClient<Database>()

const isSubmitting = ref(false)

// Load classes, subjects, and teachers
const { data: classes, execute: executeClasses } = await useAsyncData('classes', async () => {
  if (!userData?.school)
    throw new Error('Unauthorized')

  const { data, error } = await supabase.from('classes').select('id, name').eq('school_id', userData.school.id!)
  if (error)
    throw error
  return data
})

const { data: subjects, execute: executeSubjects } = await useAsyncData('subjects', async () => {
  const { data, error } = await supabase.from('subjects').select('id, name')
  if (error)
    throw error
  return data
})

const { data: teachers, execute: executeTeachers } = await useAsyncData('teachers', async () => {
  const { data, error } = await supabase.from('users').select('id, email')
  if (error)
    throw error
  return data
})

// Function to convert day of week from text to integer
const dayOfWeekMap: { [key: string]: number } = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
}

// Function to handle the upload of schedule data
async function handleScheduleUpload(data: IScheduleImportDTO[]) {
  try {
    isSubmitting.value = true

    const schoolId = userData?.school.id
    if (!schoolId) {
      toast.add({
        title: 'Erreur',
        description: 'Vous n\'êtes pas connecté à votre école.',
        color: 'red',
      })

      return
    }

    // Map class, subject, and teacher names/emails to IDs
    const classMap = new Map(classes.value?.map(c => [c.name.toLowerCase(), c.id]))
    const subjectMap = new Map(subjects.value?.map(s => [s.name.toLowerCase(), s.id]))
    const teacherMap = new Map(teachers.value?.map(t => [t.email.toLowerCase(), t.id]))

    // Process each schedule
    const schedules = data.map((schedule) => {
      const processedSchedule: InsertSchedule = {
        class_id: classMap.get(schedule.className.toLowerCase())!,
        day_of_week: schedule.dayOfWeek,
        end_time: schedule.endTime,
        start_time: schedule.startTime,
        room: schedule.room || null,
        subject_id: subjectMap.get(schedule.subjectName.toLowerCase())!,
        teacher_id: teacherMap.get(schedule.teacherEmail.toLowerCase())!,
      }
      return processedSchedule
    })

    const { error } = await supabase.from('schedules').insert(schedules)
    if (error) {
      toast.add({
        title: 'Erreur',
        description: 'Une erreur s\'est produite lors de l\'importation des horaires.',
        color: 'red',
      })
      console.error(error)
      return
    }

    toast.add({
      title: 'Succès',
      description: 'Les horaires ont été enregistrés',
      color: 'emerald',
    })
    await router.replace('/schedules')
  }
  catch (err) {
    toast.add({
      title: 'Erreur',
      description: 'Une erreur s\'est produite lors de l\'importation des horaires.',
      color: 'red',
    })
    console.error(err)
  }
  finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  // Ensure necessary data is preloaded
  await Promise.all([executeClasses(), executeSubjects(), executeTeachers()])
})
</script>

<template>
  <div class="h-[calc(100vh-64px)] flex flex-col">
    <h1 class="text-2xl font-bold mb-4">
      Page d'importation des horaires
    </h1>
    <div v-if="!classes || !subjects || !teachers" class="text-center flex flex-col h-full items-center justify-center">
      <p>Chargement des données...</p>
      <Icon name="heroicons:arrow-path" class="animate-spin text-4xl" />
    </div>
    <div v-else>
      <DataUploader :schema="scheduleImportDTOSchema" :on-upload="handleScheduleUpload" />
    </div>
  </div>
</template>
