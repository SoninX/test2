import type { LoginCredentials, LoginResponse } from "~/stores/auth";

// Function to perform login API call
const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const data = await $fetch<LoginResponse>(
    "https://api.escuelajs.co/api/v1/auth/login",
    {
      method: "POST",
      body: credentials,
    }
  );
  return data;
};

export { loginUser };