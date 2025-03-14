package CRUD

import (
	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/Util"
	"github.com/AramisAra/BravusBackend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CreateService creates a new service for a user
func CreateService(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No ID Provided"})
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	input := Struct.ServiceRequestHandler{}
	err = c.BodyParser(&input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to Parse Body"})
	}

	// Validate required fields
	if input.ServiceName == "" || input.ServiceDesc == "" || input.Price <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Required fields are missing"})
	}

	db := c.Locals("db").(*gorm.DB)

	// Check if user exists
	var user models.User
	if err := db.First(&user, "id = ?", parsedID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	service := models.Service{
		ServiceName: input.ServiceName,
		ServiceDesc: input.ServiceDesc,
		Price:       input.Price,
		UserID:      parsedID,
	}

	if err := db.Create(&service).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create service"})
	}

	response, err := Util.Serializer(service)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to serialize service"})
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

// GetService retrieves a service based on the provided ID
func GetService(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	err := Util.ValidateUUIDs(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	db := c.Locals("db").(*gorm.DB)
	service := models.Service{}

	if err := db.Preload("User").First(&service, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Service not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to retrieve service"})
	}

	response, err := Util.Serializer(service)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to serialize service"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// UpdateService updates an existing service
func UpdateService(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	err := Util.ValidateUUIDs(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	db := c.Locals("db").(*gorm.DB)
	service := models.Service{}

	if err := db.First(&service, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Service not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to retrieve service"})
	}

	input := Struct.ServiceUpdater{}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse request body"})
	}

	// Update fields if provided
	if input.ServiceName != "" {
		service.ServiceName = input.ServiceName
	}
	if input.ServiceDesc != "" {
		service.ServiceDesc = input.ServiceDesc
	}
	if input.Price > 0 {
		service.Price = input.Price
	}

	if err := db.Save(&service).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update service"})
	}

	response, err := Util.Serializer(service)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to serialize service"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// DeleteService deletes an existing service
func DeleteService(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	err := Util.ValidateUUIDs(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	db := c.Locals("db").(*gorm.DB)
	service := models.Service{}

	if err := db.First(&service, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Service not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to retrieve service"})
	}

	if err := db.Delete(&service).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete service"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Service deleted successfully"})
}
