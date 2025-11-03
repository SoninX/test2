import { useMutation } from "@pinia/colada";
import { loginUser,exchangeSsoToken, type SsoExchangePayload } from "~/api/auth"; // Import the new type
import { navigateTo } from '#app';
import type { AuthenticationResult, PublicClientApplication } from '@azure/msal-browser';
import { BrowserAuthError } from '@azure/msal-browser';

declare module '#app' {
  interface NuxtApp {
    $msalInstance: PublicClientApplication
  }
}
export interface LoginCredentials {
  email: string;
  password: string;
}
// export interface LoginResponse {
//   access_token: string;
//   refresh_token: string;
//   user: string;
//   email: string; //todo: change according to what you are expecting from backedn incase of normal login
// }

export interface BackendAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  // User details might be included by the backend *after* validating the id_token
  name?: string;
  username?: string;
}

const msalLoginRequest = {
  scopes: ["User.Read", "email", "openid", "profile"],
};

export const useAuthStore = defineStore("auth", () => {
  // Getters
  const isAuthenticated = computed(() => {
    const accessToken = localStorage.getItem("accessToken");
    return !!accessToken;
  });

  // --- Helper function to save session ---
    const saveSession = (response: BackendAuthResponse) => {
    if (typeof window !== "undefined") {

      localStorage.setItem("accessToken", response.access_token);
      localStorage.setItem("refreshToken", response.refresh_token);

      if (response.name || response.username) {

        const userInfo = { name: response.name, username: response.username };
        localStorage.setItem("zebo-user-info", JSON.stringify(userInfo));
     } else {
       // Clear old user info if not present in the new response
       localStorage.removeItem("zebo-user-info");
     }
    } // decide on decoding in frontend or backend
  };

  // Actions
  const loginMutation = () => {
    return useMutation<BackendAuthResponse, LoginCredentials>({
      key: ["login"],
      mutation: (credentials: LoginCredentials) => loginUser(credentials),
      onSuccess: (response: BackendAuthResponse) => {
        saveSession(response);
      },
    });
  };
  
  const ssoLoginMutation = () => {
    const { $msalInstance } = useNuxtApp();
    const toast = useToast();

    return useMutation<BackendAuthResponse, void>({
      key: ['ssoLogin'],
      mutation: async (): Promise<BackendAuthResponse> => {
        try {
          const msalResponse: AuthenticationResult = await $msalInstance.loginPopup(msalLoginRequest);
          
          console.log("MSAL Response from Microsoft (Source of Tokens/Info):", msalResponse);

          if (!msalResponse || !msalResponse.idToken) {
            throw new Error("MSAL login failed or returned missing ID token.");
          }

          const exchangePayload: SsoExchangePayload = {
            id_token: msalResponse.idToken,
          };

          console.log("Payload sent to backend", exchangePayload);

          // --- 4. MOCK BACKEND CALL (backend not ready) ---
          // When your FastAPI /auth/sso-exchange endpoint is ready,
          // you can uncomment the real call below and remove the mock.

          const fastapiResponseRaw = await exchangeSsoToken(exchangePayload);
          // Map response if necessary (as done in loginMutation)
          const fastapiResponse: BackendAuthResponse = {
             access_token: fastapiResponseRaw.access_token,
             refresh_token: fastapiResponseRaw.refresh_token,
             token_type: fastapiResponseRaw.token_type
             // Assuming backend might add user details after validating id_token
             // name: fastapiResponseRaw.name, // Example if backend adds name
             // username: fastapiResponseRaw.username // Example if backend adds username
          };
          console.log("Actual Backend Response:", fastapiResponse);
          return fastapiResponse;

          // // --- Mock Response ---
          // const mockFastApiResponse: LoginResponse = {
          //   access_token: "mock-fastapi-access-token",
          //   refresh_token: "mock-fastapi-refresh-token",
          //   user: exchangePayload.contact.name,
          //   email: exchangePayload.contact.username,
          //   // Include the data that the backend would normally return after validation
          // };
          
          // return mockFastApiResponse;
          // // --- End of Mock ---

        } catch (error) {
          console.error("SSO Mutation Error:", error);

          // Handle common MSAL errors (like user closing the popup)
          if (error instanceof BrowserAuthError && (error.errorCode.includes("popup_window_error") || error.errorCode.includes("user_cancelled"))) {
             toast.add({ title: "Login cancelled", description: "The login popup was closed. Please try again.", color: "info" });
             throw new Error("Login popup was closed. Please try again.");
          }

          // Handle other errors
          throw new Error("SSO login failed. Please try again.");
        }
      },
      onSuccess: (response: BackendAuthResponse) => {
        // This will now run with the mock response
        saveSession(response);
        console.log("Backend response saved to session/cookies:", response);
      },
    });
  };

  const logout = async () => {

    if (import.meta.client) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      if (localStorage.getItem("zebo-user-info")) {
        localStorage.removeItem("zebo-user-info");
     }
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