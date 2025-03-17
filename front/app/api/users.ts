/**
 * Users API
 *
 * This file contains functions for user-related API requests.
 */

import { get, post, put, del } from "./http";
import type { Client, Owner, Service } from "./types";

// Types
export interface UpdateUserRequest {
  Name?: string;
  Phone?: string;
  Career?: string;
}

export interface ClientRequest {
  Name: string;
  Email: string;
  Phone: string;
  Password: string;
}

export interface OwnerRequest {
  Name: string;
  Email: string;
  Phone: string;
  Password: string;
  Career: string;
}

export interface OwnerWithServices extends Omit<Owner, "services"> {
  firstname?: string;
  lastname?: string;
  career?: string;
  rating?: number;
  reviewCount?: number;
  services: Service[];
}

/**
 * Client API functions
 */

export const createClient = async (
  clientData: ClientRequest
): Promise<Client> => {
  return await post<Client>(`/client/register`, clientData);
};

export const getClients = async (): Promise<Client[]> => {
  return await get<Client[]>(`/client/get-clients`);
};

export const getClientById = async (clientId: string): Promise<Client> => {
  return await get<Client>(`/client/get-client/${clientId}`);
};

export const updateClient = async (
  clientId: string,
  clientData: Partial<ClientRequest>
): Promise<Client> => {
  return await put<Client>(`/client/update/${clientId}`, clientData);
};

export const deleteClient = async (clientId: string): Promise<void> => {
  await del(`/client/delete/${clientId}`);
};

/**
 * Owner API functions
 */

export const createOwner = async (ownerData: OwnerRequest): Promise<Owner> => {
  return await post<Owner>(`/owner/register`, ownerData);
};

export const getOwners = async (): Promise<OwnerWithServices[]> => {
  try {
    // Handle both direct array response and object with owners field
    const response = await get<any>(`/owner/get-owners`);

    // Determine if response is an array or object with owners field
    const owners = Array.isArray(response)
      ? response
      : response.owners && Array.isArray(response.owners)
      ? response.owners
      : [];

    console.log("Raw owners response:", owners);

    if (owners.length === 0) {
      console.warn("No owners returned from API");
    }

    return owners.map((owner: any) => {
      // Normalize owner data to handle different backend formats
      return {
        id: owner.id,
        name:
          owner.name ||
          `${owner.firstname || ""} ${owner.lastname || ""}`.trim(),
        email: owner.email,
        phone: owner.phone,
        location: owner.location || "",
        bio: owner.bio || "",
        // Handle first/last name fields
        firstname: owner.firstname || owner.name?.split(" ")[0] || "",
        lastname:
          owner.lastname || owner.name?.split(" ").slice(1).join(" ") || "",
        // Handle career/profession
        career: owner.career || owner.Career || "",
        // Handle services - ensure they have proper structure
        services: Array.isArray(owner.services)
          ? owner.services.map((service: any) => ({
              id: service.id,
              service_name:
                service.service_name ||
                service["service-name"] ||
                "Unnamed Service",
              service_desc:
                service.service_desc || service["service-desc"] || "",
              price:
                typeof service.price === "number"
                  ? service.price
                  : parseFloat(service.price || "0"),
              duration: service.duration || 60,
              owner_id: service.owner_id || owner.id,
            }))
          : [],
        // Handle ratings - defaults if not available
        rating: owner.rating || 0,
        reviewCount: owner.reviewCount || 0,
        appointments: owner.appointments || [],
      };
    });
  } catch (error) {
    console.error("Error fetching owners:", error);
    // Return empty array if there's an error
    return [];
  }
};

export const getOwnerById = async (
  ownerId: string
): Promise<OwnerWithServices> => {
  try {
    const response = await get<any>(`/owner/get-owner/${ownerId}`);
    console.log("Raw owner data from API:", response);

    // Handle both response formats - either owner object directly or wrapped in an "owner" property
    const owner = response.owner ? response.owner : response;

    if (!owner || !owner.id) {
      console.error("Invalid owner data returned:", owner);
      throw new Error("Failed to retrieve valid owner data");
    }

    // Normalize the owner data
    return {
      id: owner.id,
      name:
        owner.name || `${owner.firstname || ""} ${owner.lastname || ""}`.trim(),
      email: owner.email,
      phone: owner.phone,
      location: owner.location || "",
      bio: owner.bio || "",
      firstname: owner.firstname || owner.name?.split(" ")[0] || "",
      lastname:
        owner.lastname || owner.name?.split(" ").slice(1).join(" ") || "",
      career: owner.career || owner.Career || "",
      services: Array.isArray(owner.services)
        ? owner.services.map((service: any) => ({
            id: service.id,
            service_name:
              service.service_name ||
              service["service-name"] ||
              "Unnamed Service",
            service_desc: service.service_desc || service["service-desc"] || "",
            price:
              typeof service.price === "number"
                ? service.price
                : parseFloat(service.price || "0"),
            duration: service.duration || 60,
            owner_id: service.owner_id || owner.id,
          }))
        : [],
      rating: owner.rating || owner.averageRating || 0,
      reviewCount:
        owner.reviewCount || (owner.reviews ? owner.reviews.length : 0),
      appointments: owner.appointments || [],
    };
  } catch (error) {
    console.error(`Error fetching owner ${ownerId}:`, error);
    throw error;
  }
};

export const updateOwner = async (
  ownerId: string,
  ownerData: Partial<OwnerRequest>
): Promise<Owner> => {
  return await put<Owner>(`/owner/update/${ownerId}`, ownerData);
};

export const deleteOwner = async (ownerId: string): Promise<void> => {
  await del(`/owner/delete/${ownerId}`);
};

/**
 * Get a user with all their data (appointments, services, etc.)
 * This function is used in the clients page to extract client information
 * from the owner's appointments.
 */
export const getUserWithAllData = async (userId: string): Promise<any> => {
  if (!userId) {
    console.error("getUserWithAllData called with empty userId");
    throw new Error("Invalid user ID");
  }

  try {
    // Direct API call to get owner by ID without going through getOwnerById
    const response = await get<any>(`/owner/get-owner/${userId}`);

    // Handle both response formats - either owner object directly or wrapped in an "owner" property
    const owner = response.owner ? response.owner : response;

    if (owner && owner.id) {
      // It's an owner, normalize the data
      return {
        id: owner.id,
        name:
          owner.name ||
          `${owner.firstname || ""} ${owner.lastname || ""}`.trim(),
        email: owner.email,
        phone: owner.phone,
        location: owner.location || "",
        bio: owner.bio || "",
        firstname: owner.firstname || owner.name?.split(" ")[0] || "",
        lastname:
          owner.lastname || owner.name?.split(" ").slice(1).join(" ") || "",
        career: owner.career || owner.Career || "",
        services: Array.isArray(owner.services)
          ? owner.services.map((service: any) => ({
              id: service.id,
              service_name:
                service.service_name ||
                service["service-name"] ||
                "Unnamed Service",
              service_desc:
                service.service_desc || service["service-desc"] || "",
              price:
                typeof service.price === "number"
                  ? service.price
                  : parseFloat(service.price || "0"),
              duration: service.duration || 60,
              owner_id: service.owner_id || owner.id,
            }))
          : [],
        rating: owner.rating || owner.averageRating || 0,
        reviewCount:
          owner.reviewCount || (owner.reviews ? owner.reviews.length : 0),
        appointments: owner.appointments || [],
      };
    }

    // If not an owner or owner fetch failed, try as client
    try {
      const clientResponse = await get<any>(`/client/get-client/${userId}`);
      const client = clientResponse.client
        ? clientResponse.client
        : clientResponse;

      if (client && client.id) {
        return {
          id: client.id,
          name: client.name || "",
          email: client.email || "",
          phone: client.phone || "",
          appointments: client.appointments || [],
        };
      }
    } catch (clientError) {
      console.error("Error fetching client data:", clientError);
    }

    throw new Error("User not found");
  } catch (error) {
    console.error(`Error in getUserWithAllData for ${userId}:`, error);
    throw error;
  }
};
