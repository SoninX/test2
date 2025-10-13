<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: "Login",
  description: "Login to your account to continue",
});

const toast = useToast();
const router = useRouter();

// Validation schema
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Must be at least 8 characters"),
});

type Schema = z.output<typeof schema>;

const authStore = useAuthStore();
const loginMutation = authStore.loginMutation();
const { mutateAsync: login, isLoading: isLoading, error } = loginMutation;
// const { mutateAsync: login, isPending: isLoading, error } = authStore.loginMutation();

// Reactive form data
const formData = reactive({
  email: '',
  password: '',
  remember: false
});

// Form submission
async function onSubmit(event?: Event) {
  if (event) {
    event.preventDefault();
  }

  try {
    await login({
      email: formData.email,
      password: formData.password,
    });

    toast.add({
      title: "Login successful!",
      color: "primary",
    });

    await router.push("/");
  } catch (error: any) {
    console.error("Login error:", error);

    const message =
      error?.data?.message ||
      error?.message ||
      "Login failed. Please check your credentials.";

    toast.add({
      title: "Login failed",
      description: message,
      color: "primary",
    });
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Login</h2>
      
      <form class="flex flex-col" @submit="onSubmit">
        <input 
          v-model="formData.email"
          type="email" 
          class="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150" 
          placeholder="Email address"
          required
        >
        
        <input 
          v-model="formData.password"
          type="password" 
          class="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150" 
          placeholder="Password"
          required
        >
        
        <div class="flex items-center justify-between flex-wrap">
          <label for="remember-me" class="text-sm text-gray-900 cursor-pointer">
            <input 
              v-model="formData.remember"
              type="checkbox" 
              id="remember-me" 
              class="mr-2"
            >
            Remember me
          </label>
          
          <a href="#" class="text-sm text-blue-500 hover:underline mb-0.5">Forgot password?</a>
          
          <p class="text-gray-900 mt-4">
            Don't have an account? 
            <a href="#" class="text-sm text-blue-500 hover:underline mt-4">Signup</a>
          </p>
        </div>
        
        <button 
          type="submit" 
          :disabled="isLoading"
          class="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-2 px-4 rounded-md mt-4 hover:bg-indigo-600 hover:to-blue-600 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </form>

      <!-- Microsoft Login Button -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <button
          @click="toast.add({ title: 'Microsoft', description: 'Login with Microsoft' })"
          class="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-200 transition ease-in-out duration-150"
        >
          <div class="i-simple-icons-microsoft w-5 h-5"></div>
          Login with Microsoft
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ 
          loginMutation.error.value?.data?.message || 
          loginMutation.error.value?.message || 
          'Login failed. Please check your credentials.' 
        }}
      </div>
    </div>
  </div>
</template>