/**
 * API Configuration
 *
 * This file contains the base configuration for API requests.
 * Update the BASE_URL to match your Go backend server.
 */

// Base URL for API requests
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Commented version for debugging
// export const API_BASE_URL = "http://localhost:8000";

// Default request timeout in milliseconds
export const DEFAULT_TIMEOUT = 30000;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Default headers for API requests
export const getDefaultHeaders = (includeAuth = true) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Add authorization header if token exists and includeAuth is true
  if (includeAuth && typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      // Ensure we consistently use 'Bearer ' prefix with a space
      headers["Authorization"] = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
        
      // Log the token being used for debugging purposes
      console.log("Adding auth token to request. Token starts with:", 
        token.substring(0, 15) + "...");
    } else {
      console.warn("No auth token found in localStorage for authenticated request");
    }
  }

  return headers;
};
