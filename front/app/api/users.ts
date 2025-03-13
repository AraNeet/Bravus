/**
 * Users API
 *
 * This file contains functions for user-related API requests.
 */

import { get, put, del } from "./http";
import type { User } from "./auth";
import { OwnerWithServices } from "./types";

// Types
export interface UpdateUserRequest {
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  career?: string;
}

/**
 * Get user by ID
 */
export const getCurrentUser = async (
  userId: string | number | null
): Promise<User> => {
  return await get<User>(`/users/${userId}`);
};

/**
 * Update user profile
 */
export const updateUser = async (
  userId: number,
  userData: UpdateUserRequest
): Promise<User> => {
  return await put<User>(`/users/${userId}`, userData);
};

/**
 * Delete user account
 */
export const deleteUser = async (userId: number): Promise<void> => {
  await del(`/users/${userId}`);
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<User[]> => {
  return await get<User[]>("/users");
};

/**
 * Get all owners with their services
 */
export const getOwners = async (): Promise<OwnerWithServices[]> => {
  return await get<OwnerWithServices[]>("/user/get-users");
};
