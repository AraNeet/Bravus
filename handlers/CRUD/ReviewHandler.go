package CRUD

import (
	"time"

	"github.com/AramisAra/BravusBackend/Global"
	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// CreateReview creates a new review
func CreateReview(c *fiber.Ctx) error {
	// Parse input
	input := new(Struct.ReviewInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input data",
		})
	}

	// Create review
	review := models.Review{
		Content:  input.Content,
		ClientID: input.ClientID,
		OwnerID:  input.OwnerID,
	}

	// Save to database
	if err := Global.DB.Create(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create review",
		})
	}

	// Get client data for the review
	var client models.Client
	if err := Global.DB.First(&client, "id = ?", review.ClientID).Error; err != nil {
		// Still return the review even if client can't be found
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"message": "Review created successfully",
			"review": Struct.ReviewSerializer{
				ID:        review.ID,
				Content:   review.Content,
				CreatedAt: review.CreatedAt.Format(time.RFC3339),
				ClientID:  review.ClientID,
				OwnerID:   review.OwnerID,
			},
		})
	}

	// Return serialized review data with client info
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Review created successfully",
		"review": Struct.ReviewSerializer{
			ID:        review.ID,
			Content:   review.Content,
			CreatedAt: review.CreatedAt.Format(time.RFC3339),
			ClientID:  review.ClientID,
			OwnerID:   review.OwnerID,
			Client: Struct.ClientSerializer{
				ID:    client.ID,
				Name:  client.Name,
				Email: client.Email,
				Phone: client.Phone,
			},
		},
	})
}

// GetReviews retrieves all reviews
func GetReviews(c *fiber.Ctx) error {
	var reviews []models.Review

	// Get all reviews from database
	if err := Global.DB.Find(&reviews).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch reviews",
		})
	}

	// Serialize reviews
	serializedReviews := make([]Struct.ReviewSerializer, len(reviews))
	for i, review := range reviews {
		// Get client data for each review
		var client models.Client
		err := Global.DB.First(&client, "id = ?", review.ClientID).Error

		if err == nil {
			serializedReviews[i] = Struct.ReviewSerializer{
				ID:        review.ID,
				Content:   review.Content,
				CreatedAt: review.CreatedAt.Format(time.RFC3339),
				ClientID:  review.ClientID,
				OwnerID:   review.OwnerID,
				Client: Struct.ClientSerializer{
					ID:    client.ID,
					Name:  client.Name,
					Email: client.Email,
					Phone: client.Phone,
				},
			}
		} else {
			serializedReviews[i] = Struct.ReviewSerializer{
				ID:        review.ID,
				Content:   review.Content,
				CreatedAt: review.CreatedAt.Format(time.RFC3339),
				ClientID:  review.ClientID,
				OwnerID:   review.OwnerID,
			}
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"reviews": serializedReviews,
	})
}

// GetReviewByID retrieves a review by ID
func GetReviewByID(c *fiber.Ctx) error {
	id := c.Params("id")
	reviewID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid review ID",
		})
	}

	// Find review
	var review models.Review
	if err := Global.DB.First(&review, "id = ?", reviewID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Review not found",
		})
	}

	// Get client data for the review
	var client models.Client
	err = Global.DB.First(&client, "id = ?", review.ClientID).Error

	var serializedReview Struct.ReviewSerializer
	if err == nil {
		serializedReview = Struct.ReviewSerializer{
			ID:        review.ID,
			Content:   review.Content,
			CreatedAt: review.CreatedAt.Format(time.RFC3339),
			ClientID:  review.ClientID,
			OwnerID:   review.OwnerID,
			Client: Struct.ClientSerializer{
				ID:    client.ID,
				Name:  client.Name,
				Email: client.Email,
				Phone: client.Phone,
			},
		}
	} else {
		serializedReview = Struct.ReviewSerializer{
			ID:        review.ID,
			Content:   review.Content,
			CreatedAt: review.CreatedAt.Format(time.RFC3339),
			ClientID:  review.ClientID,
			OwnerID:   review.OwnerID,
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"review": serializedReview,
	})
}

// GetReviewsByOwnerID retrieves all reviews for a specific owner
func GetReviewsByOwnerID(c *fiber.Ctx) error {
	id := c.Params("id")
	ownerID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid owner ID",
		})
	}

	// Find reviews by owner ID
	var reviews []models.Review
	if err := Global.DB.Where("owner_id = ?", ownerID).Find(&reviews).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch reviews",
		})
	}

	// Serialize reviews
	serializedReviews := make([]Struct.ReviewSerializer, len(reviews))
	for i, review := range reviews {
		// Get client data for each review
		var client models.Client
		err := Global.DB.First(&client, "id = ?", review.ClientID).Error

		if err == nil {
			serializedReviews[i] = Struct.ReviewSerializer{
				ID:        review.ID,
				Content:   review.Content,
				CreatedAt: review.CreatedAt.Format(time.RFC3339),
				ClientID:  review.ClientID,
				OwnerID:   review.OwnerID,
				Client: Struct.ClientSerializer{
					ID:    client.ID,
					Name:  client.Name,
					Email: client.Email,
					Phone: client.Phone,
				},
			}
		} else {
			serializedReviews[i] = Struct.ReviewSerializer{
				ID:        review.ID,
				Content:   review.Content,
				CreatedAt: review.CreatedAt.Format(time.RFC3339),
				ClientID:  review.ClientID,
				OwnerID:   review.OwnerID,
			}
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"reviews": serializedReviews,
	})
}

// UpdateReview updates a review
func UpdateReview(c *fiber.Ctx) error {
	id := c.Params("id")
	reviewID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid review ID",
		})
	}

	// Parse input
	input := new(Struct.ReviewInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input data",
		})
	}

	// Find review
	var review models.Review
	if err := Global.DB.First(&review, "id = ?", reviewID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Review not found",
		})
	}

	// Update review if content is provided
	if input.Content != "" {
		review.Content = input.Content
	}

	// Save changes
	if err := Global.DB.Save(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update review",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Review updated successfully",
		"review": Struct.ReviewSerializer{
			ID:        review.ID,
			Content:   review.Content,
			CreatedAt: review.CreatedAt.Format(time.RFC3339),
			ClientID:  review.ClientID,
			OwnerID:   review.OwnerID,
		},
	})
}

// DeleteReview deletes a review
func DeleteReview(c *fiber.Ctx) error {
	id := c.Params("id")
	reviewID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid review ID",
		})
	}

	// Find review
	var review models.Review
	if err := Global.DB.First(&review, "id = ?", reviewID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Review not found",
		})
	}

	// Delete review
	if err := Global.DB.Delete(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete review",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Review deleted successfully",
	})
}
