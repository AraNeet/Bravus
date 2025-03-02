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
