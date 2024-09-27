import type { Class } from '~~/types'

export const YEAR_OPTIONS = [
  { label: '2024 2025', value: '2024 2025' },
  { label: '2023 2024', value: '2023 2024' },
  { label: '2022 2023', value: '2022 2023' },
]

export const CLASSES: Class[] = [
  { name: 'Cp1', count: 4, subclasses: ['Cp1 - A', 'Cp1 - B', 'Cp1 - C', 'Cp1 - D'] },
  { name: 'Cp2', count: 7, subclasses: ['Cp2 - A', 'Cp2 - B', 'Cp2 - C', 'Cp2 - D', 'Cp2 - E', 'Cp2 - F', 'Cp2 - G'] },
  { name: 'CE1', count: 3, subclasses: ['CE1 - A', 'CE1 - B', 'CE1 - C'] },
]

export const COLUMNS = [
  { key: 'index', label: 'N°', sortable: true },
  { key: 'lastName', label: 'Nom', sortable: true },
  { key: 'firstName', label: 'Prénom', sortable: true },
  { key: 'idNumber', label: 'Matricule', sortable: true },
  { key: 'gender', label: 'Sexe', sortable: true },
  { key: 'dateOfBirth', label: 'Date de naissance', sortable: true },
  { key: 'age', label: 'Age', sortable: true },
  { key: 'className', label: 'Classe', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
]
