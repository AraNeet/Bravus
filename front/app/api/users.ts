/**
 * Users API
 *
 * This file contains functions for user-related API requests.
 */

import { get, put, del } from "./http";
import type { User } from "./auth";

// Types
export interface UpdateUserRequest {
  FirstName?: string;
  LastName?: string;
  Phone?: string;
  Career?: string;
}

export interface OwnerWithServices extends User {
  id: string; // Adding ID field for owner identification
}

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User> => {
  return await get<User>(`/user/get-user?id=${userId}`);
};

/**
 * Get user with all related data
 */
export const getUserWithAllData = async (userId: string): Promise<User> => {
  return await get<User>(`/user/get-user-info?id=${userId}`);
};

/**
 * Update user profile
 */
export const updateUser = async (
  userId: string,
  userData: UpdateUserRequest
): Promise<User> => {
  return await put<User>(`/user/update?id=${userId}`, userData);
};

/**
 * Delete user account
 */
export const deleteUser = async (userId: string): Promise<void> => {
  await del(`/user/delete?id=${userId}`);
};

/**
 * Get all business owners with their services
 */
export const getOwners = async (): Promise<OwnerWithServices[]> => {
  return await get<OwnerWithServices[]>("/user/get-users");
};
