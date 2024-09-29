<script setup lang="ts">
const props = defineProps<{
  length: number
  placeholder?: string
}>()

const emit = defineEmits(['complete'])

const pinInputs = ref<string[]>(Array.from({ length: props.length }).fill('') as string[])
const inputRefs = ref<HTMLInputElement[]>([])

const isComplete = computed(() => pinInputs.value.every(digit => digit !== ''))

onMounted(() => {
  nextTick(() => {
    focusInput(0)
  })
})

function handleInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value

  if (value.length > 1) {
    // Handle paste
    const pastedValue = value.slice(0, props.length)
    pinInputs.value = [...pastedValue.split(''), ...Array.from({ length: props.length - pastedValue.length }).fill('') as string[]]
    focusInput(Math.min(pastedValue.length, props.length - 1))
  }
  else {
    pinInputs.value[index] = value
    if (value !== '' && index < props.length - 1) {
      focusInput(index + 1)
    }
  }

  if (isComplete.value) {
    emit('complete', pinInputs.value.join(''))
  }
}

function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && pinInputs.value[index] === '' && index > 0) {
    focusInput(index - 1)
  }
  else if (event.key === 'ArrowLeft' && index > 0) {
    focusInput(index - 1)
  }
  else if (event.key === 'ArrowRight' && index < props.length - 1) {
    focusInput(index + 1)
  }
}

function focusInput(index: number) {
  nextTick(() => {
    inputRefs.value[index]?.focus()
  })
}
</script>

<template>
  <div class="flex gap-2 items-center">
    <input
      v-for="(_digit, index) in pinInputs"
      :key="index"
      :ref="el => { if (el) inputRefs[index] = el as HTMLInputElement }"
      v-model="pinInputs[index]"
      type="text"
      inputmode="numeric"
      :placeholder="placeholder"
      maxlength="1"
      class="w-12 h-12 text-center text-xl font-semibold bg-white dark:bg-gray-800 rounded-md border border-gray-300 focus:border-primary-500 dark:border-gray-700 focus:ring focus:ring-primary-200 dark:focus:ring-gray-700 focus:ring-opacity-50 transition-all duration-200"
      @input="handleInput(index, $event)"
      @keydown="handleKeydown(index, $event)"
      @paste.prevent
    >
  </div>
</template>
