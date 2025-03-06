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

func CreateAppointment(c *fiber.Ctx) error {
	id := c.Queries()
	if len(id) < 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No ID given"})
	}

	err := Util.ValidateUUIDs(id["Oid"], id["Uid"], id["Sid"])
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	Sid, _ := uuid.Parse(id["Sid"])

	Input := Struct.AppointmentRequestHandler{}
	err = c.BodyParser(&Input)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parsed input body"})
	}

	dataTime, err := time.Parse("01-02-2006 3:04PM", Input.DateTime)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parse datetime"})
	}

	ids := []string{id["Oid"], id["Uid"]}

	db := c.Locals("db").(*gorm.DB)
	users := []models.User{}

	Seacher := db.Where("id IN (?)", ids).Find(&users)
	if Seacher.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "One or more users don't exist"})
	}
	appointment := models.Appointment{
		Users:     users,
		DateTime:  dataTime,
		ServiceID: Sid,
	}

	Creator := db.Create(&appointment)
	if Creator.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to Create Appointment"})
	}

	response, err := Util.Serializer(appointment)
	if err != nil {
		c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to Serialize Appointment"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func UpdateAppointment(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	err := Util.ValidateUUIDs(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	db := c.Locals("db").(*gorm.DB)
	appointment := models.Appointment{}

	Seacher := db.Find(&appointment, "id = ?", id)
	if Seacher.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to find appointment"})
	}

	Input := Struct.AppointmentUpdater{}
	err = c.BodyParser(&Input)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parse input"})
	}

	dataTime, err := time.Parse("01-02-2006 3:04PM", Input.DateTime)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parse date and time"})
	}

	if Input.DateTime != "" {
		appointment.DateTime = dataTime
	}

	db.Save(&appointment)

	response, err := Util.Serializer(appointment)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to Serialize"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// DeleteUser deletes a user based on a provided query parameter 'id' and returns a status message in JSON format.
func DeleteAppointment(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is required"})
	}
	err := Util.ValidateUUIDs(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is invalid"})
	}

	db := c.Locals("db").(*gorm.DB)
	appointment := models.Appointment{}

	deleter := db.Delete(&appointment, "id = ?", id)
	if deleter.Error != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Appointment doesn't exist"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Appointment deleted successfully"})
}
