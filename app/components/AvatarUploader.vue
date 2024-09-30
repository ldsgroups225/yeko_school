<script setup lang="ts">
import type { AvatarSize } from '#ui/types'

const props = defineProps<{
  modelValue: string
  size?: AvatarSize
}>()

const emit = defineEmits(['update:modelValue'])

const avatarBase64 = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const fileInputRef = ref<HTMLInputElement | null>(null)
const isHovered = ref(false)
const previewUrl = ref(props.modelValue)

const fileRef = ref<File | null>(null)

const fileBlob = computed(() => fileRef.value || new Blob())

const { base64 } = useBase64(fileBlob)

watch(base64, (newValue) => {
  if (newValue && newValue !== 'data:application/octet-stream;base64,') {
    avatarBase64.value = newValue
  }
})

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    fileRef.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

function openFileUpload() {
  fileInputRef.value?.click()
}
</script>

<template>
  <div
    class="relative inline-block"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <UAvatar
      :src="previewUrl"
      :size="size || '3xl'"
      alt="User Avatar"
      class="cursor-pointer transition-all duration-300"
      :class="{ 'opacity-75': isHovered }"
      @click="openFileUpload"
    />
    <div
      v-if="isHovered"
      class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full transition-all duration-300"
    >
      <UButton
        color="white"
        variant="solid"
        icon="i-heroicons-pencil-square-20-solid"
        size="lg"
        class="!rounded-full"
        @click="openFileUpload"
      />
    </div>
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileUpload"
    >
  </div>
</template>
