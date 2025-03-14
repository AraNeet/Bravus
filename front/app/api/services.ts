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
  // Debug JWT token state
  const tokenInfo = debugToken();
  console.log("JWT Token Debug Info:", tokenInfo);
  
  // Try multiple approaches to fetch services
  const endpoints = [
    `/service/get-user-services?id=${userId}`,  // Primary endpoint we expect to work
    `/service/user/${userId}`,                  // Alternative endpoint format
    `/user/${userId}/services`,                 // RESTful endpoint format
    `/user/get-services?userId=${userId}`,      // Query param format
    `/user/get-user-service?id=${userId}`       // Existing endpoint
  ];
  
  let lastError: any = null;
  
  // Try each endpoint in sequence
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      const response = await get<any>(endpoint);
      console.log(`Response from ${endpoint}:`, response);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        console.log("Found array response - returning directly");
        return response;
      } 
      
      if (response && typeof response === 'object') {
        // Check for nested data
        if (response.data && Array.isArray(response.data)) {
          console.log("Found data property with array - returning data");
          return response.data;
        }
        
        // Check for nested services
        if (response.services && Array.isArray(response.services)) {
          console.log("Found services property with array - returning services");
          return response.services;
        }
        
        // If a single service returned, wrap in array
        if (response.id) {
          console.log("Found single service object - returning as array");
          return [response];
        }
      }
      
      console.warn(`Endpoint ${endpoint} returned unexpected format:`, response);
    } catch (error) {
      console.error(`Error with endpoint ${endpoint}:`, error);
      lastError = error;
      // Continue to next endpoint
    }
  }
  
  // If all endpoints failed, try to get user data directly
  try {
    console.log("Trying to get user data with services included");
    const userData = await get<any>(`/user/get?id=${userId}`);
    if (userData && userData.services && Array.isArray(userData.services)) {
      console.log("Retrieved services from user data");
      return userData.services;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
  }
  
  // If we got here, all attempts failed
  console.error("All service retrieval attempts failed");
  console.error("Last error:", lastError);
  
  // Return empty array instead of throwing
  return [];
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
