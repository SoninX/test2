<script setup lang="ts">
import * as z from "zod";
import { useAuthStore } from "~/stores/auth";

useSeoMeta({
  title: "Login",
  description: "Login to your account to continue",
});

const toast = useToast();
const router = useRouter();

const colorMode = useColorMode();
colorMode.preference = "light";
colorMode.value = "light";

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
const { mutateAsync: login, isLoading, error } = authStore.loginMutation();

// Get the new SSO login mutation
const { mutateAsync: ssoLogin, isLoading: isSsoLoading } =
  authStore.ssoLoginMutation();

// SSO login handler
async function handleSsoLogin() {
  try {
    await ssoLogin();

    toast.add({
      title: "Login successful!",
      color: "primary",
    });

    await router.push("/");
  } catch (err: any) {
    console.error("SSO Login error:", err);
    toast.add({
      title: "SSO Login failed",
      description: err.message || "An unknown error occurred.",
      color: "error",
    });
  }
}

const errorMessage = computed(() => {
  const e = error as any;
  return (
    e?.data?.message ||
    e?.message ||
    "Login failed. Please check your credentials."
  );
});

// form data
const formData = reactive({
  email: "",
  password: "",
  remember: false,
});

const show = ref(false);

// Submit
async function onSubmit() {
  try {
    // schema.parse(formData);

    await login({
      email: formData.email,
      password: formData.password,
    });

    toast.add({
      title: "Login successful!",
      color: "primary",
    });

    await router.push("/");
  } catch (err: any) {
    toast.add({
      title: "Login failed",
      description: errorMessage.value,
      // description:
      //   err?.data?.message ||
      //   err?.message ||
      //   "Login failed. Please check your credentials.",
      color: "error",
    });
  }
}
</script>

<template>
  <div class="w-screen h-screen relative">
    <!-- Background image layer -->
    <div
      class="absolute inset-0 bg-[url('~/assets/images/background.png')] bg-cover bg-center"
      aria-hidden="true"
    ></div>
    <!-- Main content -->
    <div class="relative z-10 flex w-full h-full">
      <!-- Left side -->
      <div class="flex flex-col mt-28 w-1/2 text-neutral-500 px-8">
        <div class="max-w-2xl">
          <h1 class="font-semibold text-4xl font-Inter leading-tight mb-6">
            "Accounts receivable:<br />
            the heartbeat of your revenue cycle."
          </h1>
          <p class="text-base xl:text-lg  leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
          </p>
        </div>
      </div>

      <!-- Right side (form) -->
      <div class="flex  mt-28 w-1/2">
        <UCard class=" rounded-3xl  h-[588px] p-13 ml-26">
          <div class="flex flex-col items-left">
            <img
              src="~/assets/images/ZEBO.png"
              alt="ZEBO Logo"
              class="w-[148px] h-[46px] mb-4"
            />
            <p class=" mb-8 text-left">
              Welcome back! Please fill the details to login
            </p>
          </div>

          <UForm :schema="schema" :state="formData" @submit="onSubmit" class="space-y-6">
            <!-- Email -->
            <div>
              <!-- <label for="email" class="block text-sm font-medium text-gray-700 mb-1"
                >Email</label
              > -->
              <UFormField label="Email" required>
                <UInput
                v-model="formData.email"
                id="email"
                type="email"
                placeholder="email id"
                color="primary"
                variant="ghost"
                class="w-full"
                icon="i-lucide-at-sign"
                required
              />
              </UFormField>
            </div>

            <!-- Password -->
            <div>
              <!-- <label for="password" class="block text-sm font-medium text-gray-700 mb-1"
                >Password</label
              > -->
              <UFormField label="Password" required>
                <UInput
                  v-model="formData.password"
                  id="password"
                  placeholder="Password"
                  :type="show ? 'text' : 'password'"
                  :ui="{ trailing: 'pe-1' }"
                  color="primary"
                  variant="ghost"
                  class="w-full"
                  required
                >
                  <template #trailing>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="sm"
                      :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                      :aria-label="show ? 'Hide password' : 'Show password'"
                      :aria-pressed="show"
                      aria-controls="password"
                      @click="show = !show"
                    />
                  </template>
                </UInput>
              </UFormField>
            </div>

            <!-- Forgot Password -->
            <div class="flex items-center justify-end">
              <a href="#" class="text-sm text-gray-600 hover:text-primary"
                >Forgot Password?</a
              >
            </div>

            <!-- Submit -->
            <UButton
              type="submit"
              :loading="isLoading"
              block
              color="primary"
              size="lg"
            >
              Login
            </UButton>

            <!-- OR divider -->
            <div class="flex items-center">
              <div class="flex-grow border-t border-gray-300"></div>
              <span class="mx-4 text-sm text-gray-400">Or</span>
              <div class="flex-grow border-t border-gray-300"></div>
            </div>

            <!-- SSO -->
            <UButton
              type="button"
              @click="handleSsoLogin"
              :disabled="isSsoLoading"
              block
              variant="outline"
              color="primary"
              size="lg"
            >
              Signin with SSO
            </UButton>

            <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {{ errorMessage }}
            </div>
          </UForm>
        </UCard>
      </div>
    </div>
  </div>
</template>

<style>
/* Hide the password reveal button in Edge */
::-ms-reveal {
  display: none;
}
</style>
