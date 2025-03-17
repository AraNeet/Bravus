/**
 * API Module
 *
 * This file exports all API functions for easy importing.
 */

// Export all auth functions
import {
  createAnimal as authCreateAnimal,
  createAnimalNoAuth as authCreateAnimalNoAuth,
  createService as authCreateService,
  createServiceNoAuth as authCreateServiceNoAuth,
  // Export all other auth functions
  login,
  signupClient,
  signupOwner,
  addAnimalsToClient,
  addServicesToOwner,
  getCurrentClient,
  getCurrentOwner,
  getCurrentUser,
  logout,
  isAuthenticated,
  getUserType,
} from "./auth";

// Re-export auth functions with renamed conflicting functions
export {
  login,
  signupClient,
  signupOwner,
  addAnimalsToClient,
  addServicesToOwner,
  getCurrentClient,
  getCurrentOwner,
  getCurrentUser,
  logout,
  isAuthenticated,
  getUserType,
  // Renamed functions to avoid conflicts
  authCreateAnimal,
  authCreateAnimalNoAuth,
  authCreateService,
  authCreateServiceNoAuth,
};

// Export all user functions
export * from "./users";

// Export all service functions
export * from "./services";

// Export all appointment functions
export * from "./appointments";

// Export all animal functions
export * from "./animals";

// Export all review functions
export * from "./reviews";

// Export all rating functions
export * from "./ratings";

// Export all Google API functions
export * from "./google";

// Export HTTP utilities
export { ApiError } from "./http";

// Export config
export { API_BASE_URL, HTTP_STATUS } from "./config";

// Export all types
export * from "./types";
