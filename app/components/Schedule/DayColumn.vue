<script setup lang="ts">
import type { IScheduleCalendarDTO } from '~~/types'

defineProps<{
  dayNumber: number
  dayName: string
  events: IScheduleCalendarDTO[]
}>()
</script>

<template>
  <div class="flex-1 border-l">
    <div class="h-14 flex items-center justify-center border-b">
      <h3 class="font-medium">
        {{ dayName }}
      </h3>
    </div>
    <div class="relative h-[660px]">
      <!-- 12 hours * 5rem + header height -->
      <ScheduleEvent
        v-for="event in events"
        :key="event.id"
        :event="event"
      />
    </div>
  </div>
</template>
