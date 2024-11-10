<script setup lang="ts">
import type { IScheduleCalendarDTO } from '~~/types'
import type { Database } from '~~/types/database.types'

// Define props
const { event } = defineProps<{ event: IScheduleCalendarDTO }>()

const toast = useToast()

// --- Computed Properties ---
/**
 * Computes the style for the event based on start and end times.
 */
const eventStyle = computed(() => {
  const startMinutes = timeToMinutes(event.startTime)
  const endMinutes = timeToMinutes(event.endTime)
  const minuteHeight = 5 / 60
  return {
    top: `${startMinutes * minuteHeight}rem`,
    height: `${(endMinutes - startMinutes) * minuteHeight}rem`,
  }
})

/**
 * Converts a time string (HH:MM) to minutes since 7:00.
 * @param time - The time string in HH:MM format.
 * @returns The number of minutes since 7:00.
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours! - 7) * 60 + minutes!
}

// --- Data ---

const supabase = useSupabaseClient<Database>()
const isModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const localEvent = ref<IScheduleCalendarDTO | undefined>({ ...event })

// Fetch subjects for the dropdown
const { data: subjects } = await useAsyncData('subjects', async () => {
  const { data, error } = await supabase.from('subjects').select('id, name')
  if (error) {
    console.error('Error fetching subjects:', error)
    return []
  }
  return data
})

// --- Methods ---

/**
 * Opens the initial action modal on double click.
 */
function handleDoubleClick() {
  isModalOpen.value = true
}

/**
 * Opens the edit modal.
 */
function handleEdit() {
  isModalOpen.value = false
  isEditModalOpen.value = true
}

/**
 * Opens the delete confirmation modal.
 */
function handleDelete() {
  isModalOpen.value = false
  isDeleteModalOpen.value = true
}

/**
 * Deletes the schedule from the database.
 */
async function deleteSchedule() {
  const { error } = await supabase.from('schedules').delete().eq('id', event.id)
  if (error) {
    console.error('Error deleting schedule:', error)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la suppression de cette plage horaire',
      color: 'red',
      timeout: 7000,
    })
  }
  else {
    // await refreshSchedules()
    localEvent.value = undefined
    isDeleteModalOpen.value = false

    toast.add({
      title: 'Succès',
      description: 'Cette plage horaire a été supprimé',
    })
  }
}

/**
 * Closes all modals.
 */
function closeModal() {
  isModalOpen.value = false
  isEditModalOpen.value = false
  isDeleteModalOpen.value = false
}

/**
 * Submits the edited schedule to the database.
 */
async function handleEditSubmit() {
  try {
    const { error } = await supabase.from('schedules').update({
      start_time: localEvent.value!.startTime,
      end_time: localEvent.value!.endTime,
      day_of_week: localEvent.value!.dayOfWeek,
      subject_id: localEvent.value!.subjectId,
    }).eq('id', event.id)

    if (error)
      throw error

    isEditModalOpen.value = false

    toast.add({
      title: 'Succès',
      description: 'Cette plage horaire a été modifiée avec succès',
    })
  }
  catch (error) {
    console.error('Error updating schedule:', error)

    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de l\'édition de cette plage horaire',
      color: 'red',
      timeout: 7000,
    })
  }
}
</script>

<template>
  <div
    v-if="localEvent"
    class="absolute left-1 right-1 rounded-lg p-2 shadow-sm transition-all hover:shadow-md bg-white/80 dark:bg-gray-800/80 dark:shadow-gray-700 cursor-pointer hover:bg-white dark:bg-gray-800 select-none"
    :style="eventStyle"
    @dblclick="handleDoubleClick"
  >
    <div class="h-full flex flex-col">
      <div class="flex items-center font-semibold text-sm">
        <p class="truncate">
          {{ localEvent.room ? `${localEvent.room} - ` : '' }}{{ localEvent.subjectName }}
        </p>
      </div>
      <p class="text-xs opacity-90 truncate mt-1">
        {{ localEvent.teacherName }}
      </p>
      <div class="text-xs mt-auto opacity-75">
        {{ localEvent.startTime }} - {{ localEvent.endTime }}
      </div>
    </div>

    <!-- Modal for initial choice -->
    <ScheduleEventActionModal v-model="isModalOpen" @edit="handleEdit" @delete="handleDelete" />

    <!-- Modal for deletion confirmation -->
    <ScheduleEventDeleteModal v-model="isDeleteModalOpen" @close-modal="closeModal" @delete-schedule="deleteSchedule" />

    <!-- Modal for editing -->
    <ScheduleEventEditModal
      v-model:is-open="isEditModalOpen"
      v-model:event="localEvent"
      :subjects="subjects || []"
      @handle-edit-submit="handleEditSubmit"
      @close-modal="closeModal"
    />
  </div>
</template>
