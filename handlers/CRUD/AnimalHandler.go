package CRUD

import (
	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/Util"
	"github.com/AramisAra/BravusBackend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CreateAnimal creates a new animal for a user
func CreateAnimal(c *fiber.Ctx) error {
	// Get user ID from query params
	ownerID := c.Query("id")
	if ownerID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Owner ID is required",
		})
	}

	// Parse and validate UUID
	parsedOwnerID, err := uuid.Parse(ownerID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid owner ID format",
		})
	}

	// Parse request body
	input := Struct.AnimalRequestHandler{}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate input
	if input.AnimalName == "" || input.AnimalRace == "" || input.AnimalAge == 0 || input.Species == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Required fields are missing",
		})
	}

	db := c.Locals("db").(*gorm.DB)

	// Check if owner exists
	var client models.Client
	if err := db.First(&client, "id = ?", parsedOwnerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Client not found",
		})
	}

	// Create animal
	animal := models.Animal{
		AnimalName: input.AnimalName,
		AnimalRace: input.AnimalRace,
		AnimalAge:  input.AnimalAge,
		Species:    input.Species,
		Metadata:   input.Metadata,
		ClientID:   parsedOwnerID,
	}

	if err := db.Create(&animal).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create animal",
		})
	}

	// Serialize response
	response, err := Util.Serializer(animal)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to serialize response",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

// GetAnimal retrieves an animal by ID
func GetAnimal(c *fiber.Ctx) error {
	animalID := c.Query("id")
	if animalID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Animal ID is required",
		})
	}

	if err := Util.ValidateUUIDs(animalID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid animal ID format",
		})
	}

	db := c.Locals("db").(*gorm.DB)
	var animal models.Animal

	if err := db.Preload("Client").First(&animal, "id = ?", animalID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Animal not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve animal",
		})
	}

	response, err := Util.Serializer(animal)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to serialize response",
		})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// UpdateAnimal updates an existing animal
func UpdateAnimal(c *fiber.Ctx) error {
	animalID := c.Query("id")
	if animalID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Animal ID is required",
		})
	}

	if err := Util.ValidateUUIDs(animalID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid animal ID format",
		})
	}

	db := c.Locals("db").(*gorm.DB)
	var animal models.Animal

	if err := db.First(&animal, "id = ?", animalID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Animal not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve animal",
		})
	}

	input := Struct.AnimalUpdater{}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Update fields if provided
	if input.AnimalName != "" {
		animal.AnimalName = input.AnimalName
	}
	if input.AnimalRace != "" {
		animal.AnimalRace = input.AnimalRace
	}
	if input.AnimalAge != 0 {
		animal.AnimalAge = input.AnimalAge
	}
	if input.Species != "" {
		animal.Species = input.Species
	}
	if input.Metadata != "" {
		animal.Metadata = input.Metadata
	}

	if err := db.Save(&animal).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update animal",
		})
	}

	response, err := Util.Serializer(animal)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to serialize response",
		})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// DeleteAnimal deletes an animal
func DeleteAnimal(c *fiber.Ctx) error {
	animalID := c.Query("id")
	if animalID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Animal ID is required",
		})
	}

	if err := Util.ValidateUUIDs(animalID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid animal ID format",
		})
	}

	db := c.Locals("db").(*gorm.DB)
	var animal models.Animal

	if err := db.First(&animal, "id = ?", animalID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Animal not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve animal",
		})
	}

	if err := db.Delete(&animal).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete animal",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Animal deleted successfully",
	})
}
