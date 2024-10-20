<script setup lang="ts">
import type { Database } from '~~/types/database.types'
import { ERole } from '~~/types'
import { formatFullName } from '~~/utils/formatting'
import { getChangedFields } from '~~/utils/getChangedFields'
import { classSchema, type ICreateClassDTO, type IUpdateClassDTO, updateClassSchema } from '~~/utils/validators'

const { cls } = defineProps<{
  cls?: ICreateClassDTO
}>()

const emit = defineEmits(['close'])

const userStore = useUserStore()
const { userData } = storeToRefs(userStore)
const classStore = useClassStore()
const { createClass, updateClass } = classStore
const { error, isLoading } = storeToRefs(classStore)

const localError = ref('')
const isConfirmationModalOpen = ref(false)

let initialForm: IUpdateClassDTO

const form = ref<IUpdateClassDTO>({
  name: '',
  mainTeacherId: '',
  gradeId: 0,
  schoolId: userData.value!.school.id,
})

const supabase = useSupabaseClient<Database>()
const { data: grades, error: gradesError } = await useAsyncData('grades', async () => {
  const { data, error } = await supabase.from('grades')
    .select('value:id, label:name')
    .eq('cycle_id', userData.value!.school.cycleId)
    .order('id')
  if (error) {
    throw error
  }
  return data
})

const { data: teachers, error: teachersError } = await useAsyncData('teachers', async () => {
  const { data, error } = await supabase.from('users')
    .select('value:id, first_name, last_name, email, user_roles(role_id)')
    .eq('user_roles.role_id', ERole.TEACHER)
    .order('first_name')
  if (error) {
    throw error
  }
  return data.map(teacher => ({
    value: teacher.value,
    label: formatFullName(teacher.first_name, teacher.last_name, teacher.email),
  }))
})

const isFormValid = computed(() => {
  return cls ? updateClassSchema.safeParse(form.value).success : classSchema.safeParse(form.value).success
})

onMounted(() => {
  if (cls) {
    const { name, gradeId, mainTeacherId } = cls
    initialForm = {
      name,
      gradeId,
      mainTeacherId: mainTeacherId ?? '',
      schoolId: userData.value!.school.id,
    }
    form.value = { ...initialForm }
  }
})

function openConfirmationModal() {
  if (!isFormValid.value) {
    localError.value = 'Veuillez remplir tous les champs obligatoires.'
    return
  }
  isConfirmationModalOpen.value = true
}

async function handleSubmit() {
  try {
    const changedFields = getChangedFields<IUpdateClassDTO>(form.value, initialForm)

    if (Object.keys(changedFields).length === 0) {
      localError.value = 'Aucune modification détectée.'
      return
    }

    let _success: boolean

    if (cls)
      _success = await updateClass(cls.id!, changedFields)
    else
      _success = await createClass(form.value as ICreateClassDTO)

    if (_success) {
      emit('close')
    }
    else {
      handleError()
    }
  }
  catch {
    handleError()
  }
}

function handleError() {
  localError.value = error.value || 'Une erreur est survenue lors de la mise à jour de la classe'
}

function handleConfirmationModalClose(value: boolean) {
  isConfirmationModalOpen.value = value
  if (!value) {
    localError.value = ''
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            {{ cls ? 'Modifier la classe' : 'Créer une classe' }}
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="$emit('close')" />
        </div>

        <UAlert v-if="localError || gradesError || teachersError" color="red" icon="i-heroicons-exclamation-triangle" :title="localError || gradesError?.message || teachersError?.message" />
      </template>
      <div class="p-4 space-y-4">
        <UFormGroup label="Nom de la classe" required>
          <UInput v-model="form.name" />
        </UFormGroup>

        <UFormGroup label="Niveau scolaire" required>
          <USelectMenu v-model="form.gradeId" :options="grades" placeholder="Choix..." value-attribute="value" option-attribute="label" />
        </UFormGroup>

        <UFormGroup label="Enseignant principal">
          <USelectMenu v-model="form.mainTeacherId as any" :options="teachers" placeholder="Choix..." value-attribute="value" option-attribute="label" />
        </UFormGroup>

        <UAlert v-if="localError || error" color="red" icon="i-heroicons-exclamation-triangle" :title="localError" />
      </div>
      <template #footer>
        <div class="flex justify-end space-x-3">
          <UButton color="black" variant="soft" @click="$emit('close')">
            Annuler
          </UButton>
          <UButton color="primary" :loading="isLoading" :disabled="!isFormValid" @click="openConfirmationModal">
            {{ cls ? 'Mettre à jour' : 'Créer' }}
          </UButton>
        </div>
      </template>
    </UCard>

    <ConfirmDialog
      v-model="isConfirmationModalOpen"
      :title="cls ? 'Confirmer la mise à jour' : 'Confirmer la création'"
      :message="cls ? 'Êtes-vous sûr de vouloir mettre à jour les informations de cette classe ?' : 'Êtes-vous sûr de vouloir créer cette classe ?'"
      :on-confirm="handleSubmit"
      @update:model-value="handleConfirmationModalClose"
    />
  </div>
</template>
