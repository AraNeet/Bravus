/**
 * Google Auth API
 *
 * This file contains functions for Google OAuth authentication.
 */

import { get, post } from "../http";

// Types
export interface GoogleAuthStatus {
  authenticated: boolean;
  email?: string;
  name?: string;
  picture?: string;
}

export interface GoogleAuthResponse {
  redirectUrl: string;
}

/**
 * Initiate Google OAuth flow
 *
 * This will get the redirect URL and then redirect the user to Google's OAuth consent screen.
 */
export const initiateGoogleAuth = async (): Promise<GoogleAuthResponse> => {
  const response = await get<GoogleAuthResponse>("/api/google/auth/login");
  return response;
};

/**
 * Check Google Auth status
 *
 * Returns the current authentication status with Google
 */
export const checkGoogleAuthStatus = async (): Promise<GoogleAuthStatus> => {
  return await get<GoogleAuthStatus>(`/api/google/auth/status`);
};

/**
 * Revoke Google access
 *
 * Disconnects the user's Google account from the application
 */
export const revokeGoogleAccess = async (): Promise<void> => {
  await post(`/api/google/auth/revoke`, { confirm: true });
};
