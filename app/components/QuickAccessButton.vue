<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const { icon, label, link } = defineProps<{
  icon: string
  label: string
  link: RouteLocationRaw
}>()

const router = useRouter()
const isClicking = ref(false)

function handleClick() {
  if (!isClicking.value) {
    isClicking.value = true
    setTimeout(() => {
      isClicking.value = false
      router.push(link)
    }, 600)
  }
}
</script>

<template>
  <div>
    <div
      class="rounded-xl border text-card-foreground flex flex-col items-center justify-center p-4 bg-white h-full text-xl cursor-pointer shadow-sm transition-all duration-300 ease-in-out hover:bg-orange-50 hover:shadow-lg hover:scale-105 group" :class="[
        { 'animate-bounce-spring': isClicking },
      ]"
      @click="handleClick"
    >
      <UIcon
        :name="icon"
        class="text-orange-600 mb-2 size-14
        transition-transform duration-300 ease-in-out
        group-hover:scale-110"
      />
      <span
        class="text-md dark:text-gray-700/60 text-center
        transition-all duration-300 ease-in-out
        group-hover:text-orange-600"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>

<style>
@keyframes bounce-spring {
  0% {
    transform: scale(1.05) translateY(0);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  25% {
    transform: scale(1.05) translateY(-20px);
    animation-timing-function: cubic-bezier(0.8, 0, 0.2, 1);
  }
  45% {
    transform: scale(1.05) translateY(0);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  65% {
    transform: scale(1.05) translateY(-10px);
    animation-timing-function: cubic-bezier(0.8, 0, 0.2, 1);
  }
  85% {
    transform: scale(1.05) translateY(0);
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  92% {
    transform: scale(1.05) translateY(-3px);
    animation-timing-function: cubic-bezier(0.8, 0, 0.2, 1);
  }
  100% {
    transform: scale(1.05) translateY(0);
  }
}

.animate-bounce-spring {
  animation: bounce-spring 0.6s ease-out;
}
</style>
