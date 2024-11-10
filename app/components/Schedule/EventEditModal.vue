<script setup lang="ts">
import type { IScheduleCalendarDTO } from '~~/types'
import { DAYS_OF_WEEK_OPEN } from '~/constants'

defineProps<{
  subjects: { id: string, name: string }[]
}>()

const emit = defineEmits(['handleEditSubmit', 'closeModal'])

const isEditModalOpen = defineModel<boolean>('isOpen', { default: false })
const event = defineModel<IScheduleCalendarDTO>('event', { default: () => ({ startTime: '', endTime: '', dayOfWeek: 1, subjectId: 1 }) })
</script>

<template>
  <UModal v-model="isEditModalOpen">
    <UCard>
      <template #header>
        <h3>Éditer l'horaire</h3>
      </template>
      <form class="flex flex-col gap-4" @submit.prevent="emit('handleEditSubmit')">
        <UFormGroup label="Heure de début">
          <UInput v-model="event.startTime" placeholder="Ex.: 07:00" icon="i-carbon-alarm-add" />
        </UFormGroup>

        <UFormGroup label="Heure de fin">
          <UInput v-model="event.endTime" placeholder="Ex.: 08:00" icon="i-carbon-alarm-subtract" />
        </UFormGroup>

        <UFormGroup label="Jour de la semaine">
          <USelect
            v-model="event.dayOfWeek"
            :options="DAYS_OF_WEEK_OPEN"
            icon="i-heroicons-calendar-days-20-solid"
            option-attribute="name"
            value-attribute="number"
          />
        </UFormGroup>

        <UFormGroup label="Matière">
          <USelect
            v-model="event.subjectId"
            :options="subjects"
            icon="i-carbon-course"
            option-attribute="name"
            value-attribute="id"
          />
        </UFormGroup>

        <div class="flex justify-center space-x-4 mt-4">
          <UButton color="primary" type="submit">
            Enregistrer
          </UButton>
          <UButton color="gray" @click="emit('closeModal')">
            Annuler
          </UButton>
        </div>
      </form>
    </UCard>
  </UModal>
</template>
