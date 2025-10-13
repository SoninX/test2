export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const toast = useToast();

  // Common request interceptor
  const onRequest = ({ options }: any) => {
    const accessToken = useCookie("access_token");
    
    if (accessToken.value) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken.value}`,
      };
    }
  };

  // Common response error handler
  const onResponseError = async ({ response }: any) => {
    if (response) {
      const error = response._data || { message: 'Unknown error occurred' };
      
      switch (response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          const accessToken = useCookie("access_token");
          const refreshToken = useCookie("refresh_token");
          
          accessToken.value = null;
          refreshToken.value = null;
          localStorage.removeItem("login_response");
          
          // Only redirect if not already on login page
          if (process.client && !window.location.pathname.includes('/auth/login')) {
            window.location.href = "/auth/login";
          }
          
          console.log("Unauthorized access attempt", error?.message);
          toast.add({
            title: "Session Expired",
            description: "Please login again",
            color: "error",
          });
          break;

        case 403:
          // Forbidden
          console.log("Access forbidden", error.message);
          toast.add({
            title: "Error",
            description: `Access forbidden: ${error.message}`,
            color: "error",
          });
          break;

        case 404:
          // Not found
          console.log("Resource not found", error.message);
          toast.add({
            title: "Error",
            icon: "i-lucide-circle-alert",
            description: `Resource not found: ${error.message}`,
            color: "error",
          });
          break;

        case 422:
          // Validation errors
          console.log("Validation errors", error.message);
          toast.add({
            title: "Validation Error",
            description: `Validation failed: ${error.message}`,
            color: "error",
          });
          break;

        case 500:
          // Server error
          console.log("Server error occurred", error.message);
          toast.add({
            title: "Server Error",
            icon: "i-lucide-server-crash",
            description: `Server error occurred: ${error.message}`,
            color: "error",
          });
          break;

        default:
          console.log("An error occurred", error.message);
          toast.add({
            title: "Error",
            description: `An error occurred: ${error.message}`,
            color: "error",
          });
      }
    } else {
      // Network error or no response
      console.log("Network error occurred");
      toast.add({
        title: "Network Error",
        icon: "i-lucide-wifi-off",
        description: "Network error occurred. Please check your connection.",
        color: "error",
      });
    }
  };

  // API v1 instance - for external API (like JSONPlaceholder)
  const apiv1 = $fetch.create({
    baseURL: config.public.apiUrl as string,
    onRequest,
    onResponseError,
  });

  // API v2 instance - for auth API (different base URL)
  const apiv2 = $fetch.create({
    baseURL: "https://api.escuelajs.co/api/v1", // Auth API base URL
    onRequest,
    onResponseError,
  });

  return {
    provide: {
      apiv1, // For main API calls
      apiv2, // For auth API calls
    },
  };
});