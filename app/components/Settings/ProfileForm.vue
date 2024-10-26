<script setup lang="ts">
import type { ISchoolDTO } from '~~/types'
import type { Database } from '~~/types/database.types'
import { convertCase } from '~~/utils/caseConverter'
import { BUCKET } from '~/composables/useGetBucketUrl'

const toast = useToast()
const supabase = useSupabaseClient<Database>()

const config = useRuntimeConfig()
const userStore = useUserStore()
const getBucketUrl = useGetBucketUrl()

const { setUserData } = userStore
const { userData } = storeToRefs(userStore)

const isLoading = ref(false)
const previewImage = ref<string | null>(null)

const cycleIdOptions = [
  { value: 'primare', label: 'Enseignement primaire' },
  { value: 'secondary', label: 'Enseignement secondaire' },
]

const originalForm = reactive<ISchoolDTO>({
  name: '',
  code: '',
  cycleId: '',
  isTechnicalEducation: false,
  address: '',
  phone: '',
  email: '',
  imageUrl: undefined,
})

const form = reactive<ISchoolDTO>({
  name: '',
  code: '',
  cycleId: '',
  isTechnicalEducation: false,
  address: '',
  phone: '',
  email: '',
  imageUrl: undefined,
})

const changedFields: Ref<Partial<ISchoolDTO>> = ref({})

Object.keys(form).forEach((key) => {
  watch(
    () => form[key as keyof ISchoolDTO],
    (newValue: any) => {
      if (
        JSON.stringify(newValue) !== JSON.stringify((originalForm as any)[key])
      ) {
        changedFields.value[key as keyof ISchoolDTO] = newValue
      }
      else {
        delete changedFields.value[key as keyof ISchoolDTO]
      }
    },
  )
})

const {
  data: school,
  execute,
} = await useAsyncData(
  'school',
  async () => {
    const { data, error } = await supabase
      .from('schools')
      .select(
        'id, code, name, address, phone, email, image_url, cycle_id, is_technical_education',
      )
      .eq('id', userData.value!.school.id!)
      .single()

    if (error) {
      throw error
    }
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      email: data.email,
      phone: data.phone,
      cycleId: data.cycle_id,
      imageUrl: data.image_url ?? undefined,
      address: data.address ?? undefined,
      isTechnicalEducation: data.is_technical_education ?? undefined,
    } satisfies ISchoolDTO
  },
  { immediate: false },
)

watchOnce(school, (val) => {
  if (val?.id.length && val.id !== form.id) {
    Object.assign(originalForm, val)
    Object.assign(form, val)
  }

  if (val?.imageUrl) {
    previewImage.value = getBucketUrl(config.public.supabaseUrl, BUCKET.SCHOOL_IMAGE, val.imageUrl)
  }
})

// handle set imageUrl to null
function handleSetImageUrlToNull() {
  form.imageUrl = null
  previewImage.value = null
}

async function handleSubmit(e: Event) {
  e.preventDefault()

  isLoading.value = true

  try {
    // Build the payload for the PATCH request
    const payload = Object.assign({}, changedFields.value)

    if (changedFields.value.imageUrl instanceof File) {
      const fileName = `${Date.now()}.png`
      const { data, error } = await supabase.storage
        .from('school_images')
        .upload(
          `${userData.value!.school.id}/${fileName}`,
          changedFields.value.imageUrl,
          {
            cacheControl: '3600',
            upsert: true,
          },
        )

      if (error) {
        throw error
      }

      payload.imageUrl = data.path
    }

    const { error: updateError } = await supabase
      .from('schools')
      .update(convertCase(payload, 'snakeCase'))
      .eq('id', userData.value!.school.id!)

    if (updateError) {
      throw updateError
    }

    const newUserData = { ...userData.value!, school: { ...school.value!, ...payload } }

    setUserData(newUserData)

    toast.add({
      title: 'Profil mis à jour',
      description: 'Votre profil d\'école a été mis à jour avec succès.',
      color: 'primary',
    })
  }
  catch {
    toast.add({
      title: 'Erreur',
      description: 'Échec de la mise à jour du profil d\'école.',
      color: 'red',
    })
  }
  finally {
    isLoading.value = false
  }
}

function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      previewImage.value = reader.result as string
    }
    reader.readAsDataURL(file)
    form.imageUrl = file
  }
}

onMounted(async () => await execute())
</script>

<template>
  <div class="container mx-auto p-4 pt-6 md:p-6">
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Profile d'école
      </h1>
    </header>
    <div class="rounded-lg shadow-md p-4 pt-6 mb-6 md:p-6">
      <form
        class="grid grid-cols-1 gap-6 md:grid-cols-3"
        @submit.prevent="handleSubmit"
      >
        <label
          for="uploadFile1"
          class="bg-white/10 text-gray-300 p-1.5 font-semibold text-base rounded max-w-md h-52 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto font-[sans-serif] relative"
        >
          <Icon name="i-heroicons-cloud-arrow-up" class="size-12" />
          Image de l'école

          <input
            id="uploadFile1"
            type="file"
            class="hidden"
            accept="image/*"
            @change="handleImageUpload"
          >
          <img
            v-if="previewImage"
            :src="previewImage"
            alt="School image"
            class="h-52 w-72 object-cover rounded-lg pb-5"
          >

          <UButton
            v-if="previewImage"
            icon="i-heroicons-x-mark-20-solid"
            class="absolute top-3 right-2 font-bold"
            size="sm"
            color="red"
            square
            variant="soft"
            @click="handleSetImageUrlToNull"
          />
          <span v-else class="text-xs font-medium text-gray-200 mt-2">
            PNG, JPG SVG, WEBP, et GIF sont acceptées.
          </span>
        </label>

        <div class="space-y-4">
          <UFormGroup label="Nom de l'école" name="name">
            <UInput
              v-model="form.name"
              placeholder="Entrer le nom de l'école"
              required
            />
          </UFormGroup>
          <UFormGroup label="Code de l'école" name="code">
            <UInput
              v-model="form.code"
              placeholder="Entrer le code de l'école"
              required
            />
          </UFormGroup>
          <UFormGroup label="Cycle d'enseignement" name="cycleId">
            <USelect
              v-model="form.cycleId"
              :options="cycleIdOptions"
              placeholder="Sélectionnez le cycle d'enseignement"
              disabled
            />
          </UFormGroup>
          <div class="flex items-center space-x-2">
            <UToggle v-model="form.isTechnicalEducation" size="sm" color="primary" />
            <label class="text-sm font-medium text-gray-900 dark:text-white">
              Option technique
            </label>
          </div>
        </div>
        <div class="space-y-4">
          <UFormGroup label="Adresse" name="address">
            <UTextarea
              v-model="form.address"
              placeholder="Entrer l'adresse de l'école"
              required
            />
          </UFormGroup>
          <UFormGroup label="Téléphone" name="phone">
            <UInput
              v-model="form.phone"
              type="tel"
              placeholder="Entrer le numéro de téléphone"
              required
            />
          </UFormGroup>
          <UFormGroup label="Adresse e-mail" name="email">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="Entrer l'adresse e-mail"
              required
            />
          </UFormGroup>
        </div>
        <div class="md:col-span-3 mx-auto mt-10">
          <UButton
            type="submit"
            :loading="isLoading"
            :disabled="isLoading"
            block
            color="primary"
          >
            {{
              isLoading ? "Enregistrement..." : "Enregistrer les modifications"
            }}
          </UButton>
        </div>
      </form>
    </div>
    <footer class="text-gray-500 text-sm">
      &copy; {{ new Date().getFullYear() }} Profile d'école
    </footer>
  </div>
</template>
