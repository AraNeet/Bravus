"use client";

/**
 * Authentication Hook
 *
 * This hook provides authentication functionality to components.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
  getCurrentUser,
  isAuthenticated,
  type User,
  type AuthResponse,
  type LoginRequest,
  type SignupRequest,
} from "../api";
import { get } from "http";

interface UseAuthReturn {
  user: User | null;
  authUser: AuthResponse | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter();

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated()) {
        try {
          let id = localStorage.getItem("ID");
          setIsLoading(true);
          const userData = await getCurrentUser(id);
          setUser(userData);
          setIsLoggedIn(true);
        } catch (err: any) {
          console.error("Failed to load user:", err);
          // If token is invalid, clear it
          if (err.status === 401) {
            localStorage.removeItem("auth_token");
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Attempting login with:", credentials);
        const response = await apiLogin(credentials);
        console.log("Login response:", response);

        // Store the auth response (which includes the token and basic user info)
        setAuthUser(response);

        // Set logged in state
        setIsLoggedIn(true);

        // Try to fetch the full user profile
        try {
          let id = localStorage.getItem("ID");
          const userProfile = await getCurrentUser(id);
          setUser(userProfile);
        } catch (profileErr) {
          console.error(
            "Could not fetch user profile after login:",
            profileErr
          );
          // Continue anyway since we have basic user info from auth response
        }

        // Redirect based on user role
        if (response.owner) {
          router.push("/dashboard/owner");
        } else {
          router.push("/dashboard/client");
        }
      } catch (err: any) {
        console.error("Login error details:", err);
        setError(err.message || "Failed to login");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const signup = useCallback(
    async (userData: SignupRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Attempting signup with:", userData);
        const response = await apiSignup(userData);
        console.log("Signup response:", response);

        // Store the auth response
        setAuthUser(response);

        // Set logged in state
        setIsLoggedIn(true);

        // Redirect based on user role
        if (response.owner) {
          router.push("/dashboard/owner");
        } else {
          router.push("/dashboard/client");
        }
      } catch (err: any) {
        console.error("Signup error details:", err);
        setError(err.message || "Failed to signup");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await apiLogout();
      setUser(null);
      setAuthUser(null);
      setIsLoggedIn(false);
      router.push("/login"); // Redirect to login after logout
    } catch (err: any) {
      console.error("Logout error:", err);
      // Still clear user data even if API call fails
      setUser(null);
      setAuthUser(null);
      setIsLoggedIn(false);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    user,
    authUser,
    isLoading,
    error,
    login,
    signup,
    logout,
    isLoggedIn,
  };
};
