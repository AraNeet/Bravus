/**
 * Reviews API
 *
 * This file contains functions for review-related API requests.
 */

import { get, post, put, del } from "./http";
import type { Review } from "./types";

// Types
export interface CreateReviewRequest {
  Content: string;
  ClientId: string;
  OwnerId: string;
}

export interface UpdateReviewRequest {
  Content?: string;
}

/**
 * Create a new review
 */
export const createReview = async (
  reviewData: CreateReviewRequest
): Promise<Review> => {
  return await post<Review>(`/review/create`, reviewData);
};

/**
 * Get all reviews
 */
export const getReviews = async (): Promise<Review[]> => {
  return await get<Review[]>(`/review/get-reviews`);
};

/**
 * Get review by ID
 */
export const getReviewById = async (reviewId: string): Promise<Review> => {
  return await get<Review>(`/review/get-review/${reviewId}`);
};

/**
 * Get reviews by owner ID
 */
export const getReviewsByOwnerId = async (
  ownerId: string
): Promise<Review[]> => {
  return await get<Review[]>(`/review/get-reviews-by-owner/${ownerId}`);
};

/**
 * Update review
 */
export const updateReview = async (
  reviewId: string,
  reviewData: UpdateReviewRequest
): Promise<Review> => {
  return await put<Review>(`/review/update/${reviewId}`, reviewData);
};

/**
 * Delete review
 */
export const deleteReview = async (reviewId: string): Promise<void> => {
  await del(`/review/delete/${reviewId}`);
};
