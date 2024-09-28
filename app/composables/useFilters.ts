import { se } from 'date-fns/locale'

export function useFilters<T extends { [key: string]: any }>(data: Ref<T[]>) {
  const searchTerm = ref('')
  const selectedClasses = ref<string[]>([])

  const filteredData = computed(() => {
    return data.value.filter(item =>
      (item.lastName.toLowerCase().includes(searchTerm.value.toLowerCase())
        || item.firstName.toLowerCase().includes(searchTerm.value.toLowerCase())
        || item.idNumber.toLowerCase().includes(searchTerm.value.toLowerCase()))
        && (selectedClasses.value.length === 0 || selectedClasses.value.includes(item.classId ?? '')),
    )
  })

  function resetFilters() {
    searchTerm.value = ''
    selectedClasses.value = []
  }

  return {
    searchTerm,
    selectedClasses,
    filteredData,
    resetFilters,
  }
}
