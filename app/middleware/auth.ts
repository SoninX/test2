import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  // --- THIS IS THE FIX ---
  // If not authenticated and not on ANY page under /auth/...
  if (!auth.isAuthenticated && !to.path.startsWith('/auth')) {
  // --- END OF FIX ---
    return navigateTo('/auth/login')
  }
})