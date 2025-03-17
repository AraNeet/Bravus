package CRUD

import (
	"fmt"

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
		fmt.Println("Error parsing request body:", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to Parse Body", "details": err.Error()})
	}

	// Log received data for debugging
	fmt.Printf("Received service data: Name='%s', Desc='%s', Price=%.2f, Duration=%d\n",
		input.ServiceName, input.ServiceDesc, input.Price, input.Duration)

	// Validate required fields
	if input.ServiceName == "" || input.ServiceDesc == "" || input.Price <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Required fields are missing"})
	}

	// Set default duration to 60 minutes if not provided
	if input.Duration <= 0 {
		input.Duration = 60
		fmt.Println("Using default duration: 60 minutes")
	}

	db := c.Locals("db").(*gorm.DB)

	// Check if user exists
	var owner models.Owner
	if err := db.First(&owner, "id = ?", parsedID).Error; err != nil {
		fmt.Println("Owner not found:", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   "Owner not found",
			"details": err.Error(),
		})
	}

	// Create service with all required fields
	service := models.Service{
		ServiceName: input.ServiceName,
		ServiceDesc: input.ServiceDesc,
		Price:       input.Price,
		Duration:    input.Duration,
		OwnerID:     parsedID,
	}

	if err := db.Create(&service).Error; err != nil {
		fmt.Println("Error creating service:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to create service",
			"message": err.Error(),
		})
	}

	fmt.Printf("Service created successfully: ID=%s\n", service.ID)
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

	if err := db.Preload("Owner").First(&service, "id = ?", id).Error; err != nil {
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
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve service",
			"details": err.Error(),
		})
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
	// Note: Duration remains unchanged during updates

	if err := db.Save(&service).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to update service",
			"details": err.Error(),
		})
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
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve service",
			"details": err.Error(),
		})
	}

	if err := db.Delete(&service).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to delete service",
			"details": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Service deleted successfully"})
}

// GetServicesByOwner retrieves all services for a specific owner
func GetServicesByOwner(c *fiber.Ctx) error {
	ownerID := c.Params("id")
	if ownerID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Owner ID is required"})
	}

	parsedOwnerID, err := uuid.Parse(ownerID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid owner ID format"})
	}

	db := c.Locals("db").(*gorm.DB)
	var services []models.Service

	if err := db.Where("owner_id = ?", parsedOwnerID).Find(&services).Error; err != nil {
		fmt.Println("Error fetching services for owner:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve services",
			"details": err.Error(),
		})
	}

	// If no services found, return empty array instead of error
	if len(services) == 0 {
		fmt.Printf("No services found for owner ID: %s\n", ownerID)
		return c.Status(fiber.StatusOK).JSON([]interface{}{})
	}

	// Serialize services
	serializedServices := make([]Struct.ServiceSerializer, len(services))
	for i, service := range services {
		serializedServices[i] = Struct.ServiceSerializer{
			ID:          service.ID,
			ServiceName: service.ServiceName,
			ServiceDesc: service.ServiceDesc,
			Price:       service.Price,
			Duration:    service.Duration,
			OwnerID:     service.OwnerID,
		}
	}

	fmt.Printf("Returning %d services for owner ID: %s\n", len(serializedServices), ownerID)
	return c.Status(fiber.StatusOK).JSON(serializedServices)
}
