import type { LoginCredentials, LoginResponse } from "~/stores/auth";

export interface SsoExchangePayload {
  access_token: string;
  id_token: string;
  contact: {
    name: string;
    username: string;
  }
   // Corresponds to the 'username' key in the image
}

export const loginUser = (credentials: LoginCredentials): Promise<LoginResponse> => {
  const { $apiv2 } = useNuxtApp();
  return $apiv2("/auth/login", {
    method: "POST",
    body: credentials,
  });
};

export const exchangeSsoToken = (payload: SsoExchangePayload): Promise<LoginResponse> => {
  const { $apiv2 } = useNuxtApp();
  
  // IMPORTANT: Adjust this endpoint to your FastAPI route
  return $apiv2("/auth/sso-exchange", {
    method: "POST",
    // The payload is now sent directly as the body
    body: payload,
  });
};