import type { LoginCredentials, LoginResponse } from "~/stores/auth";

export const loginUser = (credentials: LoginCredentials): Promise<LoginResponse> => {
  const { $apiv2 } = useNuxtApp();
  return $apiv2("/auth/login", {
    method: "POST",
    body: credentials,
  });
};

export const exchangeSsoToken = (azureToken: string): Promise<LoginResponse> => {
  const { $apiv2 } = useNuxtApp();
  
  // IMPORTANT: Adjust this endpoint to your FastAPI route
  return $apiv2("/auth/sso-exchange", {
    method: "POST",
    body: {
      // Send the token in the format your FastAPI backend expects
      sso_token: azureToken,
    },
  });
};