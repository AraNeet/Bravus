/**
 * Authentication API
 *
 * This file contains functions for authentication-related API requests.
 */

import { post, get } from "./http";
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

  if (response.id) {
    localStorage.setItem("id", response.id);
  }
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

  if (response.id) {
    localStorage.setItem("id", response.id);
  }
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
  }
};

/**
 * Get the current user's profile
 */
export const getCurrentUser = async (): Promise<User> => {
  let id = localStorage.getItem("id");
  return await get<User>(`/user/get-user?id=${id}`);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("auth_token");
};

// Re-export types
export type { LoginRequest, SignupRequest, AuthResponse, User };
