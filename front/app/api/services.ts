/**
 * Services API
 *
 * This file contains functions for service-related API requests.
 */

import { get, post, put, del } from "./http";
import type { Service } from "./types";
import { debugToken } from "@/app/utils/jwt-utils";

// Types
export interface CreateServiceRequest {
  "service-name": string;
  "service-desc": string;
  price: number;
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
  serviceData: CreateServiceRequest
): Promise<Service> => {
  return await post<Service>(`/service/create?id=${ownerId}`, serviceData);
};

/**
 * Get all services for a user
 */
export const getUserServices = async (userId: string): Promise<Service[]> => {
  try {
    // Use only one reliable endpoint
    const response = await get<Service[]>(
      `/user/get-user-service?id=${userId}`
    );
    return response || [];
  } catch (error) {
    console.error("Error fetching user services:", error);
    return [];
  }
};

/**
 * Get service by ID
 */
export const getServiceById = async (serviceId: string): Promise<Service> => {
  return await get<Service>(`/service/get-service?id=${serviceId}`);
};

/**
 * Update service
 */
export const updateService = async (
  serviceId: string,
  serviceData: UpdateServiceRequest
): Promise<Service> => {
  return await put<Service>(`/service/update?id=${serviceId}`, serviceData);
};

/**
 * Delete service
 */
export const deleteService = async (serviceId: string): Promise<void> => {
  await del(`/service/delete?id=${serviceId}`);
};
