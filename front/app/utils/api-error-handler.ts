import { toast } from "sonner";

/**
 * Handles API errors in a consistent way across the application
 * @param error The error object from the API call
 * @param fallbackMessage A fallback message to display if the error doesn't have a message
 */
export const handleApiError = (error: unknown, fallbackMessage: string = "An error occurred") => {
  console.error("API Error:", error);
  
  if (error instanceof Error) {
    toast.error(error.message);
  } else if (typeof error === "object" && error !== null && "message" in error) {
    toast.error((error as { message: string }).message);
  } else {
    toast.error(fallbackMessage);
  }
};
