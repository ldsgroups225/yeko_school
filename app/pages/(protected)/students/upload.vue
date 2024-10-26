<script setup lang="ts">
import type { Database } from '~~/types/database.types'
import type { IStudentImportDTO } from '~~/utils/validators'
import { parseFrenchDate } from '~~/utils/dateTime'
import { studentImportDTOSchema } from '~~/utils/validators'

type InsertStudent = Database['public']['Tables']['students']['Insert']

// Store
const toast = useToast()
const router = useRouter()
const { userData } = useUserStore()

// Supebase client
const supabase = useSupabaseClient<Database>()

const isSubmitting = ref(false)

const { data: classes, error, status, execute } = await useAsyncData('classes', async () => {
  if (!userData || !userData?.school) {
    throw new Error('Unauthorized')
  }
  const { data, error: err } = await supabase
    .from('classes')
    .select('id, name')
    .eq('school_id', userData?.school?.id)
    .order('grade_id')

  if (err)
    throw err
  return data
}, { immediate: false })

// Function to handle the upload of user data
async function handleUserUpload(data: IStudentImportDTO[]) {
  try {
    isSubmitting.value = true

    const schoolId = userData?.school.id

    if (!schoolId) {
      throw new Error('Unauthorized')
    }

    const classMap = new Map(classes.value?.map(c => [c.name.toLowerCase(), c.id]))
    const students = data.map((student) => {
      const processedStudent: InsertStudent = {
        school_id: schoolId,
        parent_id: null,
        class_id: student.className ? classMap.get(student.className.toLowerCase()) || null : null,
        id_number: student.idNumber,
        first_name: student.firstName,
        last_name: student.lastName,
        date_of_birth: student.dateOfBirth ? parseFrenchDate(student.dateOfBirth)?.toISOString() ?? null : null,
        gender: student.gender as 'M' | 'F',
        address: student.address || null,
        avatar_url: student.avatarUrl || null,
      }
      return processedStudent
    })

    const { error } = await supabase.from('students').insert(students)

    if (error) {
      throw error
    }

    toast.add({
      title: 'Succès',
      description: 'Les élèves ont été enregistrés',
      color: 'emerald',
    })

    await router.replace('/students')
  }
  catch (err) {
    const error = err as Error & { details: string }
    if (error.details.includes('Key (id_number)')) {
      const idNumber = error.details.match(/Key \(id_number\)=\((.*)\)/)?.[1]
      toast.add({
        title: 'Erreur',
        description: `L'élève avec la matricule ${idNumber} existe déjà.`,
        color: 'red',
        timeout: 7000,
        icon: 'heroicons:exclamation-triangle',
      })
    }
    else {
      toast.add({
        title: 'Erreur',
        description: 'Une erreur s\'est produite lors de l\'importation des élèves.',
        color: 'red',
      })
    }
    console.error(error)
  }
  finally {
    isSubmitting.value = false
  }
}

onMounted(async () => await execute())
</script>

<template>
  <div class="h-[calc(100vh-64px)] flex flex-col">
    <h1 class="text-2xl font-bold mb-4">
      Page d'importation des élèves de l'école
    </h1>
    <div v-if="status === 'pending'" class="text-center flex flex-col h-full items-center justify-center">
      <p>Chargement des classes...</p>
      <Icon name="heroicons:arrow-path" class="animate-spin text-4xl" />
    </div>

    <div v-else-if="status === 'error'" class="text-center flex flex-col h-full items-center justify-center">
      <p>Une erreur s'est produite lors du chargement des classes.</p>
      <p>{{ error?.message }}</p>
      <UButton color="red" @click="execute()">
        Réessayer
      </UButton>
    </div>

    <DataUploader v-else :schema="studentImportDTOSchema" :on-upload="handleUserUpload" />
  </div>
</template>
