<script setup lang="ts">
import type { ZError } from '~~/types'
import type { Database } from '~~/types/database.types'
import { type IScheduleCreationDTO, scheduleCreationSchema } from '~~/utils/validators'
import { DAYS_OF_WEEK_OPEN } from '~/constants'

const { classId, subjects } = defineProps<{
  classId: string
  subjects: { id: string, name: string }[]
  teachers: { id: string, name: string }[]
}>()

const emit = defineEmits(['refreshSchedules'])

const toast = useToast()
const supabase = useSupabaseClient<Database>()

const errors = ref<ZError[]>([])
const isScheduleEventCreationModalOpen = defineModel<boolean>('isOpen', { default: false })

const event = ref<IScheduleCreationDTO>({ startTime: '', endTime: '', dayOfWeek: 1, subjectId: '', teacherId: '', classId })

function getFieldErrorIfExists(field: keyof IScheduleCreationDTO): string {
  const fieldError = errors.value.find(error => error.path.includes(field))
  return fieldError?.message ?? ''
}

async function handleSave() {
  try {
    const result = await scheduleCreationSchema.safeParseAsync(event.value)
    if (!result.success) {
      errors.value = result.error.errors.map(error => ({ path: error.path, message: error.message }))
      return
    }

    const { error } = await supabase.from('schedules').insert({
      class_id: result.data.classId,
      start_time: result.data.startTime,
      end_time: result.data.endTime,
      day_of_week: result.data.dayOfWeek,
      subject_id: result.data.subjectId,
      teacher_id: result.data.teacherId as any,
      room: result.data.room,
    })

    if (error)
      throw error

    emit('refreshSchedules')
    isScheduleEventCreationModalOpen.value = false

    toast.add({
      title: 'Succès',
      description: 'Cette plage horaire a été créée avec succès',
    })
  }
  catch (error) {
    console.error('Error updating schedule:', error)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la création de cette plage horaire',
      color: 'red',
      timeout: 7000,
    })
  }
}
</script>

<template>
  <UModal v-model="isScheduleEventCreationModalOpen">
    <UCard>
      <template #header>
        <h3>Créer un horaire</h3>
      </template>
      <form class="flex flex-col gap-4" @submit.prevent="handleSave">
        <UFormGroup label="Heure de début" :error="getFieldErrorIfExists('startTime')">
          <UInput v-model="event.startTime" placeholder="Ex.: 07:00" icon="i-carbon-alarm-add" />
        </UFormGroup>

        <UFormGroup label="Heure de fin" :error="getFieldErrorIfExists('endTime')">
          <UInput v-model="event.endTime" placeholder="Ex.: 08:00" icon="i-carbon-alarm-subtract" />
        </UFormGroup>

        <UFormGroup label="Jour de la semaine" :error="getFieldErrorIfExists('dayOfWeek')">
          <USelect
            v-model="event.dayOfWeek"
            :options="DAYS_OF_WEEK_OPEN"
            icon="i-heroicons-calendar-days-20-solid"
            option-attribute="name"
            value-attribute="number"
          />
        </UFormGroup>

        <UFormGroup label="Matière" :error="getFieldErrorIfExists('subjectId')">
          <USelect
            v-model="event.subjectId"
            :options="subjects"
            icon="i-carbon-course"
            option-attribute="name"
            value-attribute="id"
          />
        </UFormGroup>

        <UFormGroup label="Enseignant" :error="getFieldErrorIfExists('teacherId')">
          <USelect
            v-model="event.teacherId"
            :options="teachers"
            icon="i-heroicons-user-circle"
            option-attribute="name"
            value-attribute="id"
          />
        </UFormGroup>

        <div class="flex justify-center space-x-4 mt-4">
          <UButton color="primary" type="submit">
            Enregistrer
          </UButton>
          <UButton color="gray" @click="isScheduleEventCreationModalOpen = false">
            Annuler
          </UButton>
        </div>
      </form>
    </UCard>
  </UModal>
</template>
