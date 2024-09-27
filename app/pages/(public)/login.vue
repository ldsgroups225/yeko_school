<script lang="ts" setup>
import { useUserStore } from '~/stores/userStore'

definePageMeta({
  // middleware: ['guest'],
})

const { t } = useI18n()
const userStore = useUserStore()

const fields = [
  {
    name: 'email',
    type: 'text',
    label: t('email'),
    placeholder: t('enterEmail'),
  },
  {
    name: 'password',
    label: t('password'),
    type: 'password',
    placeholder: t('enterPassword'),
  },
  {
    name: 'remember',
    label: t('rememberMe'),
    type: 'checkbox',
  },
]

const emailRegex = /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
const passwordRegex = /^[a-z0-9]{8,}$/i

function validateEmail(email?: string) {
  if (!email || !email.trim().length)
    return t('emailRequired')
  if (!emailRegex.test(email))
    return t('emailNotValid')
  return null
}

function validatePassword(password?: string) {
  if (!password || !password.trim().length)
    return t('passwordRequired')
  if (!passwordRegex.test(password))
    return t('passwordNotValid')
  return null
}

function validate(state) {
  const errors: FormError[] = []
  const emailError = validateEmail(state.email)
  const passwordError = validatePassword(state.password)

  if (emailError)
    errors.push({ path: 'email', message: emailError })
  if (passwordError)
    errors.push({ path: 'password', message: passwordError })
  return errors
}

const providers = [{
  label: t('continueWithGitHub'),
  icon: 'i-simple-icons-github',
  color: 'white' as const,
  click: () => {
    console.log('Redirect to GitHub')
  },
}]

async function onSubmit(data: any) {
  try {
    await userStore.login({
      email: data.email,
      password: data.password,
      rememberMe: data.remember,
    })

    if (userStore.isAuthenticated) {
      // Redirect to dashboard or home page
      navigateTo('/dashboard')
    }
  }
  catch (error) {
    console.error('Login error:', error)
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8">
    <UCard class="max-w-sm w-full">
      <UAuthForm
        :fields="fields"
        :providers="providers"
        :title="t('welcomeBack')"
        :ui="{ base: 'text-center', footer: 'text-center' }"
        :validate="validate"
        align="top"
        icon="i-heroicons-lock-closed"
        @submit="onSubmit"
      >
        <template #description>
          {{ t('noAccount') }}
          <NuxtLink class="text-primary font-medium" to="/">
            {{ t('signUp') }}
          </NuxtLink>
          .
        </template>

        <template #password-hint>
          <NuxtLink class="text-primary font-medium" to="/">
            {{ t('forgotPassword') }}
          </NuxtLink>
        </template>
        <template #validation>
          <UAlert v-if="userStore.error" :title="t('errorSigningIn')" color="red" icon="i-heroicons-information-circle-20-solid">
            {{ userStore.error }}
          </UAlert>
        </template>
        <template #footer>
          {{ t('bySigningIn') }}
          <NuxtLink class="text-primary font-medium" to="/">
            {{ t('termsOfService') }}
          </NuxtLink>
          .
        </template>
      </UAuthForm>
    </UCard>
  </div>
</template>
