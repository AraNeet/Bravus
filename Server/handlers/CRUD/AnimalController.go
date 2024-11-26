package CRUD

import (
	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/Util"
	"github.com/AramisAra/BravusBackend/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func CreateAnimal(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No ID Provided"})
	}
	if !Util.IsValidUUID(id) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	input := Struct.AnimalRequestHandler{}
	err := c.BodyParser(&input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to Parse Body"})
	}

	db := c.Locals("db").(*gorm.DB)
	animal := models.Animal{
		AnimalName:   input.AnimalName,
		AnimalSpecie: input.AnimalSpecie,
		AnimalAge:    input.AnimalAge,
		OwnerID:      id,
	}
	Creator := db.Create(&animal)
	if Creator.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to Create Animal"})
	}

	response, err := Util.Serializer(animal)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to Serialize Animal"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}
