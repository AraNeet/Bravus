/**
 * Authentication API
 *
 * This file contains functions for authentication-related API requests.
 */

import { post } from "./http";
import type { LoginRequest, SignupRequest, AuthResponse, User } from "./types";

/**
 * Login user with email and password
 */
export const login = async (
  credentials: LoginRequest
): Promise<AuthResponse> => {
  const response = await post<AuthResponse>("/user/login", credentials, {
    includeAuth: false,
  });

  // Store token in localStorage
  if (response.token) {
    localStorage.setItem("auth_token", response.token);
  }

  return response;
};

/**
 * Register a new user
 * With auto-login after signup
 */
export const signup = async (
  userData: SignupRequest
): Promise<AuthResponse> => {
  const response = await post<AuthResponse>("/user/register", userData, {
    includeAuth: false,
  });

  // Store token in localStorage for auto-login after signup
  if (response.token) {
    localStorage.setItem("auth_token", response.token);
  }

  return response;
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint if your API has one
    await post("/user/logout", {});
  } catch (error) {
    // Ignore errors on logout
    console.error("Logout error:", error);
  } finally {
    // Always clear local storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_token");
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("auth_token");
};

// Re-export types
export type { LoginRequest, SignupRequest, AuthResponse, User };
