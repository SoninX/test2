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
      authApiUrl: "https.api.escuelajs.co/api/v1", // For authentication
      azureClientId: "711a16f4-eded-40a3-addf-0eabb508d974",
      azureTenantId: "86fb359e-1360-4ab3-b90d-2a68e8c007b9",
      azureRedirectUri: "http://localhost:3000"
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