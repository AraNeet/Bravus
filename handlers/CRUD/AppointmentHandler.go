package CRUD

import (
	"time"

	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/Util"
	"github.com/AramisAra/BravusBackend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CreateAppointment creates a new appointment
func CreateAppointment(c *fiber.Ctx) error {
	id := c.Queries()
	if len(id) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No IDs provided"})
	}

	err := Util.ValidateUUIDs(id["Oid"], id["Uid"], id["Sid"])
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	clientID, _ := uuid.Parse(id["Uid"])
	ownerID, _ := uuid.Parse(id["Oid"])
	serviceID, _ := uuid.Parse(id["Sid"])

	input := Struct.AppointmentRequestHandler{}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse request body"})
	}

	// Validate required fields
	if input.DateTime == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "DateTime is required"})
	}

	// Parse and validate datetime
	dateTime, err := time.Parse("01-02-2006 3:04PM", input.DateTime)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid datetime format"})
	}

	// Validate that the datetime is in the future
	if dateTime.Before(time.Now()) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Appointment datetime must be in the future"})
	}

	db := c.Locals("db").(*gorm.DB)

	// Check if client exists
	var client models.Client
	if err := db.First(&client, "id = ?", clientID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Client not found"})
	}

	// Check if owner exists
	var owner models.Owner
	if err := db.First(&owner, "id = ?", ownerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Owner not found"})
	}

	// Check if service exists
	var service models.Service
	if err := db.First(&service, "id = ?", serviceID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Service not found"})
	}

	// Create appointment
	appointment := models.Appointment{
		DateTime: dateTime,
		Notes:    input.Notes,
	}

	// Save the appointment first
	if err := db.Create(&appointment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create appointment"})
	}

	// Associate client, owner and service with the appointment
	if err := db.Model(&appointment).Association("Clients").Append(&client); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to associate client with appointment"})
	}

	if err := db.Model(&appointment).Association("Owners").Append(&owner); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to associate owner with appointment"})
	}

	if err := db.Model(&appointment).Association("Services").Append(&service); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to associate service with appointment"})
	}

	// Associate animals if provided
	if len(input.AnimalIDs) > 0 {
		for _, animalIDStr := range input.AnimalIDs {
			animalID, err := uuid.Parse(animalIDStr)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid animal ID format"})
			}

			var animal models.Animal
			if err := db.First(&animal, "id = ?", animalID).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Animal not found: " + animalIDStr})
				}
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to retrieve animal"})
			}

			if err := db.Model(&appointment).Association("Animals").Append(&animal); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to associate animal with appointment"})
			}
		}
	}

	// Reload the appointment with all associations
	if err := db.Preload("Clients").Preload("Owners").Preload("Services").Preload("Animals").First(&appointment, appointment.ID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to reload appointment"})
	}

	response, err := Util.Serializer(appointment)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to serialize appointment"})
	}

	return c.Status(fiber.StatusCreated).JSON(response)
}

// GetAppointment retrieves an appointment by ID
func GetAppointment(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Appointment ID is required"})
	}

	err := Util.ValidateUUIDs(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid appointment ID"})
	}

	db := c.Locals("db").(*gorm.DB)
	appointment := models.Appointment{}

	// Load appointment with related data
	if err := db.Preload("Clients").Preload("Owners").Preload("Services").Preload("Animals").First(&appointment, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Appointment not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to retrieve appointment"})
	}

	response, err := Util.Serializer(appointment)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to serialize appointment"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// UpdateAppointment updates an existing appointment
func UpdateAppointment(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Appointment ID is required"})
	}

	err := Util.ValidateUUIDs(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid appointment ID"})
	}

	db := c.Locals("db").(*gorm.DB)
	appointment := models.Appointment{}

	// Load appointment with related data
	if err := db.Preload("Clients").Preload("Owners").Preload("Services").Preload("Animals").First(&appointment, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Appointment not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to retrieve appointment"})
	}

	input := Struct.AppointmentUpdater{}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse request body"})
	}

	// Update datetime if provided
	if input.DateTime != "" {
		dateTime, err := time.Parse("01-02-2006 3:04PM", input.DateTime)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid datetime format"})
		}

		// Validate that the datetime is in the future
		if dateTime.Before(time.Now()) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Appointment datetime must be in the future"})
		}

		appointment.DateTime = dateTime
	}

	// Update service if provided
	if input.Service != "" {
		// Validate service ID
		serviceID, err := uuid.Parse(input.Service)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid service ID"})
		}

		// Check if service exists
		var service models.Service
		if err := db.First(&service, "id = ?", serviceID).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Service not found"})
		}

		// Replace existing service association with the new one
		if err := db.Model(&appointment).Association("Services").Clear(); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to clear service association"})
		}

		if err := db.Model(&appointment).Association("Services").Append(&service); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to associate service with appointment"})
		}
	}

	// Update animals if provided
	if len(input.AnimalIDs) > 0 {
		// Clear existing animal associations
		if err := db.Model(&appointment).Association("Animals").Clear(); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to clear animal associations"})
		}

		// Add new animal associations
		for _, animalIDStr := range input.AnimalIDs {
			animalID, err := uuid.Parse(animalIDStr)
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid animal ID format"})
			}

			var animal models.Animal
			if err := db.First(&animal, "id = ?", animalID).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Animal not found: " + animalIDStr})
				}
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to retrieve animal"})
			}

			if err := db.Model(&appointment).Association("Animals").Append(&animal); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to associate animal with appointment"})
			}
		}
	}

	if err := db.Save(&appointment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update appointment"})
	}

	response, err := Util.Serializer(appointment)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to serialize appointment"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// DeleteAppointment deletes an existing appointment
func DeleteAppointment(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Appointment ID is required"})
	}

	err := Util.ValidateUUIDs(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid appointment ID"})
	}

	db := c.Locals("db").(*gorm.DB)
	appointment := models.Appointment{}

	// Check if appointment exists
	if err := db.First(&appointment, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Appointment not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to retrieve appointment"})
	}

	if err := db.Delete(&appointment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete appointment"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Appointment deleted successfully"})
}
