import { PublicClientApplication, LogLevel } from '@azure/msal-browser'
import type { Configuration } from '@azure/msal-browser'

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()

  const msalConfig: Configuration = {
    auth: {
      clientId: config.public.azureClientId as string,
      authority: `https://login.microsoftonline.com/${config.public.azureTenantId as string}`,
      redirectUri: config.public.azureRedirectUri as string,
    },
    cache: {
      cacheLocation: 'sessionStorage',
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
          if (containsPii) {
            return
          }
          switch (level) {
            case LogLevel.Error:
              console.error(message)
              return
            case LogLevel.Info:
              console.info(message)
              return
            case LogLevel.Verbose:
              console.debug(message)
              return
            case LogLevel.Warning:
              console.warn(message)
              return
          }
        },
      },
    },
  }

  const msalInstance = new PublicClientApplication(msalConfig)

  try {
    // This method handles the redirect by itself.
    // When the popup loads, this await will process the token
    // and communicate back to the parent window.
    await msalInstance.initialize()
  } catch (error) {
    console.error('MSAL Initialization Error:', error)
  }

  // --- REMOVED THIS BLOCK ---
  // msalInstance.handleRedirectPromise().catch((error) => {
  //   console.error('MSAL Redirect Error:', error)
  // })
  // --- END OF REMOVAL ---

  return {
    provide: {
      msalInstance,
    },
  }
})