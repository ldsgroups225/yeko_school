<script setup lang="ts">
defineProps<{
  total: number
  pageTo: number
  pageFrom: number
  itemsPerPage: number
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
        <span class="font-medium">{{ pageFrom + 1 }}</span>
        à
        <span class="font-medium">{{ pageTo + 1 }}</span>
        sur
        <span class="font-medium">{{ total }}</span>
        résultats
      </span>
    </div>
    <UPagination
      v-model="currentPage"
      :page-count="itemsPerPage"
      :total="total"
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
