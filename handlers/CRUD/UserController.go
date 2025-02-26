package CRUD

import (
	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/Util"
	"github.com/AramisAra/BravusBackend/models"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// CreateUser is the endpoint that manages the creation of new user.
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

	createUser := db.Create(&NewUser)
	if createUser.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Creating the user"})
	}

	response, err := Util.Serializer(NewUser)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
	}
	return c.Status(fiber.StatusOK).JSON(response)
}

// LoginUser is the endpoint that manages the auth of the user. It checks if login info is correct then creates the JWT
// TODO: Main thing is setting up the JWT Creation and Management.
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

// GetUser retrieves user information based on a provided query parameter 'id' and returns a JSON response.
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

// GetUserWithAnimal fetches a user by a given id from the query parameter, including the user's associated animals.
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

// GetUserWithAppointment retrieves a user along with their appointments based on the provided user ID from the query parameters.
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

// GetUserWithService retrieves a user and their associated services from the database based on the user ID provided in the query params.
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

// GetBusinessUserInfo retrieves business user information based on the provided user ID query parameter.
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

// ListAllBusiness retrieves and returns a list of users who are marked as owners from the database.
func ListAllBusiness(c *fiber.Ctx) error {
	db := c.Locals("db").(*gorm.DB)
	var users []models.User

	db.Preload("Services").Find(&users, "owner = true")
	if err := db.Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Fetching the users"})
	}

	var response []Struct.UserSerializer

	for _, user := range users {
		serializedUser, err := Util.Serializer(user)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
		}
		smtUser := serializedUser.(Struct.UserSerializer)
		response = append(response, smtUser)
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// UpdateUser updates an existing user's details based on the provided user ID and information.
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

// DeleteUser deletes a user based on a provided query parameter 'id' and returns a status message in JSON format.
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
