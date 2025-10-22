import { useMutation } from "@pinia/colada";
import { loginUser } from "~/api/auth"; // Import the function
import { navigateTo } from '#app';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  [key: string]: any;
}

export const useAuthStore = defineStore("auth", () => {
  // Getters
  const isAuthenticated = computed(() => {
    const accessToken = useCookie("access_token");
    return !!accessToken.value;
  });

  // Actions
  const loginMutation = () => {
    return useMutation<LoginResponse, LoginCredentials>({
      key: ["login"],
      // Use the imported API function for the mutation
      mutation: (credentials: LoginCredentials) => loginUser(credentials),
      onSuccess: (response: LoginResponse) => {
        // Store tokens in cookies
        const accessToken = useCookie("access_token");
        const refreshToken = useCookie("refresh_token");

        accessToken.value = response.access_token;
        refreshToken.value = response.refresh_token;

        // Optional: Store response for debugging
        if (process.client) {
          localStorage.setItem("login_response", JSON.stringify(response));
        }
      },
    });
  };

  const logout = async () => {
    const accessToken = useCookie("access_token");
    const refreshToken = useCookie("refresh_token");

    accessToken.value = null;
    refreshToken.value = null;

    if (process.client) {
      localStorage.removeItem("login_response");
    }

    // Redirect to login page
    await navigateTo('/auth/login');
  };

  return {
    loginMutation,
    logout,
    isAuthenticated,
  };
});