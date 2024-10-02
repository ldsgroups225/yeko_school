export function useConfirmDialog() {
  const isConfirmDialogOpen = ref(false)
  const confirmDialogConfig = ref({
    title: '',
    message: '',
    onConfirm: () => {},
  })

  function openConfirmDialog(config: {
    title: string
    message: string
    onConfirm: () => void
  }) {
    confirmDialogConfig.value = config
    isConfirmDialogOpen.value = true
  }

  return {
    isConfirmDialogOpen,
    confirmDialogConfig,
    openConfirmDialog,
  }
}
