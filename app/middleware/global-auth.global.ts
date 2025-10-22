import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  // This middleware runs on every route change.
  const auth = useAuthStore();

  // Define routes that are "public" and do not require authentication.
  // We MUST include '/' for the MSAL redirect (http://localhost:3000) to work.
  const publicRoutes = ['/'];
  const isAuthRoute = to.path.startsWith('/auth');

  // Check if the route is one of our public exceptions
  const isPublic = publicRoutes.includes(to.path) || isAuthRoute;

  // If the user is not authenticated AND the route is NOT public
  if (!auth.isAuthenticated && !isPublic) {
    // Redirect to the login page
    return navigateTo('/auth/login');
  }

  // If the user IS authenticated and tries to visit login, redirect them to home
  if (auth.isAuthenticated && isAuthRoute) {
    return navigateTo('/');
  }
});