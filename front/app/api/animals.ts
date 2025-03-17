/**
 * Animals API
 *
 * This file contains functions for animal-related API requests.
 */

import { get, post, put, del } from "./http";
import type { Animal } from "./types";

// Types
export interface CreateAnimalRequest {
  "animal-name": string;
  "animal-race": string;
  "animal-age": number;
  species: string;
  metadata?: string; // JSON string for additional fields
}

export interface UpdateAnimalRequest {
  "animal-name"?: string;
  "animal-race"?: string;
  "animal-age"?: number;
  species?: string;
  metadata?: string; // JSON string for additional fields
}

/**
 * Create a new animal
 */
export const createAnimal = async (
  ownerId: string,
  animalData: CreateAnimalRequest
): Promise<Animal> => {
  return await post<Animal>(`/animal/create?id=${ownerId}`, animalData);
};

/**
 * Get animal by ID
 */
export const getAnimalById = async (animalId: string): Promise<Animal> => {
  return await get<Animal>(`/animal/get-animal?id=${animalId}`);
};

/**
 * Get all animals for a client
 */
export const getAnimalsByClientId = async (clientId: string): Promise<Animal[]> => {
  return await get<Animal[]>(`/animal/client?id=${clientId}`);
};

/**
 * Update animal
 */
export const updateAnimal = async (
  animalId: string,
  animalData: UpdateAnimalRequest
): Promise<Animal> => {
  return await put<Animal>(`/animal/update?id=${animalId}`, animalData);
};

/**
 * Delete animal
 */
export const deleteAnimal = async (animalId: string): Promise<void> => {
  await del(`/animal/delete?id=${animalId}`);
};

/**
 * Create a new animal without authentication
 */
export const createAnimalNoAuth = async (
  animalData: CreateAnimalRequest
): Promise<Animal> => {
  return await post<Animal>(`/animal/create-no-auth`, animalData);
};
