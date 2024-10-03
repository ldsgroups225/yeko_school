import type { UnwrapRefSimple } from '@vue/reactivity'

export function useTableState<T extends { [key: string]: any }>(data: Ref<T[]>) {
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const sort = ref<{ column: string, direction: 'asc' | 'desc' }>({ column: 'lastName', direction: 'asc' })
  const selectedRows = ref<T[]>([])

  const { searchTerm, selectedClasses, filteredData, resetFilters, hasNotParentFilter, hasNotClassFilter } = useFilters(data)

  const sortedData = computed(() => {
    return [...filteredData.value].sort((a, b) => {
      const column = sort.value.column
      const aValue = a[column]
      const bValue = b[column]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sort.value.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sort.value.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }
      return 0
    })
  })

  const paginatedData = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value
    return sortedData.value.slice(startIndex, startIndex + itemsPerPage.value)
  })

  const pageCount = computed(() => Math.ceil(sortedData.value.length / itemsPerPage.value))
  const pageFrom = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1)
  const pageTo = computed(() => Math.min(currentPage.value * itemsPerPage.value, sortedData.value.length))

  function onPageChange(page: number) {
    currentPage.value = page
  }

  function selectRow(row: UnwrapRefSimple<T>) {
    const index = selectedRows.value.findIndex(item => item === row)
    if (index === -1) {
      selectedRows.value.push(row)
    }
    else {
      selectedRows.value.splice(index, 1)
    }
  }

  // Reset to first page when filters change
  watch([searchTerm, selectedClasses], () => {
    currentPage.value = 1
  })

  return {
    currentPage,
    itemsPerPage,
    sort,
    selectedRows,
    paginatedData,
    pageCount,
    pageFrom,
    pageTo,
    onPageChange,
    selectRow,
    searchTerm,
    selectedClasses,
    resetFilters,
    hasNotParentFilter,
    hasNotClassFilter,
  }
}
