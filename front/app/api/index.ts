/**
 * API Module
 *
 * This file exports all API functions for easy importing.
 */

// Export all auth functions
export * from "./auth";

// Export all user functions
export * from "./users";

// Export all service functions
export * from "./services";

// Export all appointment functions
export * from "./appointments";

// Export all animal functions
export * from "./animals";

// Export HTTP utilities
export { ApiError } from "./http";

// Export config
export { API_BASE_URL, HTTP_STATUS } from "./config";

// Export all types
export * from "./types";
