import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  // If not authenticated and not already on the login page
  if (!auth.isAuthenticated && !to.path.startsWith('/auth/login')) {
    return navigateTo('/auth/login')
  }
})
