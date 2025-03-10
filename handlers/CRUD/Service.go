package CRUD

import (
	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/Util"
	"github.com/AramisAra/BravusBackend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

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

	db := c.Locals("db").(*gorm.DB)
	service := models.Service{
		ServiceName: input.ServiceName,
		ServiceDesc: input.ServiceDesc,
		Price:       input.Price,
		UserID:      parsedID,
	}

	Creator := db.Create(&service)
	if Creator.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to Create service"})
	}

	response, err := Util.Serializer(service)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to Serialize service"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// Getservice Retrieves an service based on the provided ID from the query parameters.
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

	searcher := db.Find(&service, "id = ?", id)
	if searcher.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "service Doesn't exist"})
	}

	response, err := Util.Serializer(service)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// Updateservice
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

	searcher := db.Find(&service, "id = ?", id)
	if searcher.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "service doesn't exist"})
	}

	Input := Struct.ServiceUpdater{}
	err = c.BodyParser(&Input)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Parsing the body"})
	}

	if Input.ServiceName != "" {
		service.ServiceName = Input.ServiceName
	}
	if Input.ServiceDesc != "" {
		service.ServiceDesc = Input.ServiceDesc
	}
	if Input.Price != 0 {
		service.Price = Input.Price
	}

	Saver := db.Save(&service)
	if Saver.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save updates"})
	}

	response, err := Util.Serializer(service)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the service"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

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

	deleter := db.Delete(&service, "id = ?", id)
	if deleter.Error != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "service Doesn't exist"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "service deleted successfully"})
}
