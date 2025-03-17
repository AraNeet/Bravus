package CRUD

import (
	"strings"
	"time"

	"github.com/AramisAra/BravusBackend/Global"
	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// CreateRating creates a new rating
func CreateRating(c *fiber.Ctx) error {
	// Parse input
	input := new(Struct.RatingInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input data",
		})
	}

	// Validate score is between 0 and 5
	if input.Score < 0 || input.Score > 5 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Rating score must be between 0 and 5",
		})
	}

	// Create rating
	rating := models.Rating{
		Score:    input.Score,
		ClientID: input.ClientID,
		OwnerID:  input.OwnerID,
	}

	// Save to database
	if err := Global.DB.Create(&rating).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create rating",
		})
	}

	// Get client data for the rating
	var client models.Client
	if err := Global.DB.First(&client, "id = ?", rating.ClientID).Error; err != nil {
		// Still return the rating even if client can't be found
		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"message": "Rating created successfully",
			"rating": Struct.RatingSerializer{
				ID:        rating.ID,
				Score:     rating.Score,
				CreatedAt: rating.CreatedAt.Format(time.RFC3339),
				ClientID:  rating.ClientID,
				OwnerID:   rating.OwnerID,
			},
		})
	}

	// Return serialized rating data with client info
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Rating created successfully",
		"rating": Struct.RatingSerializer{
			ID:        rating.ID,
			Score:     rating.Score,
			CreatedAt: rating.CreatedAt.Format(time.RFC3339),
			ClientID:  rating.ClientID,
			OwnerID:   rating.OwnerID,
			Client: Struct.ClientSerializer{
				ID:    client.ID,
				Name:  client.Name,
				Email: client.Email,
				Phone: client.Phone,
			},
		},
	})
}

// GetRatings retrieves all ratings
func GetRatings(c *fiber.Ctx) error {
	var ratings []models.Rating

	// Get all ratings from database
	if err := Global.DB.Find(&ratings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch ratings",
		})
	}

	// Serialize ratings
	serializedRatings := make([]Struct.RatingSerializer, len(ratings))
	for i, rating := range ratings {
		// Get client data for each rating
		var client models.Client
		err := Global.DB.First(&client, "id = ?", rating.ClientID).Error

		if err == nil {
			serializedRatings[i] = Struct.RatingSerializer{
				ID:        rating.ID,
				Score:     rating.Score,
				CreatedAt: rating.CreatedAt.Format(time.RFC3339),
				ClientID:  rating.ClientID,
				OwnerID:   rating.OwnerID,
				Client: Struct.ClientSerializer{
					ID:    client.ID,
					Name:  client.Name,
					Email: client.Email,
					Phone: client.Phone,
				},
			}
		} else {
			serializedRatings[i] = Struct.RatingSerializer{
				ID:        rating.ID,
				Score:     rating.Score,
				CreatedAt: rating.CreatedAt.Format(time.RFC3339),
				ClientID:  rating.ClientID,
				OwnerID:   rating.OwnerID,
			}
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"ratings": serializedRatings,
	})
}

// GetRatingByID retrieves a rating by ID
func GetRatingByID(c *fiber.Ctx) error {
	id := c.Params("id")
	ratingID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid rating ID",
		})
	}

	// Find rating
	var rating models.Rating
	if err := Global.DB.First(&rating, "id = ?", ratingID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Rating not found",
		})
	}

	// Get client data for the rating
	var client models.Client
	err = Global.DB.First(&client, "id = ?", rating.ClientID).Error

	var serializedRating Struct.RatingSerializer
	if err == nil {
		serializedRating = Struct.RatingSerializer{
			ID:        rating.ID,
			Score:     rating.Score,
			CreatedAt: rating.CreatedAt.Format(time.RFC3339),
			ClientID:  rating.ClientID,
			OwnerID:   rating.OwnerID,
			Client: Struct.ClientSerializer{
				ID:    client.ID,
				Name:  client.Name,
				Email: client.Email,
				Phone: client.Phone,
			},
		}
	} else {
		serializedRating = Struct.RatingSerializer{
			ID:        rating.ID,
			Score:     rating.Score,
			CreatedAt: rating.CreatedAt.Format(time.RFC3339),
			ClientID:  rating.ClientID,
			OwnerID:   rating.OwnerID,
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"rating": serializedRating,
	})
}

// GetRatingsByOwnerID retrieves all ratings for a specific owner
func GetRatingsByOwnerID(c *fiber.Ctx) error {
	id := c.Params("id")
	ownerID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid owner ID",
		})
	}

	// Find ratings by owner ID
	var ratings []models.Rating
	if err := Global.DB.Where("owner_id = ?", ownerID).Find(&ratings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch ratings",
		})
	}

	// Serialize ratings
	serializedRatings := make([]Struct.RatingSerializer, len(ratings))
	for i, rating := range ratings {
		// Get client data for each rating
		var client models.Client
		err := Global.DB.First(&client, "id = ?", rating.ClientID).Error

		if err == nil {
			serializedRatings[i] = Struct.RatingSerializer{
				ID:        rating.ID,
				Score:     rating.Score,
				CreatedAt: rating.CreatedAt.Format(time.RFC3339),
				ClientID:  rating.ClientID,
				OwnerID:   rating.OwnerID,
				Client: Struct.ClientSerializer{
					ID:    client.ID,
					Name:  client.Name,
					Email: client.Email,
					Phone: client.Phone,
				},
			}
		} else {
			serializedRatings[i] = Struct.RatingSerializer{
				ID:        rating.ID,
				Score:     rating.Score,
				CreatedAt: rating.CreatedAt.Format(time.RFC3339),
				ClientID:  rating.ClientID,
				OwnerID:   rating.OwnerID,
			}
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"ratings": serializedRatings,
	})
}

// GetAverageRatingByOwnerID calculates and returns the average rating for a specific owner
func GetAverageRatingByOwnerID(c *fiber.Ctx) error {
	id := c.Params("id")
	ownerID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid owner ID",
		})
	}

	// Find ratings by owner ID
	var ratings []models.Rating
	if err := Global.DB.Where("owner_id = ?", ownerID).Find(&ratings).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch ratings",
		})
	}

	// Calculate average rating
	var averageRating float64
	if len(ratings) > 0 {
		var totalRating float64
		for _, rating := range ratings {
			totalRating += rating.Score
		}
		averageRating = totalRating / float64(len(ratings))
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"owner_id":       ownerID,
		"average_rating": averageRating,
		"total_ratings":  len(ratings),
	})
}

// UpdateRating updates a rating
func UpdateRating(c *fiber.Ctx) error {
	id := c.Params("id")
	ratingID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid rating ID",
		})
	}

	// Parse input
	input := new(Struct.RatingInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input data",
		})
	}

	// Validate score if provided (0 is a valid score, so we check if the field was included in the request)
	if input.Score < 0 || input.Score > 5 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Rating score must be between 0 and 5",
		})
	}

	// Find rating
	var rating models.Rating
	if err := Global.DB.First(&rating, "id = ?", ratingID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Rating not found",
		})
	}

	// Check if score is provided in the request body
	// Since 0 is a valid score, we can't just check if input.Score == 0
	body := string(c.Body())
	if strings.Contains(body, "score") {
		rating.Score = input.Score
	}

	// Save changes
	if err := Global.DB.Save(&rating).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update rating",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Rating updated successfully",
		"rating": Struct.RatingSerializer{
			ID:        rating.ID,
			Score:     rating.Score,
			CreatedAt: rating.CreatedAt.Format(time.RFC3339),
			ClientID:  rating.ClientID,
			OwnerID:   rating.OwnerID,
		},
	})
}

// DeleteRating deletes a rating
func DeleteRating(c *fiber.Ctx) error {
	id := c.Params("id")
	ratingID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid rating ID",
		})
	}

	// Find rating
	var rating models.Rating
	if err := Global.DB.First(&rating, "id = ?", ratingID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Rating not found",
		})
	}

	// Delete rating
	if err := Global.DB.Delete(&rating).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete rating",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Rating deleted successfully",
	})
}
