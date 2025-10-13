import { useMutation } from "@pinia/colada";

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
      mutation: (credentials: LoginCredentials) => {
        const { $apiv2 } = useNuxtApp();
        return $apiv2("/auth/login", { 
          method: "POST", 
          body: credentials 
        });
      },
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

  const logout = () => {
    const accessToken = useCookie("access_token");
    const refreshToken = useCookie("refresh_token");
    
    accessToken.value = null;
    refreshToken.value = null;
    
    if (process.client) {
      localStorage.removeItem("login_response");
    }
  };

  return {
    loginMutation,
    logout,
    isAuthenticated,
  };
});