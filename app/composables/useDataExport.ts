import Papa from 'papaparse'

export function useDataExport() {
  function exportToCsv(data: any[]) {
    if (data.length === 0) {
      return {
        success: false,
        message: 'Il n\'y a pas de données à exporter. Veuillez d\'abord uploader un fichier.',
      }
    }

    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'exported_data.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return { success: true, message: 'Les données ont été exportées avec succès.' }
    }
    return {
      success: false,
      message: 'L\'exportation a échoué. Votre navigateur ne prend pas en charge le téléchargement de fichiers.',
    }
  }

  return {
    exportToCsv,
  }
}
