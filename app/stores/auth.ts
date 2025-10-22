import { useMutation } from "@pinia/colada";
import { loginUser, exchangeSsoToken } from "~/api/auth";
import { navigateTo } from '#app';
import type { AuthenticationResult, PublicClientApplication } from '@azure/msal-browser';

declare module '#app' {
  interface NuxtApp {
    $msalInstance: PublicClientApplication
  }
}
export interface LoginCredentials {
  email: string;
  password: string;
}
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  [key: string]: any;
}

const msalLoginRequest = {
  scopes: ["User.Read", "email", "openid", "profile"],
};

export const useAuthStore = defineStore("auth", () => {
  // Getters
  const isAuthenticated = computed(() => {
    const accessToken = useCookie("access_token");
    return !!accessToken.value;
  });

  // --- Helper function to save session ---
  const saveSession = (response: LoginResponse) => {
    const accessToken = useCookie("access_token");
    const refreshToken = useCookie("refresh_token");

    accessToken.value = response.access_token;
    refreshToken.value = response.refresh_token;

    if (process.client) {
      localStorage.setItem("login_response", JSON.stringify(response));
      sessionStorage.setItem("fastapi_token", response.access_token);
    }
  };

  // Actions
  const loginMutation = () => {
    return useMutation<LoginResponse, LoginCredentials>({
      key: ["login"],
      mutation: (credentials: LoginCredentials) => loginUser(credentials),
      onSuccess: (response: LoginResponse) => {
        saveSession(response);
      },
    });
  };
  
  const ssoLoginMutation = () => {
    const { $msalInstance } = useNuxtApp();

    return useMutation<LoginResponse, void>({
      key: ['ssoLogin'],
      mutation: async () => {
        try {
          const msalResponse: AuthenticationResult = await $msalInstance.loginPopup(msalLoginRequest);
          console.log(msalResponse)
          if (msalResponse && msalResponse.accessToken) {
            const fastapiResponse = await exchangeSsoToken(msalResponse.accessToken);
            return fastapiResponse;
          } else {
            throw new Error("MSAL login failed or returned no access token.");
          }
        } catch (error) {
          console.error("SSO Error:", error);
          throw new Error("SSO login failed. Please try again.");
        }
      },
      onSuccess: (response: LoginResponse) => {
        saveSession(response);
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
      sessionStorage.removeItem("fastapi_token");
    }

    const { $msalInstance } = useNuxtApp();
    if ($msalInstance.getActiveAccount()) {
      await $msalInstance.logoutPopup();
    }

    await navigateTo('/auth/login');
  };

  return {
    loginMutation,
    ssoLoginMutation,
    logout,
    isAuthenticated,
  };
});