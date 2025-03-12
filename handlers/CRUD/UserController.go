package CRUD

import (
	"os"
	"strings"
	"time"

	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/Util"
	"github.com/AramisAra/BravusBackend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4" // or your JWT library
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// CreateUser is the endpoint that manages the creation of new user.
func CreateUser(c *fiber.Ctx) error {
	Input := Struct.RegisterRequestHandler{}
	err := c.BodyParser(&Input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed parsing the body"})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(Input.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed hashing the password"})
	}

	// Create new user
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
		// Check if it's a duplicate email error
		if strings.Contains(createUser.Error.Error(), "duplicate") || strings.Contains(createUser.Error.Error(), "Duplicate") {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Email already in use"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed creating the user"})
	}

	// Generate JWT token
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["user_id"] = NewUser.ID
	claims["email"] = NewUser.Email
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix() // Token expires in 72 hours

	// Sign the token with your secret key
	secretKey := os.Getenv("JWT_SECRET")

	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	// Use the modified serializer with token
	response, err := Util.Serializer(NewUser, tokenString)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed serializing the user"})
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

	// Generate JWT token
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["user_id"] = user.ID
	claims["email"] = user.Email
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix() // Token expires in 72 hours

	// Sign the token with your secret key
	secretKey := os.Getenv("JWT_SECRET")

	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	response, err := Util.Serializer(user, tokenString)
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
	if err := Util.ValidateUUIDs(id); err != nil {
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
func GetUserWithEvery(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is required"})
	}

	if err := Util.ValidateUUIDs(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is invalid"})
	}

	db := c.Locals("db").(*gorm.DB)
	db = db.Debug()
	user := models.User{}
	Seacher := db.Preload("Animals").Preload("Appointments").Preload("Appointments.Users").Find(&user, "id = ?", id)
	if Seacher.Error != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User doesn't have any animals"})
	}

	response, err := Util.Serializer(user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
	}

	return c.Status(fiber.StatusOK).JSON(response)
}

// // GetUserWithAppointment retrieves a user along with their appointments based on the provided user ID from the query parameters.
// func GetUserWithAppointment(c *fiber.Ctx) error {
// 	id := c.Query("id")
// 	if id == "" {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is required"})
// 	}
// 	err := Util.ValidateUUIDs(id)
// 	if err != nil {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is invalid"})
// 	}

// 	db := c.Locals("db").(*gorm.DB)
// 	user := models.User{}

// 	db.Preload("Appointments").Find(&user, "id = ?", id)
// 	if user.Appointments == nil {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User doesn't have any appointments"})
// 	}

// 	response, err := Util.Serializer(user)
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
// 	}

// 	return c.Status(fiber.StatusOK).JSON(response)
// }

// GetUserWithService retrieves a user and their associated services from the database based on the user ID provided in the query params.
func GetUserWithService(c *fiber.Ctx) error {
	id := c.Query("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is required"})
	}
	err := Util.ValidateUUIDs(id)
	if err != nil {
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
	err := Util.ValidateUUIDs(id)
	if err != nil {
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

	var response []Struct.OwnersSerializer

	for _, user := range users {
		serializedUser, err := Util.Serializer(user)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed Serializing the user"})
		}
		smtUser := serializedUser.(Struct.OwnersSerializer)
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
	err := Util.ValidateUUIDs(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is invalid"})
	}

	db := c.Locals("db").(*gorm.DB)
	user := models.User{}

	searcher := db.Find(&user, "id = ?", id)
	if searcher.Error != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "User doesn't exist"})
	}

	Input := Struct.UserUpdater{}
	err = c.BodyParser(&Input)
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
	err := Util.ValidateUUIDs(id)
	if err != nil {
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
