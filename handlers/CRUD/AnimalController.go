package CRUD

import (
	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/Util"
	"github.com/AramisAra/BravusBackend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func CreateAnimal(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No ID Provided"})
	}

	// Convert string ID to UUID
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID format"})
	}

	input := Struct.AnimalRequestHandler{}
	err = c.BodyParser(&input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to Parse Body"})
	}

	db := c.Locals("db").(*gorm.DB)
	animal := models.Animal{
		AnimalName:   input.AnimalName,
		AnimalSpecie: input.AnimalSpecie,
		AnimalAge:    input.AnimalAge,
		OwnerID:      parsedID, // Use the parsed UUID here
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

// GetAnimal Retrieves an animal based on the provided ID from the query parameters.
func GetAnimal(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	if !Util.IsValidUUID(id) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	db := c.Locals("db").(*gorm.DB)
	animal := models.Animal{}
	searcher := db.Find(animal, "id = ?", id)
	if searcher.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Animal Doesn't exist"})
	}

	response, err := Util.Serializer(animal)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// UpdateAnimal
func UpdateAnimal(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID" })
	}

	if !Util.IsValidUUID(id) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	db := c.Locals("db").(*gorm.DB)
	animal := models.Animal{}

	searcher := db.Find(&animal, "where id = ?", id)
	if searcher.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "User doesn't exist"})
	}

	Input := Struct.AnimalUpdater{}
	err := c.BodyParser(&Input)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Parsing the body"})
	}

	if Input.AnimalAge != 0 {
		animal.AnimalAge = Input.AnimalAge
	}
	if Input.AnimalSpecie != "" {
		animal.AnimalSpecie = Input.AnimalSpecie
	}
	if Input.AnimalName != "" {
		animal.AnimalName = Input.AnimalName
	}

	Saver := db.Save(&animal)
	if Saver.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save updates"})
	}

	response, err := Util.Serializer(animal)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the animal"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func DeleteAnimal(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	if !Util.IsValidUUID(id) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	db := c.Locals("db").(*gorm.DB)
	animal := models.Animal{}

	deleter := db.Delete(&animal, "id = ?", id)
	if deleter.Error != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Animal Doesn't exist"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Animal deleted successfully"})
}