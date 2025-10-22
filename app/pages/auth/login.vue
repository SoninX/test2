<script setup lang="ts">
import * as z from "zod";
import { useAuthStore } from "~/stores/auth";

definePageMeta({
  layout: "auth",
});

useSeoMeta({
  title: "Login",
  description: "Login to your account to continue",
});

const colorMode = useColorMode();
colorMode.preference = "dark";
colorMode.value = "dark";

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
const { mutateAsync: login, isLoading: isLoading, error } =
  authStore.loginMutation();

const errorMessage = computed(() => {
  const e = error as any;
  return (
    e?.data?.message ||
    e?.message ||
    "Login failed. Please check your credentials."
  );
});

// Reactive form data
const formData = reactive({
  email: "",
  password: "",
  remember: false,
});

// Track validity & visibility
const isEmailValid = ref(false);
const showPassword = ref(false);

// Validate email on every input
watch(
  () => formData.email,
  (newEmail) => {
    try {
      schema.pick({ email: true }).parse({ email: newEmail });
      isEmailValid.value = true;
    } catch {
      isEmailValid.value = false;
    }
  }
);

// Form submission
async function onSubmit(event?: Event) {
  if (event) event.preventDefault();

  try {
    // validate before login
    schema.parse({
      email: formData.email,
      password: formData.password,
    });

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
    console.error("Login error:", err);

    const message =
      err?.data?.message ||
      err?.message ||
      "Login failed. Please check your credentials.";

    // toast.add({
    //   title: "Login failed",
    //   description: message,
    //   color: "error",
    // });
  }
}
</script>

<template>
  <div class="w-screen h-screen relative">
    <!-- background image layer -->
    <div
      class="absolute inset-0 bg-orange-400/40 bg-[url('~/assets/images/background.png')] bg-cover bg-center opacity-50 mix-blend-multiply"
    ></div>

    <!-- content layer -->
    <div class="relative z-10 flex w-full h-full">
      <!-- left side -->
      <div class="flex flex-col items-center justify-center w-1/2 align-top">
        <div class="relative z-10 max-w-2xl">
          <h1 class="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            "Accounts receivable:<br />
            the heartbeat of your revenue cycle."
          </h1>
          <p class="text-base xl:text-lg text-white/90 leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.
          </p>
        </div>
      </div>

      <!-- right side -->
      <div class="flex items-center justify-center w-1/2">
        <div class="bg-white rounded-3xl shadow-md p-6 w-[550px] h-[600px]">
          <div class="block align-center justify-center w-[500px] pr-[53px] pl-[53px] pt-[20px]">
            <img
              src="~/assets/images/ZEBO.png"
              alt="ZEBO Logo"
              class="w-[148px] h-[46px] mb-4"
            />
            <p class="text-gray-600 mb-8">
              Welcome back! Please fill the details to login
            </p>

            <form class="space-y-6" @submit.prevent="onSubmit">
              <!-- email area -->
              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700"
                  >Email ID</label
                >
                <div class="mt-1 relative">
                  <input
                    id="email"
                    v-model="formData.email"
                    type="email"
                    class="w-full bg-[#F9FAFB] text-gray-900 border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#C2496F] transition"
                    placeholder="email id"
                    required
                  />
                  <!-- email validation while typing -->
                  <div
                    v-if="isEmailValid"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                  >
                    <svg
                      class="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 
                        7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 
                        001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <!-- password area handling -->
              <div>
                <label
                  for="password"
                  class="block text-sm font-medium text-gray-700"
                  >Password</label
                >
                <div class="mt-1 relative">
                  <input
                    id="password"
                    v-model="formData.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="w-full bg-[#F9FAFB] text-gray-900 border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#C2496F] transition"
                    placeholder="password"
                    required
                  />
                  <!-- visibility button -->
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    @click="showPassword = !showPassword"
                  >
                    <svg
                      v-if="!showPassword"
                      class="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M10 12a2 2 0 100-4 2 2 0 000 4z"
                      />
                      <path
                        fill-rule="evenodd"
                        d="M.458 10C1.732 5.943 
                        5.522 3 10 3s8.268 2.943 9.542 
                        7c-1.274 4.057-5.022 7-9.542 
                        7S1.732 14.057.458 10zM14 
                        10a4 4 0 11-8 0 4 4 0 
                        018 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <svg
                      v-else
                      class="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M12 5c-7 0-11 7-11 7s4 
                        7 11 7 11-7 11-7-4-7-11-7zm0 
                        12a5 5 0 110-10 5 5 0 
                        010 10z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-end">
                <a
                  href="#"
                  class="text-sm text-gray-600 hover:text-[#C2496F]"
                  >Forgot Password?</a
                >
              </div>

              <button
                type="submit"
                :disabled="isLoading"
                class="w-full bg-primary text-white font-semibold py-3 px-4 rounded-md border hover:bg-white hover:text-primary hover:border-primary transition disabled:opacity-50"
              >
                <span v-if="isLoading">Logging in...</span>
                <span v-else>Login</span>
              </button>

              <div class="flex items-center">
                <div class="flex-grow border-t border-gray-300"></div>
                <span class="mx-4 text-sm text-gray-400">Or</span>
                <div class="flex-grow border-t border-gray-300"></div>
              </div>

              <button
                type="button"
                class="w-full bg-white text-primary font-semibold py-3 px-4 rounded-md border border-primary hover:bg-primary hover:text-white transition"
              >
                Signin with SSO
              </button>

              <!-- <div
                v-if="error"
                class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
              >
                {{ errorMessage }}
              </div> -->
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
