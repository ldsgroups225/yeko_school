export const YEAR_OPTIONS = [
  { label: '2024 2025', value: '2024 2025' },
  { label: '2023 2024', value: '2023 2024' },
  { label: '2022 2023', value: '2022 2023' },
]

export const STUDENT_COLUMNS = [
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

export const CLASS_COLUMNS = [
  { key: 'index', label: 'N°', sortable: true },
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'mainTeacherId', label: 'Prof principal', sortable: true },
  { key: 'studentCount', label: 'Nbr d\'élèves', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false },
]
