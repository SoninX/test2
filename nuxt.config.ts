// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  ssr: false,
  
  plugins: ["~/plugins/api"],

  devtools: { enabled: false },

  css: ["~/assets/css/main.css"],

  modules: ["@nuxt/ui","@pinia/nuxt", "@pinia/colada-nuxt"],
  runtimeConfig: {
    public: {
      apiUrl: "", // For main data
      authApiUrl: "https://api.escuelajs.co/api/v1", // For authentication
    },
  },
});
