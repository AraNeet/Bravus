package Struct

import (
	"github.com/google/uuid"
)

// ReviewRequestHandler handles the creation of a new review
type ReviewRequestHandler struct {
	Rating    int    `json:"rating"`
	Comment   string `json:"comment"`
	ServiceID string `json:"service-id"`
}

// ReviewUpdater handles updating an existing review
type ReviewUpdater struct {
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
}

// ReviewSerializer serializes review data for API responses
type ReviewSerializer struct {
	ID        uuid.UUID               `json:"id"`
	Rating    int                     `json:"rating"`
	Comment   string                  `json:"comment"`
	CreatedAt string                  `json:"created_at"`
	UpdatedAt string                  `json:"updated_at"`
	Reviewer  UserReviewSerializer    `json:"reviewer"`
	Provider  UserReviewSerializer    `json:"provider"`
	Service   ServiceReviewSerializer `json:"service"`
}

// UserReviewSerializer serializes minimal user data for review responses
type UserReviewSerializer struct {
	ID              uuid.UUID `json:"id"`
	FirstName       string    `json:"firstname"`
	LastName        string    `json:"lastname"`
	ProfileImageURL string    `json:"profile_image_url,omitempty"`
}

// ServiceReviewSerializer serializes minimal service data for review responses
type ServiceReviewSerializer struct {
	ID          uuid.UUID `json:"id"`
	ServiceName string    `json:"service-name"`
}

// ReviewStatsSerializer serializes review statistics for a provider
type ReviewStatsSerializer struct {
	ProviderID    uuid.UUID   `json:"provider_id"`
	AverageRating float64     `json:"average_rating"`
	ReviewCount   int         `json:"review_count"`
	RatingCounts  map[int]int `json:"rating_counts"` // Map of rating -> count
}
