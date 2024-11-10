<script setup lang="ts">
const emit = defineEmits(['deleteSchedule', 'closeModal'])

const isDeleteModalOpen = defineModel<boolean>({ default: false })
</script>

<template>
  <UModal v-model="isDeleteModalOpen">
    <UCard>
      <template #header>
        <h3>Confirmer la suppression</h3>
      </template>
      <p>Êtes-vous sûr de vouloir supprimer cet horaire?</p>
      <div class="flex justify-center space-x-4">
        <UButton color="red" @click="emit('deleteSchedule')">
          Oui
        </UButton>
        <UButton color="gray" @click="emit('closeModal')">
          Non
        </UButton>
      </div>
    </UCard>
  </UModal>
</template>
