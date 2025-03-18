/**
 * Services API
 *
 * This file contains functions for service-related API requests.
 */

import { get, post, put, del } from "./http";
import type { Service, ServiceRequest } from "./types";
import { getOwners } from "./users";

// Types
export interface CreateServiceRequest {
  "service-name": string;
  "service-desc": string;
  price: number;
  duration: number;
}

export interface UpdateServiceRequest {
  "service-name"?: string;
  "service-desc"?: string;
  price?: number;
}

/**
 * Create a new service
 */
export const createService = async (
  ownerId: string,
  serviceData: any
): Promise<Service> => {
  console.log("createService called with:", { ownerId, serviceData });

  // Ensure data structure matches backend's expectations
  // The backend expects 'service-name', 'service-desc', and 'price'
  if (!serviceData["service-name"] && serviceData.service_name) {
    serviceData["service-name"] = serviceData.service_name;
  }

  if (!serviceData["service-desc"] && serviceData.service_desc) {
    serviceData["service-desc"] = serviceData.service_desc;
  }

  // Make sure duration field is present
  if (!serviceData.duration) {
    serviceData.duration = 60; // Default to 60 minutes
  }

  console.log("Formatted service data:", serviceData);

  return await post<Service>(`/service/create?id=${ownerId}`, serviceData);
};

/**
 * Get service by ID
 */
export const getServiceById = async (id: string): Promise<Service> => {
  return await get<Service>(`/service/get-service?id=${id}`);
};

/**
 * Update service
 */
export const updateService = async (
  id: string,
  serviceData: Partial<ServiceRequest>
): Promise<Service> => {
  return await put<Service>(`/service/update?id=${id}`, serviceData);
};

/**
 * Delete service
 */
export const deleteService = async (id: string): Promise<void> => {
  await del(`/service/delete?id=${id}`);
};

/**
 * Create a new service without authentication
 */
export const createServiceNoAuth = async (
  serviceData: ServiceRequest
): Promise<Service> => {
  return await post<Service>(`/service/create-no-auth`, serviceData);
};

// Re-export types
export type { Service, ServiceRequest };

// Add the getUserServices function
/**
 * Get all services for a user
 */
export const getUserServices = async (userId: string): Promise<Service[]> => {
  try {
    console.log(`Fetching services for user ID: ${userId}`);

    // First try the proper endpoint
    const response = await get<any>(`/owner/get-owner/${userId}`);
    console.log("getUserServices response:", JSON.stringify(response, null, 2));

    // Try different possible response structures
    if (response.services && Array.isArray(response.services)) {
      console.log(
        `Found ${response.services.length} services in response.services`
      );
      return normalizeServices(response.services, userId);
    } else if (
      response.owner &&
      response.owner.services &&
      Array.isArray(response.owner.services)
    ) {
      console.log(
        `Found ${response.owner.services.length} services in response.owner.services`
      );
      return normalizeServices(response.owner.services, userId);
    } else if (Array.isArray(response)) {
      console.log(`Response is an array with ${response.length} items`);
      return normalizeServices(response, userId);
    }

    // If we got a response but couldn't find services, log and try direct Services endpoint
    console.log(
      "Could not find services in primary response, trying Services endpoint"
    );
    try {
      const servicesResponse = await get<any>(`/services/owner/${userId}`);
      if (Array.isArray(servicesResponse)) {
        console.log(
          `Found ${servicesResponse.length} services from direct services endpoint`
        );
        return normalizeServices(servicesResponse, userId);
      }
    } catch (servicesError) {
      console.log("Failed to fetch from Services endpoint:", servicesError);
    }

    // If we got a response but still couldn't find services, log and return empty array
    console.log("Received response but no services found:", response);
    return [];
  } catch (error) {
    console.error("Error fetching services:", error);
    // Fallback to getting the owner data
    try {
      console.log(`Trying fallback endpoint: /owner/${userId}`);
      const ownerData = await get<any>(`/owner/${userId}`);
      console.log("Fallback owner data:", JSON.stringify(ownerData, null, 2));

      if (ownerData.services && Array.isArray(ownerData.services)) {
        console.log(`Found ${ownerData.services.length} services in fallback`);
        return normalizeServices(ownerData.services, userId);
      }
      return [];
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError);
      return [];
    }
  }
};

/**
 * Normalize services to ensure all have consistent property names
 */
function normalizeServices(services: any[], ownerId: string): Service[] {
  if (!Array.isArray(services)) {
    console.warn("Expected services array, got:", typeof services);
    return [];
  }

  return services.map((service: any) => {
    // Handle different cases of service structure
    const normalized: Service = {
      id:
        service.id ||
        service.ID ||
        `mock-${Math.random().toString(36).substring(2, 9)}`,
      service_name:
        service.service_name ||
        service.ServiceName ||
        service["service-name"] ||
        "Unnamed Service",
      service_desc:
        service.service_desc ||
        service.ServiceDesc ||
        service["service-desc"] ||
        "",
      price:
        typeof service.price === "number"
          ? service.price
          : typeof service.Price === "number"
          ? service.Price
          : parseFloat(service.price || service.Price || "0"),
      duration: service.duration || service.Duration || 60,
      owner_id:
        service.owner_id || service.OwnerID || service.ownerID || ownerId,
    };

    console.log("Normalized service:", normalized);
    return normalized;
  });
}

/**
 * Get all services across all providers
 * This fetches all owners with their services and flattens them into a single array
 */
export const getAllServices = async (): Promise<Service[]> => {
  try {
    // Fetch all owners with their services
    const owners = await getOwners();
    
    // Extract and flatten all services
    const allServices: Service[] = [];
    
    owners.forEach(owner => {
      if (Array.isArray(owner.services)) {
        // Add each service to our collection
        owner.services.forEach(service => {
          // Ensure it has a valid owner_id
          const normalizedService = {
            ...service,
            owner_id: service.owner_id || owner.id
          };
          
          allServices.push(normalizedService);
        });
      }
    });
    
    console.log(`Found a total of ${allServices.length} services across all providers`);
    return allServices;
  } catch (error) {
    console.error("Error fetching all services:", error);
    return [];
  }
};

/**
 * Get all services directly using the dedicated endpoint
 * This uses the /service/get-services endpoint which returns all services in the system
 */
export const getServices = async (): Promise<Service[]> => {
  try {
    console.log("Fetching all services using dedicated endpoint");
    const response = await get<any>('/service/get-services');
    
    // Handle different response formats
    const services = Array.isArray(response) ? response : [];
    
    console.log(`Found ${services.length} services from get-services endpoint`);
    
    // Normalize the service data
    const normalizedServices = services.map((service: any) => ({
      id: service.id || service.ID || "",
      service_name: service.service_name || service.ServiceName || service["service-name"] || "Unnamed Service",
      service_desc: service.service_desc || service.ServiceDesc || service["service-desc"] || "",
      price: typeof service.price === "number" ? service.price : parseFloat(service.price || "0"),
      duration: service.duration || service.Duration || 60,
      owner_id: service.owner_id || service.OwnerID || service.ownerID || "",
    }));
    
    return normalizedServices;
  } catch (error) {
    console.error("Error fetching all services:", error);
    
    // Fall back to the previous method if the direct endpoint fails
    console.log("Falling back to getting services from owners");
    return getAllServices();
  }
};
