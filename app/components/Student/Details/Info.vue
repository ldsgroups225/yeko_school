<script lang="ts" setup>
import { defineProps } from 'vue'

const props = defineProps<{
  label: string
  value: string | number | null | undefined
  isLoading: boolean
}>()
</script>

<template>
  <div>
    <p class="text-sm text-gray-500">
      {{ props.label }}
    </p>
    <USkeleton v-if="props.isLoading" class="h-5 w-32" />
    <p v-else class="font-medium">
      {{ props.value || 'Non renseigné' }}
    </p>
  </div>
</template>
