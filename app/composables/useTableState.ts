export function useTableState<T>(data: Ref<T[]>) {
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const sort = ref({ column: 'lastName', direction: 'asc' })
  const selectedRows = ref<T[]>([])

  const paginatedData = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value
    return data.value.slice(startIndex, startIndex + itemsPerPage.value)
  })

  const pageCount = computed(() => Math.ceil(data.value.length / itemsPerPage.value))
  const pageFrom = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1)
  const pageTo = computed(() => Math.min(currentPage.value * itemsPerPage.value, data.value.length))

  function onPageChange(page: number) {
    currentPage.value = page
  }

  function selectRow(row: T) {
    const index = selectedRows.value.findIndex(item => item === row)
    if (index === -1) {
      selectedRows.value.push(row)
    }
    else {
      selectedRows.value.splice(index, 1)
    }
  }

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
  }
}
