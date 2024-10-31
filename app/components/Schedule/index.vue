<script setup lang="ts">
import type { IScheduleCalendarDTO } from '~~/types'

const { schedule } = defineProps<{
  schedule: IScheduleCalendarDTO[]
}>()

const daysOfWeek = [1, 2, 3, 4, 5] // Monday - Friday

function getScheduleForDay(day: number) {
  return schedule.filter(item => item.dayOfWeek === day)
}
</script>

<template>
  <div class="grid grid-cols-5 gap-4 p-4">
    <ScheduleDay v-for="day in daysOfWeek" :key="day" :day="day" :schedule="getScheduleForDay(day)" />
  </div>
</template>
