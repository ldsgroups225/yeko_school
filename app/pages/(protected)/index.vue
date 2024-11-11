<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

definePageMeta({
  layout: 'auth',
  middleware: ['auth'],
})

const quickAccessButtons: Array<{ icon: string, label: string, link: RouteLocationRaw }> = [
  { icon: 'i-heroicons-user-circle', label: 'Gestion des effectifs', link: '/students' },
  { icon: 'i-heroicons-document-text', label: 'Notes et moyennes', link: '/notes' },
  { icon: 'i-heroicons-calendar-days-20-solid', label: 'Emploi du temps', link: '/schedules' },
  { icon: 'i-heroicons-clock', label: 'Ponctualité', link: '/timing' },
  { icon: 'i-heroicons-banknotes', label: 'Scolarité', link: '/scolarity' },
  { icon: 'i-heroicons-user-circle', label: 'Professeur', link: '/teacher' },
  { icon: 'i-heroicons-information-circle', label: 'Information', link: '/information' },
  { icon: 'i-heroicons-chart-bar', label: 'Suivi de performance', link: '/dashboard' },
  { icon: 'i-heroicons-chat-bubble-bottom-center', label: 'Discussion', link: '/discussion' },
]

const currentTime = computed(() => {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <main class="flex-grow flex items-center justify-center p-6">
      <div
        v-motion-fade-visible
        class="w-full max-w-6xl flex flex-col md:flex-row justify-between"
        transition="all 0.2s ease-in-out"
      >
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-3/5 mb-6 md:mb-0">
          <QuickAccessButton
            v-for="button in quickAccessButtons"
            :key="button.label.replaceAll(' ', '-').toLowerCase()"
            v-motion-slide-visible-bottom
            :icon="button.icon"
            :label="button.label"
            :link="button.link"
            transition="all 0.4s ease-in-out"
          />
        </div>
        <div class="w-full md:w-2/5 md:pl-6 flex flex-col justify-between">
          <div class="rounded-xl bg-card text-card-foreground mb-4 shadow-lg border-0 overflow-hidden">
            <div class="flex flex-col">
              <img
                src="/school-background.jpg"
                alt="École Jules Verne"
                class="w-full h-48 object-cover"
              >
              <div class="p-4 bg-white">
                <h2 class="text-xl font-bold text-primary">
                  École : Jules Verne
                </h2>
                <p class="text-secondary">
                  Effectif : 3677
                </p>
                <p class="text-secondary">
                  Classe : 39
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-center justify-center">
            <img
              v-motion-pop-visible
              src="/logo.png"
              alt="Logo Yeko"
              class="h-64 w-64 object-contain rounded-md"
              transition="all 0.4s ease-in-out"
            >
            <div
              v-motion-roll-visible-bottom
              class="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-2xl font-bold w-[140px] flex items-center justify-center p-4 mx-auto mt-4"
              transition="all 0.6s ease-in-out"
            >
              {{ currentTime }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
