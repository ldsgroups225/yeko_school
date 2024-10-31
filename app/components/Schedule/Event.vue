<script setup lang="ts">
import type { IScheduleCalendarDTO } from '~~/types'

const { event } = defineProps<{
  event: IScheduleCalendarDTO
}>()

const eventStyle = computed(() => {
  // Convert time to minutes since 7:00 (start of day)
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return (hours! - 7) * 60 + minutes!
  }

  const startMinutes = timeToMinutes(event.startTime)
  const endMinutes = timeToMinutes(event.endTime)

  // Each hour is 5rem (80px) in height
  // So each minute is 5/60 = 0.0833rem
  const minuteHeight = 5 / 60

  return {
    top: `${startMinutes * minuteHeight}rem`,
    height: `${(endMinutes - startMinutes) * minuteHeight}rem`,
  }
})
</script>

<template>
  <div
    class="absolute left-1 right-1 rounded-lg p-2 shadow-sm transition-all hover:shadow-md bg-white/80 dark:bg-gray-800/80"
    :style="eventStyle"
  >
    <div class="h-full flex flex-col">
      <div class="flex items-center font-semibold text-sm">
        <div v-if="event.room">
          <p class="truncate">
            {{ event.room }}
          </p>
          <p class="truncate">
            {{ event.subjectName }}
          </p>
        </div>
        <p v-else class="text-xs opacity-90 truncate">
          {{ event.subjectName }}
        </p>
      </div>
      <p class="text-xs opacity-90 truncate mt-1">
        {{ event.teacherName }}
      </p>
      <div class="text-xs mt-auto opacity-75">
        {{ event.startTime }} - {{ event.endTime }}
      </div>
    </div>
  </div>
</template>
