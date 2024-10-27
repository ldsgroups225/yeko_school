import Papa from 'papaparse'
import { useDropzone } from 'vue3-dropzone'
import * as XLSX from 'xlsx'
import { z } from 'zod'

export function useDataImport(schema: z.ZodObject<any, any, any, any>) {
  const parsedData = ref<any[]>([])
  const errors = ref<{ type: string, code: string, message: string, row?: number }[]>([])
  const fileError = ref<{ title: string, description: string | null } | null>(null)
  const validationMessage = ref<{ type: 'success' | 'error', title: string, description: string | null } | null>(null)

  function matchSchemaKey(header: string, schemaKeys: string[]): string {
    const exactMatch = schemaKeys.find(key => key === header)
    if (exactMatch)
      return exactMatch

    const lowerHeader = header.toLowerCase()
    const caseInsensitiveMatch = schemaKeys.find(key => key.toLowerCase() === lowerHeader)
    if (caseInsensitiveMatch)
      return caseInsensitiveMatch

    return header
  }

  function validateAndSetData(data: any[]) {
    const newErrors: { row: number, field: string, title: string, description: string | null }[] = []
    parsedData.value = data.map((row, index) => {
      try {
        return schema.parse(row)
      }
      catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            newErrors.push({
              row: index + 1,
              field: err.path.join('.'),
              title: `Erreur à la ligne ${index + 1}`,
              description: err.message,
            })
          })
        }
        return row
      }
    })
    errors.value = newErrors.map(err => ({
      type: err.field,
      code: err.title,
      message: err.description || '',
      row: err.row,
    }))

    if (newErrors.length > 0) {
      validationMessage.value = {
        type: 'error',
        title: 'Erreur de validation',
        description: `Des erreurs ont été détectées dans les données (${newErrors.length}). Veuillez les corriger.`,
      }
    }
    else {
      validationMessage.value = {
        type: 'success',
        title: 'Validation réussie',
        description: 'Super, vos données sont correctes et prêtes à être sauvegardées.',
      }
    }
  }

  function parseFile(file: File) {
    const fileType = file.name.split('.').pop()?.toLowerCase()
    fileError.value = null
    validationMessage.value = null
    errors.value = []

    if (fileType === 'csv') {
      parseCsv(file)
    }
    else if (fileType === 'xlsx' || fileType === 'xls') {
      parseExcel(file)
    }
    else if (fileType === 'json') {
      parseJson(file)
    }
    else {
      fileError.value = {
        title: 'Type de fichier non pris en charge',
        description: 'Veuillez uploader un fichier CSV, Excel ou JSON.',
      }
    }
  }

  function parseCsv(file: File) {
    const schemaKeys = Object.keys(schema.shape)

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        handleParseResults(results, schemaKeys)
      },
      error: (error) => {
        fileError.value = {
          title: 'Erreur d\'analyse CSV',
          description: error.message,
        }
      },
      transformHeader: header => header.trim(),
    })
  }

  function parseExcel(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]

        if (sheetName) {
          const worksheet = workbook.Sheets[sheetName]
          if (worksheet) {
            const jsonData = XLSX.utils.sheet_to_json(worksheet)
            const transformedData = transformExcelData(jsonData)
            validateAndSetData(transformedData)
          }
          else {
            fileError.value = {
              title: 'Erreur Excel',
              description: 'Feuille de calcul vide dans le fichier Excel',
            }
          }
        }
        else {
          fileError.value = {
            title: 'Erreur Excel',
            description: 'Aucune feuille trouvée dans le fichier Excel',
          }
        }
      }
      catch (error) {
        fileError.value = {
          title: 'Erreur d\'analyse Excel',
          description: (error as Error).message,
        }
      }
    }
    reader.onerror = () => {
      fileError.value = {
        title: 'Erreur de fichier',
        description: 'Erreur de lecture du fichier Excel',
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function parseJson(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string
        const jsonData = JSON.parse(data)
        validateAndSetData(Array.isArray(jsonData) ? jsonData : [jsonData])
      }
      catch (error) {
        fileError.value = {
          title: 'Erreur d\'analyse JSON',
          description: (error as Error).message,
        }
      }
    }
    reader.onerror = () => {
      fileError.value = {
        title: 'Erreur de fichier',
        description: 'Erreur de lecture du fichier JSON',
      }
    }
    reader.readAsText(file)
  }

  function handleParseResults(results: Papa.ParseResult<any>, schemaKeys: string[]) {
    if (results.errors && results.errors.length > 0) {
      errors.value = results.errors.map(err => ({
        type: err.type as string,
        code: err.code as string,
        message: err.message,
        row: err.row,
      }))
      fileError.value = {
        title: 'Avertissement d\'analyse CSV',
        description: `Des problèmes ont été détectés lors de l'analyse du fichier CSV : ${results.errors.map(error => `Ligne ${error.row ?? 1}: ${error.message}`).join(', ')}`,
      }
    }

    if (results.data.length === 0) {
      fileError.value = {
        title: 'Erreur d\'analyse CSV',
        description: 'Le fichier CSV ne contient pas de données valides.',
      }
      return
    }

    const transformedData = results.data.map((row: any) => {
      const transformedRow: any = {}
      Object.keys(row).forEach((key) => {
        const matchedKey = matchSchemaKey(key, schemaKeys)
        transformedRow[matchedKey] = row[key]
      })
      return transformedRow
    })

    const missingFields = schemaKeys.filter(field => !Object.keys(transformedData[0]).includes(field))

    if (missingFields.length > 0) {
      fileError.value = {
        title: 'Erreur de structure CSV',
        description: `Champs manquants dans le fichier CSV : ${missingFields.join(', ')}`,
      }
      return
    }

    validateAndSetData(transformedData)
  }

  function transformExcelData(jsonData: any[]) {
    return jsonData.map((row: any) => {
      const transformedRow: any = {}
      Object.keys(row).forEach((key) => {
        const schemaType = schema.shape[key]
        if (schemaType instanceof z.ZodNumber && typeof row[key] === 'string') {
          transformedRow[key] = Number(row[key])
        }
        else if (schemaType instanceof z.ZodBoolean && typeof row[key] === 'string') {
          transformedRow[key] = row[key].toLowerCase() === 'true'
        }
        else {
          transformedRow[key] = row[key]
        }
      })
      return transformedRow
    })
  }

  function clearErrors() {
    errors.value = []
    fileError.value = null
    validationMessage.value = null
    parsedData.value = []
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        parseFile(file)
      }
    },
    maxFiles: 1,
    multiple: false,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0]
      if (rejection) {
        fileError.value = {
          title: 'Erreur de fichier',
          description: rejection.errors.map(err => (err as any)?.message).join(', '),
        }
      }
    },
  })

  const columns = computed(() => {
    return Object.keys(schema.shape).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
    }))
  })

  const errorRows = computed(() => {
    return new Set(errors.value.map(error => error.row))
  })

  return {
    parsedData,
    errors,
    fileError,
    validationMessage,
    getRootProps,
    getInputProps,
    isDragActive,
    columns,
    errorRows,
    clearErrors,
  }
}
