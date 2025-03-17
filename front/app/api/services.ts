/**
 * Services API
 *
 * This file contains functions for service-related API requests.
 */

import { get, post, put, del } from "./http";
import type { Service, ServiceRequest } from "./types";

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
    // First try the proper endpoint
    const response = await get<any>(`/owner/get-owner/${userId}`);

    // Try different possible response structures
    if (response.services) {
      return normalizeServices(response.services, userId);
    } else if (response.owner && response.owner.services) {
      return normalizeServices(response.owner.services, userId);
    } else if (Array.isArray(response)) {
      return normalizeServices(response, userId);
    }

    // If we got a response but couldn't find services, log and return empty array
    console.log("Received response but no services found:", response);
    return [];
  } catch (error) {
    console.error("Error fetching services:", error);
    // Fallback to getting the owner data
    try {
      const ownerData = await get<any>(`/owner/${userId}`);
      if (ownerData.services) {
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
    console.error("Expected services array, got:", services);
    return [];
  }

  return services.map((service) => {
    // Create a normalized service object
    const normalizedService: Service = {
      id:
        service.id ||
        service.ID ||
        `service-${Math.random().toString(36).substr(2, 9)}`,
      service_name:
        service.service_name || service["service-name"] || "Unnamed Service",
      service_desc:
        service.service_desc || service["service-desc"] || "No description",
      price:
        typeof service.price === "number"
          ? service.price
          : parseFloat(service.price || "0"),
      duration:
        typeof service.duration === "number"
          ? service.duration
          : parseInt(service.duration || "60", 10),
      owner_id: service.owner_id || service.ownerId || ownerId,
    };

    return normalizedService;
  });
}
