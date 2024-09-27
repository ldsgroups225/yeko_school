export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  const publicPages = ['/', '/login']

  // if user exist and path key exist in from and from is not public page, redirect to from else redirect to dashboard
  if (user && from.path && !publicPages.includes(from.path)) {
    return navigateTo(from.path)
  }
  else {
    return navigateTo('/dashboard')
  }
})
