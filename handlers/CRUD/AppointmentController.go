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

	Sid, _ := uuid.Parse(id["Sid"])

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
	users := []models.User{}

	// Check if all users exist
	if err := db.Where("id IN (?)", []string{id["Oid"], id["Uid"]}).Find(&users).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "One or more users not found"})
	}

	// Check if service exists
	var service models.Service
	if err := db.First(&service, "id = ?", Sid).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Service not found"})
	}

	appointment := models.Appointment{
		Users:     users,
		DateTime:  dateTime,
		ServiceID: Sid,
	}

	if err := db.Create(&appointment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create appointment"})
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
	if err := db.Preload("Users").Preload("Service").First(&appointment, "id = ?", id).Error; err != nil {
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
	if err := db.Preload("Users").Preload("Service").First(&appointment, "id = ?", id).Error; err != nil {
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

		appointment.ServiceID = serviceID
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
