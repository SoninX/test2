import type { LoginCredentials, LoginResponse } from "~/stores/auth";

/**
 * Performs the login API call using the configured $apiv2 client.
 * This ensures that all interceptors for auth requests are applied.
 * @param credentials The user's email and password.
 * @returns A promise that resolves to the login response.
 */
export const loginUser = (credentials: LoginCredentials): Promise<LoginResponse> => {
  const { $apiv2 } = useNuxtApp();
  return $apiv2("/auth/login", {
    method: "POST",
    body: credentials,
  });
};