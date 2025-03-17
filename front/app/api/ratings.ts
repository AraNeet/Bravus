/**
 * Ratings API
 *
 * This file contains functions for rating-related API requests.
 */

import { get, post, put, del } from "./http";
import type { Rating } from "./types";

// Types
export interface CreateRatingRequest {
  Score: number;
  ClientId: string;
  OwnerId: string;
}

export interface UpdateRatingRequest {
  Score?: number;
}

/**
 * Create a new rating
 */
export const createRating = async (
  ratingData: CreateRatingRequest
): Promise<Rating> => {
  return await post<Rating>(`/rating/create`, ratingData);
};

/**
 * Get all ratings
 */
export const getRatings = async (): Promise<Rating[]> => {
  return await get<Rating[]>(`/rating/get-ratings`);
};

/**
 * Get rating by ID
 */
export const getRatingById = async (ratingId: string): Promise<Rating> => {
  return await get<Rating>(`/rating/get-rating/${ratingId}`);
};

/**
 * Get ratings by owner ID
 */
export const getRatingsByOwnerId = async (
  ownerId: string
): Promise<Rating[]> => {
  return await get<Rating[]>(`/rating/get-ratings-by-owner/${ownerId}`);
};

/**
 * Get average rating by owner ID
 */
export const getAverageRatingByOwnerId = async (
  ownerId: string
): Promise<number> => {
  return await get<number>(`/rating/get-average-rating/${ownerId}`);
};

/**
 * Update rating
 */
export const updateRating = async (
  ratingId: string,
  ratingData: UpdateRatingRequest
): Promise<Rating> => {
  return await put<Rating>(`/rating/update/${ratingId}`, ratingData);
};

/**
 * Delete rating
 */
export const deleteRating = async (ratingId: string): Promise<void> => {
  await del(`/rating/delete/${ratingId}`);
};
