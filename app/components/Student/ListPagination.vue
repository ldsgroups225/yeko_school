<script setup lang="ts">
defineProps<{
  pageFrom: number
  pageTo: number
  total: number
  pageCount: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'update:currentPage', value: number): void
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
        <span class="font-medium">{{ total }}</span>
        résultats
      </span>
    </div>
    <UPagination
      v-model="currentPage"
      :page-count="pageCount"
      :total="totalPages"
      :ui="{
        wrapper: 'flex items-center gap-1',
        rounded: '!rounded-full min-w-[32px] justify-center',
        default: {
          activeButton: {
            variant: 'outline',
          },
        },
      }"
      @update:model-value="(value) => emit('update:currentPage', value)"
      @change="emit('change', $event)"
    />
  </div>
</template>
