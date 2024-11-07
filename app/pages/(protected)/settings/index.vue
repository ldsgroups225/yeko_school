<script lang="ts" setup>
import SettingsProfileForm from '~/components/Settings/ProfileForm.vue'
import Staff from '~/components/Settings/Staff.vue'
import TeacherForm from '~/components/Settings/TeacherForm.vue'

const activeTab = ref(0)

// Define tabs configuration
const tabs = [
  {
    label: 'Ecole',
    component: SettingsProfileForm,
  },
  {
    label: 'Membres',
    component: Staff,
  },
  {
    label: 'Créer un compte professeur',
    component: TeacherForm,
  },
]
</script>

<template>
  <div class="container mx-auto py-10">
    <UCard>
      <template #header>
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          School Settings
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your school's profile, academic year, subjects, and staff.
        </p>
      </template>

      <UTabs
        v-model="activeTab"
        :items="tabs"
        class="w-full"
      >
        <template #item="{ item }">
          <component :is="item.component" />
        </template>
      </UTabs>
    </UCard>
  </div>
</template>
