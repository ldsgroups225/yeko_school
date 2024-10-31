<script setup lang="ts">
import type { IScheduleCalendarDTO } from '~~/types'

const { schedule } = defineProps<{
  schedule: IScheduleCalendarDTO[]
}>()

const days = [
  { number: 1, name: 'Monday' },
  { number: 2, name: 'Tuesday' },
  { number: 3, name: 'Wednesday' },
  { number: 4, name: 'Thursday' },
  { number: 5, name: 'Friday' },
]

function getEventsForDay(dayNumber: number) {
  return schedule.filter(event => event.dayOfWeek === dayNumber)
}
</script>

<template>
  <div class="rounded-lg shadow-sm p-4 mx-auto max-w-7xl overflow-x-auto">
    <div class="flex min-w-[800px]">
      <div class="w-16 flex-shrink-0">
        <ScheduleTimelineColumn />
      </div>

      <div class="flex-1 grid grid-cols-5">
        <ScheduleDayColumn
          v-for="day in days"
          :key="day.number"
          :day-number="day.number"
          :day-name="day.name"
          :events="getEventsForDay(day.number)"
        />
      </div>
    </div>
  </div>
</template>
