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

func LoginUser(c *fiber.Ctx) error {
	Input := Struct.LoginRequestHandler{}

	err := c.BodyParser(&Input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed Parsing the body"})
	}

	db := c.Locals("db").(*gorm.DB)
	user := models.User{}

	searcher := db.Find(&user, "email = ?", Input.Email)
	if searcher.Error != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Email or Password is invalid"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(Input.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Email or Password is invalid"})
	}

	response, err := Util.Serializer(user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
	}
	return c.Status(fiber.StatusOK).JSON(response)
}

func GetUser(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is required"})
	}
	if !Util.IsValidUUID(id) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is invalid"})
	}

	db := c.Locals("db").(*gorm.DB)
	user := models.User{}
	searcher := db.Find(&user, "id = ?", id)
	if searcher.Error != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User doesn't exist"})
	}

	response, err := Util.Serializer(user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func GetUserWithAnimal(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is required"})
	}
	if !Util.IsValidUUID(id) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is invalid"})
	}

	db := c.Locals("db").(*gorm.DB)
	user := models.User{}
	db.Preload("Animals").Find(&user, "id = ?", id)
	if user.Animals == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User doesn't have any animals"})
	}

	response, err := Util.Serializer(user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func GetUserWithAppointment(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is required"})
	}
	if !Util.IsValidUUID(id) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is invalid"})
	}

	db := c.Locals("db").(*gorm.DB)
	user := models.User{}

	db.Preload("Appointments").Find(&user, "id = ?", id)
	if user.Appointments == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User doesn't have any appointments"})
	}

	response, err := Util.Serializer(user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func GetUserWithService(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is required"})
	}
	if !Util.IsValidUUID(id) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is invalid"})
	}

	db := c.Locals("db").(*gorm.DB)
	user := models.User{}

	db.Preload("Services").Find(&user, "id = ?", id)
	if user.Services == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User doesn't have any services"})
	}

	response, err := Util.Serializer(user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func GetBusinessUserInfo(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is required"})
	}
	if !Util.IsValidUUID(id) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is invalid"})
	}

	db := c.Locals("db").(*gorm.DB)
	user := models.User{}
	db.Preload("Services").Preload("Appointments").Find(&user, "id = ?", id)
	if user.Services == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User doesn't have any services"})
	}
	if user.Appointments == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User doesn't have any appointments"})
	}

	response, err := Util.Serializer(user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func ListUser(c *fiber.Ctx) error {
	db := c.Locals("db").(*gorm.DB)
	var users []models.User

	searcher := db.Find(&users, "where owner = true")
	if searcher.Error != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to get users"})
	}

	response, err := Util.Serializer(users)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the users"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func UpdateUser(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is required"})
	}
	if !Util.IsValidUUID(id) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is invalid"})
	}

	db := c.Locals("db").(*gorm.DB)
	user := models.User{}

	searcher := db.Find(&user, "where id = ?", id)
	if searcher.Error != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User doesn't exist"})
	}

	Input := Struct.UserUpdater{}
	err := c.BodyParser(&Input)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Parsing the body"})
	}

	if Input.FirstName != "" {
		user.FirstName = Input.FirstName
	}
	if Input.LastName != "" {
		user.LastName = Input.LastName
	}
	if Input.Phone != "" {
		user.Phone = Input.Phone
	}
	if Input.Career != "" {
		user.Career = Input.Career
	}

	db.Save(&user)

	response, err := Util.Serializer(user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

func DeleteUser(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is required"})
	}
	if !Util.IsValidUUID(id) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is invalid"})
	}

	db := c.Locals("db").(*gorm.DB)
	user := models.User{}

	deleter := db.Delete(&user, "id = ?", id)
	if deleter.Error != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User doesn't exist"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "User deleted successfully"})
}
