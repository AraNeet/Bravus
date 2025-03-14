/**
 * HTTP Client
 *
 * This file contains utility functions for making HTTP requests.
 */

import { API_BASE_URL, DEFAULT_TIMEOUT, getDefaultHeaders } from "./config";

// Error class for API errors
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Interface for request options
interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  includeAuth?: boolean;
}

/**
 * Make an HTTP request to the API
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions
): Promise<T> => {
  const {
    method,
    body,
    timeout = DEFAULT_TIMEOUT,
    includeAuth = true,
  } = options;
  const headers = { ...getDefaultHeaders(includeAuth), ...options.headers };
  const url = `${API_BASE_URL}${endpoint}`;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    // Clear timeout
    clearTimeout(timeoutId);

    // Parse response data
    const data = await response.json().catch(() => ({}));

    // Handle error responses
    if (!response.ok) {
      throw new ApiError(
        data.error || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error: any) {
    // Handle timeout
    if (error.name === "AbortError") {
      throw new ApiError("Request timeout", 0);
    }

    // Re-throw ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle other errors
    throw new ApiError(error.message || "Unknown error", 0);
  }
};

// Convenience methods for different HTTP methods
export const get = <T>(
  endpoint: string,
  options?: Omit<RequestOptions, "method" | "body">
) => apiRequest<T>(endpoint, { method: "GET", ...options });

export const post = <T>(
  endpoint: string,
  body: any,
  options?: Omit<RequestOptions, "method">
) => apiRequest<T>(endpoint, { method: "POST", body, ...options });

export const put = <T>(
  endpoint: string,
  body: any,
  options?: Omit<RequestOptions, "method">
) => apiRequest<T>(endpoint, { method: "PUT", body, ...options });

export const del = <T>(
  endpoint: string,
  options?: Omit<RequestOptions, "method">
) => apiRequest<T>(endpoint, { method: "DELETE", ...options });

export const patch = <T>(
  endpoint: string,
  body: any,
  options?: Omit<RequestOptions, "method">
) => apiRequest<T>(endpoint, { method: "PATCH", body, ...options });
