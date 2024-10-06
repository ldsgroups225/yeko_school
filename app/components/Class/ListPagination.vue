<script setup lang="ts">
defineProps<{
  pageFrom: number
  pageTo: number
  pageCount: number
  totalItems: number
}>()

const emit = defineEmits<{
  (e: 'change', value: number): void
}>()

const currentPage = defineModel<number>({
  default: 1,
})
</script>

<template>
  <div class="flex flex-wrap justify-between items-center">
    <div>
      <span class="text-sm leading-5">
        Affichage de
        <span class="font-medium">{{ pageFrom }}</span>
        à
        <span class="font-medium">{{ pageTo }}</span>
        sur
        <span class="font-medium">{{ totalItems }}</span>
        résultats
      </span>
    </div>
    <UPagination
      v-model="currentPage"
      :page-count="parseInt(pageCount.toString())"
      :total="totalItems"
      :ui="{
        wrapper: 'flex items-center gap-1',
        rounded: '!rounded-full min-w-[32px] justify-center',
        default: {
          activeButton: {
            variant: 'outline',
          },
        },
      }"
      @change="emit('change', $event)"
    />
  </div>
</template>
