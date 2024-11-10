<script setup lang="ts">
const emit = defineEmits(['edit', 'delete'])

const isModalOpen = defineModel<boolean>({ default: false })
</script>

<template>
  <UModal v-model="isModalOpen">
    <UCard>
      <template #header>
        <h3>Choisissez une action</h3>
      </template>
      <div class="flex justify-center space-x-4">
        <UButton color="primary" @click="emit('edit')">
          Éditer
        </UButton>
        <UButton color="red" @click="emit('delete')">
          Supprimer
        </UButton>
      </div>
    </UCard>
  </UModal>
</template>
