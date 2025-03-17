"use client";

/**
 * Authentication Hook
 *
 * This file provides authentication functionality to components.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  login as apiLogin,
  signupClient as apiSignupClient,
  signupOwner as apiSignupOwner,
  createAnimal as apiCreateAnimal,
  createService as apiCreateService,
  addAnimalsToClient as apiAddAnimalsToClient,
  addServicesToOwner as apiAddServicesToOwner,
  logout as apiLogout,
  getCurrentUser,
  getCurrentClient,
  getCurrentOwner,
  isAuthenticated,
  getUserType,
  type Client,
  type Owner,
  type AuthClientResponse,
  type AuthOwnerResponse,
  type LoginRequest,
  type ClientSignupRequest,
  type OwnerSignupRequest,
  type ServiceRequest,
  type AnimalRequest,
} from "../api";

interface UseAuthReturn {
  user: Client | Owner | null;
  authUser: AuthClientResponse | AuthOwnerResponse | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  signupClient: (
    userData: ClientSignupRequest,
    animals?: AnimalRequest[]
  ) => Promise<AuthClientResponse>;
  signupOwner: (
    userData: OwnerSignupRequest,
    services?: ServiceRequest[]
  ) => Promise<AuthOwnerResponse>;
  addAnimal: (clientId: string, animalData: any) => Promise<any>;
  addService: (ownerId: string, serviceData: any) => Promise<any>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  userType: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<Client | Owner | null>(null);
  const [authUser, setAuthUser] = useState<
    AuthClientResponse | AuthOwnerResponse | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userType, setUserType] = useState<string | null>(null);
  const router = useRouter();

  // Add a function to retrieve user data from localStorage as a backup
  const getUserFromLocalStorage = (
    type: string | null
  ): Client | Owner | null => {
    const userId = localStorage.getItem("ID");
    const userName = localStorage.getItem("name");
    const userEmail = localStorage.getItem("email");

    if (!userId) return null;

    console.log("Creating user from localStorage with ID:", userId);

    if (type === "owner") {
      return {
        id: userId,
        name: userName || "Owner User",
        email: userEmail || "owner@example.com",
        phone: "",
        location: "",
        services: [],
        appointments: [],
        bio: "",
      } as Owner;
    } else {
      return {
        id: userId,
        name: userName || "Client User",
        email: userEmail || "client@example.com",
        phone: "",
        location: "",
        animals: [],
        appointments: [],
      } as Client;
    }
  };

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated()) {
        try {
          setIsLoading(true);
          const type = getUserType();
          console.log("useAuth - User type from token:", type);
          setUserType(type);

          // Always set a minimal user from localStorage first as a fallback
          const localStorageUser = getUserFromLocalStorage(type);
          if (localStorageUser) {
            console.log(
              "Setting initial user data from localStorage:",
              localStorageUser
            );
            setUser(localStorageUser);
            setIsLoggedIn(true);
          }

          let userData;
          try {
            if (type === "owner") {
              console.log("useAuth - Attempting to load owner data");
              userData = await getCurrentOwner();
              // Force log the complete response to see what's coming back
              console.log("OWNER API RESPONSE (raw):", userData);

              // Make sure we store key user data in localStorage for fallback
              if (userData && userData.id) {
                localStorage.setItem("ID", userData.id);
                if (userData.name) localStorage.setItem("name", userData.name);
                if (userData.email)
                  localStorage.setItem("email", userData.email);
              }
            } else {
              console.log("useAuth - Attempting to load client data");
              userData = await getCurrentClient();
              // Force log the complete response to see what's coming back
              console.log("CLIENT API RESPONSE (raw):", userData);

              // Make sure we store key user data in localStorage for fallback
              if (userData && userData.id) {
                localStorage.setItem("ID", userData.id);
                if (userData.name) localStorage.setItem("name", userData.name);
                if (userData.email)
                  localStorage.setItem("email", userData.email);
              }
            }

            if (!userData || typeof userData !== "object") {
              console.error("useAuth - userData not valid:", userData);
              // Fall back to localStorage, which we've already done above
              return;
            }

            // Check if the API response has a name property - add one if missing
            if (!userData.name && userData.id) {
              console.log(
                "API response missing name property - adding from localStorage"
              );
              userData.name = localStorage.getItem("name") || "User";
            }

            // Ensure we're setting valid user data
            console.log("useAuth - Setting user data from API:", userData);
            setUser(userData);
            setIsLoggedIn(true);
          } catch (userError: any) {
            console.error("useAuth - Error loading user data:", userError);
            // We already set the localStorage user above, so we're good
          }
        } catch (err: any) {
          console.error("Failed to load user:", err);
          // If token is invalid, clear it
          if (err.status === 401) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("ID");
            localStorage.removeItem("user_type");
            localStorage.removeItem("email");
            localStorage.removeItem("name");
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

        // Get user type
        const type = getUserType();
        setUserType(type);

        // Try to fetch the full user profile
        try {
          let userProfile;
          if (type === "owner") {
            userProfile = await getCurrentOwner();
          } else {
            userProfile = await getCurrentClient();
          }

          setUser(userProfile);
        } catch (profileErr) {
          console.error(
            "Could not fetch user profile after login:",
            profileErr
          );
          // Continue anyway since we have basic user info from auth response
        }

        // Redirect based on user type
        if (type === "owner") {
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

  const signupClient = useCallback(
    async (
      userData: ClientSignupRequest,
      animals?: AnimalRequest[]
    ): Promise<AuthClientResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        // Register client
        const response = await apiSignupClient(userData);
        setAuthUser(response);
        setIsLoggedIn(true);
        setUserType("client");

        // Add animals if provided
        if (animals && animals.length > 0 && response.id) {
          try {
            // Directly create animals during signup
            await apiAddAnimalsToClient(response.id, animals);
          } catch (animalError) {
            console.error("Error adding animals during signup:", animalError);
            // Continue anyway since the client was created successfully
          }
        }

        // Try to load the client profile
        try {
          const clientProfile = await getCurrentClient();
          setUser(clientProfile);
        } catch (profileErr) {
          console.error(
            "Could not fetch client profile after signup:",
            profileErr
          );
          // Continue anyway since we have basic user info from auth response
        }

        return response;
      } catch (err: any) {
        console.error("Client signup error:", err);
        setError(err.message || "Failed to sign up");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signupOwner = useCallback(
    async (
      userData: OwnerSignupRequest,
      services?: ServiceRequest[]
    ): Promise<AuthOwnerResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        // Register owner
        const response = await apiSignupOwner(userData);
        setAuthUser(response);
        setIsLoggedIn(true);
        setUserType("owner");

        // Add services if provided
        if (services && services.length > 0 && response.id) {
          try {
            // Directly create services during signup
            await apiAddServicesToOwner(response.id, services);
          } catch (serviceError) {
            console.error("Error adding services during signup:", serviceError);
            // Continue anyway since the owner was created successfully
          }
        }

        // Try to load the owner profile
        try {
          const ownerProfile = await getCurrentOwner();
          setUser(ownerProfile);
        } catch (profileErr) {
          console.error(
            "Could not fetch owner profile after signup:",
            profileErr
          );
          // Continue anyway since we have basic user info from auth response
        }

        return response;
      } catch (err: any) {
        console.error("Owner signup error:", err);
        setError(err.message || "Failed to sign up");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const addAnimal = useCallback(async (clientId: string, animalData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCreateAnimal(clientId, animalData);
      // Refresh user data to include the new animal
      const updatedUser = await getCurrentClient();
      setUser(updatedUser);
      return response;
    } catch (err: any) {
      console.error("Error adding animal:", err);
      setError(err.message || "Failed to add animal");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addService = useCallback(async (ownerId: string, serviceData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCreateService(ownerId, serviceData);
      // Refresh user data to include the new service
      const updatedUser = await getCurrentOwner();
      setUser(updatedUser);
      return response;
    } catch (err: any) {
      console.error("Error adding service:", err);
      setError(err.message || "Failed to add service");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await apiLogout();
      setUser(null);
      setAuthUser(null);
      setIsLoggedIn(false);
      setUserType(null);
      router.push("/login"); // Redirect to login after logout
    } catch (err: any) {
      console.error("Logout error:", err);
      // Still clear user data even if API call fails
      setUser(null);
      setAuthUser(null);
      setIsLoggedIn(false);
      setUserType(null);
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
    signupClient,
    signupOwner,
    addAnimal,
    addService,
    logout,
    isLoggedIn,
    userType,
  };
};
