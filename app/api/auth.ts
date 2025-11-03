import type { LoginCredentials, BackendAuthResponse } from "~/stores/auth";

export interface SsoExchangePayload {
  id_token: string;
}

export const loginUser = (credentials: LoginCredentials): Promise<BackendAuthResponse> => {
  const { $apiv2 } = useNuxtApp();
  return $apiv2("/auth/login", {
    method: "POST",
    body: credentials,
  });
};

export const exchangeSsoToken = (payload: SsoExchangePayload): Promise<BackendAuthResponse> => {
  const { $apiv2 } = useNuxtApp();
  
  return $apiv2("/auth/sso-exchange", {
    method: "POST",
    body: payload,
  });
};