package CRUD

import (
	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/Util"
	"github.com/AramisAra/BravusBackend/models"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func CreateUser(c *fiber.Ctx) error {
	Input := Struct.RegisterRequestHandler{}
	err := c.BodyParser(&Input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed Parsing the body"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(Input.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Hashing the password"})
	}

	NewUser := models.User{
		FirstName: Input.FirstName,
		LastName:  Input.LastName,
		Phone:     Input.Phone,
		Email:     Input.Email,
		Password:  string(hashedPassword),
		Owner:     Input.Owner,
		Career:    Input.Career,
	}
	db := c.Locals("db").(*gorm.DB)

	CreateUser := db.Create(&NewUser)
	if CreateUser.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Creating the user"})
	}

	response, err := Util.Serializer(NewUser)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
	}
	return c.Status(fiber.StatusOK).JSON(response)

}
