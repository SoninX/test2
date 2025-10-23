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

  // 1. Initialize the instance (Required for MSAL v3+)
  // This prepares the instance for use.
  await msalInstance.initialize()

  // 2. Handle the redirect promise (This was the missing piece)
  // This must be called on *every* page load.
  // When the popup redirects here, this method will
  // process the response, send it to the parent window, and close the popup.
  await msalInstance.handleRedirectPromise().catch((error) => {
    // This is optional, but good for debugging "user cancelled" flows
    console.warn('MSAL Redirect Error/Cancel:', error)
  })

  return {
    provide: {
      msalInstance,
    },
  }
})