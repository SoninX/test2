// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  ssr: false,
  
  plugins: ["~/plugins/api", "~/plugins/msal.client"],

  devtools: { enabled: false },

  css: ["~/assets/css/main.css"],

  modules: ["@nuxt/ui","@pinia/nuxt", "@pinia/colada-nuxt"],
  runtimeConfig: {
    public: {
      apiUrl: "", // For main data
      authApiUrl: import.meta.env.NUXT_PUBLIC_API_URL, // For authentication
      azureClientId: import.meta.env.NUXT_PUBLIC_AZURE_CLIENT_ID,
      azureTenantId: import.meta.env.NUXT_PUBLIC_AZURE_TENANT_ID,
      azureRedirectUri: import.meta.env.NUXT_PUBLIC_AZURE_REDIRECT_URI
    },
  },
  vite: {
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
      }
    }
  }
});
