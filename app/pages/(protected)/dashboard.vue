<script setup lang="ts">
const selectedYear = ref('2024')
const yearOptions = [
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '2022', value: '2022' },
]

const features = [
  { title: 'Total Students', value: '1,234', icon: 'i-heroicons-users', description: 'Manage student records, attendance, and performance.' },
  { title: 'Average Attendance', value: '92%', icon: 'i-heroicons-clock', description: 'Track student and staff punctuality and attendance.' },
  { title: 'Pending Tasks', value: '15', icon: 'i-heroicons-chart-bar', description: 'Monitor and analyze student and school performance metrics.' },
]

const recentStudents = [
  { id: 1, name: 'Lindsay Walton', class: '10A', performance: 'Excellent' },
  { id: 2, name: 'Jane Smith', class: '9B', performance: 'Good' },
  { id: 3, name: 'Alice Johnson', class: '11C', performance: 'Average' },
]

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'class', label: 'Class' },
  { key: 'performance', label: 'Performance' },
  { key: 'actions', label: 'Actions' },
]

const sort = ref<{ column: string, direction: 'asc' | 'desc' }>({
  column: 'name',
  direction: 'asc',
})

function onUpdateSort(newSort: { column: string, direction: 'asc' | 'desc' }) {
  sort.value = newSort
}

function logAction(action: string, row: { id: number }) {
  console.log(action, row.id)
}

function getActionItems(row: { id: number }) {
  return [
    [{
      label: 'Edit',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => logAction('Edit', row),
    }, {
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      click: () => logAction('Delete', row),
    }],
  ]
}
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold mb-8 text-orange-600">
      Dashboard
    </h1>
    <!-- Feature Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <UCard v-for="(feature, index) in features" :key="index">
        <template #header>
          <div class="flex items-center justify-center">
            <UIcon :name="feature.icon" class="h-12 w-12 text-orange-600 mb-4" />
          </div>
        </template>
        <div class="text-center">
          <h3 class="font-semibold text-lg mb-2">
            {{ feature.title }}
          </h3>
          <p class="text-gray-600">
            {{ feature.description }}
          </p>
        </div>
      </UCard>
    </div>
    <!-- Recent Students Table -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-semibold text-orange-600">
            Recent Students
          </h2>
          <USelectMenu v-model="selectedYear" :options="yearOptions" />
        </div>
      </template>
      <UTable
        :columns="columns"
        :rows="recentStudents"
        :sort="sort"
        @update:sort="onUpdateSort"
      >
        <template #actions-data="{ row }">
          <UDropdown :items="getActionItems(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
