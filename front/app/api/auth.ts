/**
 * Authentication API
 *
 * This file contains functions for authentication-related API requests.
 */

import { post, get } from "./http";
import type {
  LoginRequest,
  ClientSignupRequest,
  OwnerSignupRequest,
  AuthClientResponse,
  AuthOwnerResponse,
  Client,
  Owner,
  ServiceRequest,
  AnimalRequest,
} from "./types";
import {
  getUserIdFromToken,
  isTokenExpired,
  decodeToken,
  getUserTypeFromToken,
} from "@/app/utils/jwt-utils";

/**
 * Login user with email and password
 */
export const login = async (
  credentials: LoginRequest
): Promise<AuthClientResponse | AuthOwnerResponse> => {
  // Convert frontend field names to backend field names
  const backendCredentials = {
    Email: credentials.email,
    Password: credentials.password,
  };

  // Try both client and owner login endpoints
  try {
    // First try client login
    const clientResponse = await post<AuthClientResponse>(
      "/client/login",
      backendCredentials,
      {
        includeAuth: false,
      }
    );

    // Store token and user info
    if (clientResponse.token) {
      localStorage.setItem("auth_token", clientResponse.token);
      localStorage.setItem("user_type", "client");

      // Store name and email for fallback purposes
      if (clientResponse.name) {
        localStorage.setItem("name", clientResponse.name);
      }
      if (clientResponse.email) {
        localStorage.setItem("email", clientResponse.email);
      }

      // Extract and store user ID from token
      const decoded = decodeToken(clientResponse.token);
      if (decoded?.user_id) {
        localStorage.setItem("ID", decoded.user_id);
      } else if (clientResponse.id) {
        localStorage.setItem("ID", clientResponse.id);
      }
    }

    return clientResponse;
  } catch (clientError) {
    // If client login fails, try owner login
    try {
      const ownerResponse = await post<AuthOwnerResponse>(
        "/owner/login",
        backendCredentials,
        {
          includeAuth: false,
        }
      );

      // Store token and user info
      if (ownerResponse.token) {
        localStorage.setItem("auth_token", ownerResponse.token);
        localStorage.setItem("user_type", "owner");

        // Store name and email for fallback purposes
        if (ownerResponse.name) {
          localStorage.setItem("name", ownerResponse.name);
        }
        if (ownerResponse.email) {
          localStorage.setItem("email", ownerResponse.email);
        }

        // Extract and store user ID from token
        const decoded = decodeToken(ownerResponse.token);
        if (decoded?.user_id) {
          localStorage.setItem("ID", decoded.user_id);
        } else if (ownerResponse.id) {
          localStorage.setItem("ID", ownerResponse.id);
        }
      }

      return ownerResponse;
    } catch (ownerError) {
      // Re-throw the original client error if both fail
      throw clientError;
    }
  }
};

/**
 * Register a new client
 */
export const signupClient = async (
  clientData: ClientSignupRequest
): Promise<AuthClientResponse> => {
  // Convert frontend field names to backend field names
  const backendClientData = {
    Name: clientData.name,
    Email: clientData.email,
    Password: clientData.password,
    Phone: clientData.phone,
    Location: clientData.location,
  };

  console.log("Signing up client with data:", backendClientData);

  try {
    const response = await post<AuthClientResponse>(
      "/client/register",
      backendClientData,
      {
        includeAuth: false,
      }
    );

    console.log("Client signup response:", response);

    // Store token in localStorage for auto-login after signup
    if (response.token) {
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user_type", "client");

      // Store name and email for fallback purposes
      if (response.name) {
        localStorage.setItem("name", response.name);
      }
      if (response.email) {
        localStorage.setItem("email", response.email);
      }

      // Extract and store user ID from token
      const decoded = decodeToken(response.token);
      if (decoded?.user_id) {
        localStorage.setItem("ID", decoded.user_id);
      } else if (response.id) {
        localStorage.setItem("ID", response.id);
      }
    }

    return response;
  } catch (error) {
    console.error("Client signup error details:", error);
    throw error;
  }
};

/**
 * Add animals to an existing client
 */
export const addAnimalsToClient = async (
  clientId: string,
  animals: AnimalRequest[]
): Promise<any> => {
  if (!animals || animals.length === 0) return;

  const promises = animals.map((animal) => {
    const animalData = {
      "animal-name": animal.animal_name,
      "animal-race": animal.animal_race,
      "animal-age": animal.animal_age,
      species: animal.species,
    };
    // Use authenticated endpoint
    return createAnimal(clientId, animalData);
  });

  return Promise.all(promises);
};

/**
 * Register a new owner
 */
export const signupOwner = async (
  ownerData: OwnerSignupRequest
): Promise<AuthOwnerResponse> => {
  // Convert frontend field names to backend field names
  const backendOwnerData = {
    Name: ownerData.name,
    Email: ownerData.email,
    Password: ownerData.password,
    Phone: ownerData.phone,
    Location: ownerData.location,
    Career: ownerData.bio || "",
  };

  console.log("Signing up owner with data:", backendOwnerData);

  try {
    const response = await post<AuthOwnerResponse>(
      "/owner/register",
      backendOwnerData,
      {
        includeAuth: false,
      }
    );

    console.log("Owner signup response:", response);

    // Store token in localStorage for auto-login after signup
    if (response.token) {
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user_type", "owner");

      // Store name and email for fallback purposes
      if (response.name) {
        localStorage.setItem("name", response.name);
      }
      if (response.email) {
        localStorage.setItem("email", response.email);
      }

      // Extract and store user ID from token
      const decoded = decodeToken(response.token);
      if (decoded?.user_id) {
        localStorage.setItem("ID", decoded.user_id);
      } else if (response.id) {
        localStorage.setItem("ID", response.id);
      }
    }

    return response;
  } catch (error) {
    console.error("Owner signup error details:", error);
    throw error;
  }
};

/**
 * Add services to an existing owner
 */
export const addServicesToOwner = async (
  ownerId: string,
  services: ServiceRequest[]
): Promise<any> => {
  if (!services || services.length === 0) return;

  const promises = services.map((service) => {
    // Validate required fields
    if (!service.service_name || !service.service_desc || service.price <= 0) {
      console.error("Invalid service data:", service);
      throw new Error("Service must have a name, description, and valid price");
    }

    // Format service data according to the backend's expected format
    const serviceData = {
      "service-name": service.service_name,
      "service-desc": service.service_desc,
      price: service.price,
      // Duration is required field in ServiceInput but optional in ServiceRequestHandler
      // The backend ServiceRequestHandler doesn't have duration but the model expects it
      duration: service.duration || 60,
    };

    console.log("Creating service with data:", serviceData);

    // Use authenticated endpoint
    return createService(ownerId, serviceData);
  });

  return Promise.all(promises);
};

/**
 * Create an animal for a client
 */
export const createAnimal = async (
  clientId: string,
  animalData: any
): Promise<any> => {
  return await post(`/animal/create?id=${clientId}`, animalData);
};

/**
 * Create a service for an owner
 */
export const createService = async (
  ownerId: string,
  serviceData: any
): Promise<any> => {
  return await post(`/service/create?id=${ownerId}`, serviceData);
};

/**
 * Create an animal for a client (without authentication)
 */
export const createAnimalNoAuth = async (animalData: any): Promise<any> => {
  return await post(`/animal/create-no-auth`, animalData, {
    includeAuth: false,
  });
};

/**
 * Create a service for an owner (without authentication)
 */
export const createServiceNoAuth = async (serviceData: any): Promise<any> => {
  return await post(`/service/create-no-auth`, serviceData, {
    includeAuth: false,
  });
};

/**
 * Get the current client's profile
 */
export const getCurrentClient = async (): Promise<Client> => {
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

  // Get client profile with all related data
  try {
    const clientData = await get<any>(`/client/get-client/${userId}`);
    console.log("Raw client data from API:", clientData);

    // Normalize the response to match our Client interface
    const normalizedClient: Client = {
      id: clientData.id || userId,
      name:
        clientData.name || (clientData.firstname && clientData.lastname)
          ? `${clientData.firstname} ${clientData.lastname}`.trim()
          : localStorage.getItem("name") || "Client",
      email: clientData.email || localStorage.getItem("email") || "",
      phone: clientData.phone || "",
      location: clientData.location || "",
      animals: Array.isArray(clientData.animals) ? clientData.animals : [],
      appointments: Array.isArray(clientData.appointments)
        ? clientData.appointments
        : [],
    };

    // Save important data to localStorage for fallback
    localStorage.setItem("name", normalizedClient.name);
    localStorage.setItem("email", normalizedClient.email);

    console.log("Normalized client data:", normalizedClient);
    return normalizedClient;
  } catch (error) {
    console.error("Error fetching client data:", error);

    // Return minimal client from localStorage as fallback
    const fallbackClient: Client = {
      id: userId,
      name: localStorage.getItem("name") || "Client",
      email: localStorage.getItem("email") || "",
      phone: "",
      location: "",
      animals: [],
      appointments: [],
    };

    console.log("Using fallback client data:", fallbackClient);
    return fallbackClient;
  }
};

/**
 * Get the current owner's profile
 */
export const getCurrentOwner = async (): Promise<Owner> => {
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

  // Get owner profile with all related data
  return await get<Owner>(`/owner/get-owner/${userId}`);
};

/**
 * Get the current user based on user type
 */
export const getCurrentUser = async (): Promise<Client | Owner> => {
  const userType = localStorage.getItem("user_type");

  if (userType === "owner") {
    return getCurrentOwner();
  } else {
    return getCurrentClient();
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  // For client-side logout, we just need to remove the token
  localStorage.removeItem("auth_token");
  localStorage.removeItem("ID");
  localStorage.removeItem("user_type");
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

/**
 * Get user type (client or owner)
 */
export const getUserType = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("user_type");
};

// Re-export types
export type {
  LoginRequest,
  ClientSignupRequest,
  OwnerSignupRequest,
  AuthClientResponse,
  AuthOwnerResponse,
  Client,
  Owner,
  ServiceRequest,
  AnimalRequest,
};
