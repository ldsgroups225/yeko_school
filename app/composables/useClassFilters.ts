export function useClassFilters<T extends { [key: string]: any }>(data: Ref<T[]>) {
  const searchTerm = ref('')

  const hasNotMainTeacherFilter = ref(false)

  const filteredData = computed(() => {
    return data.value.filter(item =>
      (
        hasNotMainTeacherFilter.value
          ? item.mainTeacherId === null
          : true
            || item.name.toLowerCase().includes(searchTerm.value.toLowerCase())
      ),
    )
  })

  function resetFilters() {
    searchTerm.value = ''
  }

  return {
    searchTerm,
    filteredData,
    resetFilters,
    hasNotMainTeacherFilter,
  }
}
