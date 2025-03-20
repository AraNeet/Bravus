/**
 * JWT Utility Functions
 *
 * This file contains utility functions for working with JWT tokens.
 */

/**
 * Decode a JWT token and return the payload
 */
export function decodeToken(token: string): any {
  try {
    // Split the token into parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));

    // Parse the JSON payload
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

/**
 * Get user ID from JWT token
 */
export function getUserIdFromToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  // First try to get ID from localStorage
  const storedId = localStorage.getItem("ID");
  if (storedId) {
    console.log("Using stored ID from localStorage:", storedId);
    return storedId;
  }

  // If not in localStorage, try to extract from token
  const token = localStorage.getItem("auth_token");
  if (!token) {
    console.warn("No auth token found in localStorage");
    return null;
  }

  const decoded = decodeToken(token);
  console.log("Decoded token payload:", decoded);

  // Check for different possible ID field names in the payload
  // Backend might use user_id, ID, id, or userId
  const userId = decoded?.user_id || decoded?.ID || decoded?.id || decoded?.userId || null;
  console.log("Extracted user ID from token:", userId);

  // If we found the ID in the token, store it in localStorage for future use
  if (userId) {
    console.log("Storing user ID in localStorage:", userId);
    localStorage.setItem("ID", userId);
  }

  return userId;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // exp is in seconds, convert to milliseconds
  const expiryTime = decoded.exp * 1000;
  return Date.now() >= expiryTime;
}

/**
 * Debug JWT token information - helpful for troubleshooting
 */
export function debugToken(): {
  hasToken: boolean;
  hasStoredId: boolean;
  tokenInfo: any;
  storedId: string | null;
  isExpired: boolean | null;
} {
  if (typeof window === "undefined") {
    return {
      hasToken: false,
      hasStoredId: false,
      tokenInfo: null,
      storedId: null,
      isExpired: null,
    };
  }

  const token = localStorage.getItem("auth_token");
  const storedId = localStorage.getItem("ID");

  const tokenInfo = token ? decodeToken(token) : null;
  const isExpired = token ? isTokenExpired(token) : null;

  return {
    hasToken: !!token,
    hasStoredId: !!storedId,
    tokenInfo,
    storedId,
    isExpired,
  };
}

/**
 * Get user type from JWT token
 */
export const getUserTypeFromToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  // First check if user_type is stored in localStorage
  const storedType = localStorage.getItem("user_type");
  if (storedType) {
    return storedType;
  }

  const token = localStorage.getItem("auth_token");
  if (!token) {
    return null;
  }

  try {
    const decoded = decodeToken(token);
    // Check for different possible user type field names in the payload
    if (decoded?.user_type) {
      localStorage.setItem("user_type", decoded.user_type);
      return decoded.user_type;
    }
    
    if (decoded?.userType) {
      localStorage.setItem("user_type", decoded.userType);
      return decoded.userType;
    }
    
    if (decoded?.type) {
      localStorage.setItem("user_type", decoded.type);
      return decoded.type;
    }

    // If no explicit type field, try to infer from is_owner or other flags
    if (decoded?.is_owner === true || decoded?.isOwner === true) {
      localStorage.setItem("user_type", "owner");
      return "owner";
    } else if (decoded?.is_owner === false || decoded?.isOwner === false || decoded?.is_client === true || decoded?.isClient === true) {
      localStorage.setItem("user_type", "client");
      return "client";
    }

    // Check if we can infer from the endpoint that was used
    if (decoded?.aud && typeof decoded.aud === 'string') {
      if (decoded.aud.includes('owner')) {
        localStorage.setItem("user_type", "owner");
        return "owner";
      } else if (decoded.aud.includes('client')) {
        localStorage.setItem("user_type", "client");
        return "client";
      }
    }

    return null;
  } catch (e) {
    console.error("Error getting user type from token:", e);
    return null;
  }
};
