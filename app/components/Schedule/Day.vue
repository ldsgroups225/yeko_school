<script setup lang="ts">
import type { IScheduleCalendarDTO } from '~~/types'

const props = defineProps<{
  day: number
  schedule: IScheduleCalendarDTO[]
}>()

const dayName = computed(() => {
  switch (props.day) {
    case 1: return 'Lundi'
    case 2: return 'Mardi'
    case 3: return 'Mercredi'
    case 4: return 'Jeudi'
    case 5: return 'Vendredi'
    default: return ''
  }
})

const timeSlots = computed(() => {
  const slots: string[] = []
  for (let i = 7; i <= 18; i++) {
    const hour = i < 10 ? `0${i}` : `${i}`
    slots.push(`${hour}:00`)
  }
  return slots
})
</script>

<template>
  <div class="border border-gray-300 rounded-lg p-2">
    <h3 class="text-lg font-medium mb-2">
      {{ dayName }}
    </h3>
    <div class="grid grid-rows-[repeat(11,minmax(50px,1fr))] gap-1">
      <div v-for="(slot, index) in timeSlots" :key="index" class="h-full">
        <div
          v-for="item in schedule.filter((item) => item.startTime === slot)" :key="item.id"
          class="bg-[#60a5fa] text-white rounded-lg p-1"
        >
          {{ item.subjectName }} ({{ item.teacherName }})
        </div>
      </div>
    </div>
  </div>
</template>
