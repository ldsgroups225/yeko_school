<script setup lang="ts">
import type { Class } from '~~/types'

const props = defineProps<{
  classes?: Class[]
  selectedClasses: string[]
  gradeHasSelectedSubclass: (grade: { subclasses: { id: string }[] }) => boolean
}>()

const emit = defineEmits<{
  (e: 'update:searchTerm', value: string): void
  (e: 'toggleSubclass', value: string): void
}>()

const searchTerm = defineModel<string>()

function getDropdownItems(subclasses: { id: string, name: string }[]) {
  return subclasses.map(subclass => ({
    label: props.selectedClasses.includes(subclass.id) ? `${subclass.name} ✔️` : `${subclass.name}`,
    click: () => emit('toggleSubclass', subclass.id),
    selected: props.selectedClasses.includes(subclass.id),
  }))
}
</script>

<template>
  <div class="flex items-center justify-between gap-3 px-4 py-3">
    <UInput
      v-model="searchTerm"
      icon="i-heroicons-magnifying-glass-20-solid"
      placeholder="Rechercher un élève..."
      @update:model-value="(value) => emit('update:searchTerm', value)"
    />
    <div class="flex flex-wrap gap-2">
      <UDropdown
        v-for="cls in classes"
        :key="cls.name"
        :items="[getDropdownItems(cls.subclasses)]"
      >
        <UButton variant="outline" class="flex items-center">
          {{ cls.name }}
          <UIcon name="i-heroicons-chevron-down" class="ml-2 h-4 w-4" />
          <UIcon
            v-if="gradeHasSelectedSubclass(cls)"
            name="i-heroicons-eye-20-solid"
            class="ml-1 h-4 w-4 text-green-700 dark:text-green-400"
          />
        </UButton>
      </UDropdown>
    </div>
  </div>
</template>
