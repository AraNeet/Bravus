/**
 * Authentication API
 *
 * This file contains functions for authentication-related API requests.
 */

import { post, get } from "./http";
import type { LoginRequest, SignupRequest, AuthResponse, User } from "./types";
import {
  getUserIdFromToken,
  isTokenExpired,
  decodeToken,
} from "@/app/utils/jwt-utils";

/**
 * Login user with email and password
 */
export const login = async (
  credentials: LoginRequest
): Promise<AuthResponse> => {
  // Convert frontend field names to backend field names if needed
  const backendCredentials = {
    Email: credentials.email,
    Password: credentials.password,
  };

  const response = await post<AuthResponse>("/user/login", backendCredentials, {
    includeAuth: false,
  });

  // Store token in localStorage
  if (response.token) {
    localStorage.setItem("auth_token", response.token);

    // Extract and store user ID from token
    const decoded = decodeToken(response.token);
    if (decoded?.user_id) {
      localStorage.setItem("ID", decoded.user_id);
    } else {
      // Fallback to the ID from the response if available
      if (response.id) {
        localStorage.setItem("ID", response.id);
      }
    }
  }

  return response;
};

/**
 * Register a new user
 */
export const signup = async (
  userData: SignupRequest
): Promise<AuthResponse> => {
  // Convert frontend field names to backend field names
  const backendUserData = {
    FirstName: userData.firstname,
    LastName: userData.lastname,
    Phone: userData.phone,
    Email: userData.email,
    Password: userData.password,
    Owner: userData.owner,
    Career: userData.career || "No Career",
  };

  const response = await post<AuthResponse>("/user/register", backendUserData, {
    includeAuth: false,
  });

  // Store token in localStorage for auto-login after signup
  if (response.token) {
    localStorage.setItem("auth_token", response.token);

    // Extract and store user ID from token
    const decoded = decodeToken(response.token);
    if (decoded?.user_id) {
      localStorage.setItem("ID", decoded.user_id);
    } else {
      // Fallback to the ID from the response if available
      if (response.id) {
        localStorage.setItem("ID", response.id);
      }
    }
  }

  return response;
};

/**
 * Get the current user's profile
 */
export const getCurrentUser = async (): Promise<User> => {
  // First try to get user ID from localStorage
  let userId = localStorage.getItem("ID");

  // If not found in localStorage, try to extract it from the token
  if (!userId) {
    userId = getUserIdFromToken();

    // If we got the ID from the token, save it to localStorage for future use
    if (userId) {
      localStorage.setItem("ID", userId);
    }
  }

  if (!userId) {
    throw new Error("No authentication token found or invalid token");
  }

  // Get user profile with all related data
  return await get<User>(`/user/get-user-info?id=${userId}`);
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  // For client-side logout, we just need to remove the token
  localStorage.removeItem("auth_token");
  localStorage.removeItem("ID");
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const token = localStorage.getItem("auth_token");
  if (!token) {
    return false;
  }

  // Check if token is expired
  return !isTokenExpired(token);
};

// Re-export types
export type { LoginRequest, SignupRequest, AuthResponse, User };
