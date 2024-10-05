export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()
  const publicPages = ['/', '/login']

  if (user.value && from.path && !publicPages.includes(from.path)) {
    return navigateTo(from.path)
  }

  return navigateTo('/dashboard')
})
