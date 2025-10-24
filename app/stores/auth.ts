import { useMutation } from "@pinia/colada";
import { loginUser, exchangeSsoToken } from "~/api/auth";
import { navigateTo } from '#app';
import type { AuthenticationResult, PublicClientApplication } from '@azure/msal-browser';
import { InteractionRequiredAuthError, BrowserAuthError } from '@azure/msal-browser';

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
          
          // --- 1. LOG MSAL RESPONSE (As you requested) ---
          console.log("MSAL Response from Microsoft:", msalResponse);

          if (msalResponse && msalResponse.accessToken) {
            
            // --- 2. STORE REAL TOKEN FOR YOUR TESTING ---
            if (process.client) {
              sessionStorage.setItem("msal_token_for_testing", msalResponse.accessToken);
              console.log("Real MSAL access token stored in sessionStorage('msal_token_for_testing') for backend testing.");
            }

            // --- 3. MOCK BACKEND CALL (backend not ready) ---
            // When your FastAPI /auth/sso-exchange endpoint is ready,
            // you can uncomment the real call below and remove the mock.

            // const fastapiResponse = await exchangeSsoToken(msalResponse.accessToken);
            // return fastapiResponse;

            // --- Mock Response ---
            const mockFastApiResponse: LoginResponse = {
              access_token: "mock-access-token-from-sso",
              refresh_token: "mock-refresh-token-from-sso",
              user: msalResponse.account?.name || "SSO User"
            };
            
            return mockFastApiResponse;
            // --- End of Mock ---

          } else {
            throw new Error("MSAL login failed or returned no access token.");
          }
        } catch (error) {
          console.error("SSO Mutation Error:", error);

          // Handle common MSAL errors (like user closing the popup)
          if (error instanceof BrowserAuthError && (error.errorCode.includes("popup_window_error") || error.errorCode.includes("user_cancelled"))) {
             throw new Error("Login popup was closed. Please try again.");
          }

          // Handle other errors
          throw new Error("SSO login failed. Please try again.");
        }
      },
      onSuccess: (response: LoginResponse) => {
        // This will now run with the mock response
        saveSession(response);
        console.log("Mock session saved:", response);
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
      sessionStorage.removeItem("msal_token_for_testing");
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