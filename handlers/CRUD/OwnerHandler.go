package CRUD

import (
	"time"

	"os"

	"strings"

	"github.com/AramisAra/BravusBackend/Global"
	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// CreateOwner creates a new owner
func CreateOwner(c *fiber.Ctx) error {
	// Parse input
	input := new(Struct.OwnerInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input data",
		})
	}

	// Simple validation
	if input.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Name is required",
		})
	}
	if input.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email is required",
		})
	}
	if input.Phone == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Phone is required",
		})
	}
	if input.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Password is required",
		})
	}
	if input.Location == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Location is required",
		})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	// Create owner
	owner := models.Owner{
		Name:     input.Name,
		Email:    input.Email,
		Phone:    input.Phone,
		Password: string(hashedPassword),
		Location: input.Location,
		Bio:      input.Bio,
		Career:   input.Career,
	}

	// Save to database
	if err := Global.DB.Create(&owner).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create owner",
		})
	}

	// Create JWT token
	secretKey := os.Getenv("JWT_SECRET")

	// Set token expiration (24 hours)
	expirationTime := time.Now().Add(24 * time.Hour)

	// Create the JWT claims
	claims := jwt.MapClaims{
		"user_id": owner.ID.String(),
		"email":   owner.Email,
		"owner":   true, // Indicates this is an owner, not a client
		"exp":     expirationTime.Unix(),
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate encoded token
	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not generate token",
		})
	}

	// Return success response with token and owner info
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Owner created successfully",
		"id":      owner.ID,
		"name":    owner.Name,
		"email":   owner.Email,
		"phone":   owner.Phone,
		"token":   tokenString,
	})
}

// GetOwners retrieves all owners
func GetOwners(c *fiber.Ctx) error {
	var owners []models.Owner

	// Get all owners from database
	if err := Global.DB.Find(&owners).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch owners",
		})
	}

	// Serialize owners
	serializedOwners := make([]Struct.OwnerSerializer, len(owners))
	for i, owner := range owners {
		serializedOwners[i] = Struct.OwnerSerializer{
			ID:       owner.ID,
			Name:     owner.Name,
			Email:    owner.Email,
			Phone:    owner.Phone,
			Location: owner.Location,
			Bio:      owner.Bio,
			Career:   owner.Career,
		}
	}

	// Return the serialized owners directly as an array
	return c.Status(fiber.StatusOK).JSON(serializedOwners)
}

// GetOwnerByID retrieves an owner by ID
func GetOwnerByID(c *fiber.Ctx) error {
	id := c.Params("id")
	ownerID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid owner ID",
		})
	}

	// Find owner with relationships
	var owner models.Owner
	if err := Global.DB.Preload("Services").Preload("Reviews").Preload("Ratings").First(&owner, "id = ?", ownerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Owner not found",
		})
	}

	// Serialize services
	serviceSerializers := make([]Struct.ServiceSerializer, len(owner.Services))
	for i, service := range owner.Services {
		serviceSerializers[i] = Struct.ServiceSerializer{
			ID:          service.ID,
			ServiceName: service.ServiceName,
			ServiceDesc: service.ServiceDesc,
			Price:       service.Price,
			Duration:    service.Duration,
			OwnerID:     service.OwnerID,
		}
	}

	// Serialize reviews
	reviewSerializers := make([]Struct.ReviewSerializer, len(owner.Reviews))
	for i, review := range owner.Reviews {
		// Get client data for each review
		var client models.Client
		Global.DB.First(&client, "id = ?", review.ClientID)

		reviewSerializers[i] = Struct.ReviewSerializer{
			ID:        review.ID,
			Content:   review.Content,
			CreatedAt: review.CreatedAt.Format(time.RFC3339),
			ClientID:  review.ClientID,
			OwnerID:   review.OwnerID,
			Client: Struct.ClientSerializer{
				ID:    client.ID,
				Name:  client.Name,
				Email: client.Email,
				Phone: client.Phone,
			},
		}
	}

	// Calculate average rating
	var averageRating float64
	if len(owner.Ratings) > 0 {
		var totalRating float64
		for _, rating := range owner.Ratings {
			totalRating += rating.Score
		}
		averageRating = totalRating / float64(len(owner.Ratings))
	}

	// Serialize ratings
	ratingSerializers := make([]Struct.RatingSerializer, len(owner.Ratings))
	for i, rating := range owner.Ratings {
		// Get client data for each rating
		var client models.Client
		Global.DB.First(&client, "id = ?", rating.ClientID)

		ratingSerializers[i] = Struct.RatingSerializer{
			ID:        rating.ID,
			Score:     rating.Score,
			CreatedAt: rating.CreatedAt.Format(time.RFC3339),
			ClientID:  rating.ClientID,
			OwnerID:   rating.OwnerID,
			Client: Struct.ClientSerializer{
				ID:    client.ID,
				Name:  client.Name,
				Email: client.Email,
				Phone: client.Phone,
			},
		}
	}

	// Serialize owner with relationships
	serializedOwner := Struct.OwnerSerializer{
		ID:            owner.ID,
		Name:          owner.Name,
		Email:         owner.Email,
		Phone:         owner.Phone,
		Location:      owner.Location,
		Bio:           owner.Bio,
		Career:        owner.Career,
		Services:      serviceSerializers,
		Reviews:       reviewSerializers,
		Ratings:       ratingSerializers,
		AverageRating: averageRating,
	}

	// Return the serialized owner directly
	return c.Status(fiber.StatusOK).JSON(serializedOwner)
}

// UpdateOwner updates an owner
func UpdateOwner(c *fiber.Ctx) error {
	id := c.Params("id")
	ownerID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid owner ID",
		})
	}

	// Parse input
	input := new(Struct.OwnerInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input data",
		})
	}

	// Find owner
	var owner models.Owner
	if err := Global.DB.First(&owner, "id = ?", ownerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Owner not found",
		})
	}

	// Hash password if provided
	if input.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to hash password",
			})
		}
		owner.Password = string(hashedPassword)
	}

	// Update other fields only if they are provided
	if input.Name != "" {
		owner.Name = input.Name
	}

	if input.Email != "" {
		owner.Email = input.Email
	}

	if input.Phone != "" {
		owner.Phone = input.Phone
	}

	if input.Location != "" {
		owner.Location = input.Location
	}

	// Bio can be empty, but we'll only update it if it's explicitly provided in the input
	if input.Bio != "" || strings.Contains(string(c.Body()), "bio") {
		owner.Bio = input.Bio
	}

	if input.Career != "" {
		owner.Career = input.Career
	}

	// Save changes
	if err := Global.DB.Save(&owner).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update owner",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Owner updated successfully",
		"owner": Struct.OwnerSerializer{
			ID:       owner.ID,
			Name:     owner.Name,
			Email:    owner.Email,
			Phone:    owner.Phone,
			Location: owner.Location,
			Bio:      owner.Bio,
			Career:   owner.Career,
		},
	})
}

// DeleteOwner deletes an owner
func DeleteOwner(c *fiber.Ctx) error {
	id := c.Params("id")
	ownerID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid owner ID",
		})
	}

	// Find owner
	var owner models.Owner
	if err := Global.DB.First(&owner, "id = ?", ownerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Owner not found",
		})
	}

	// Delete owner
	if err := Global.DB.Delete(&owner).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete owner",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Owner deleted successfully",
	})
}

// LoginOwner handles owner login and JWT token generation
func LoginOwner(c *fiber.Ctx) error {
	// Parse input
	input := new(Struct.LoginRequestHandler)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input data",
		})
	}

	// Simple validation
	if input.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email is required",
		})
	}
	if input.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Password is required",
		})
	}

	// Find owner by email
	var owner models.Owner
	if err := Global.DB.Where("email = ?", input.Email).First(&owner).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email or password",
		})
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(owner.Password), []byte(input.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email or password",
		})
	}

	// Create JWT token
	secretKey := os.Getenv("JWT_SECRET")

	// Set token expiration (24 hours)
	expirationTime := time.Now().Add(24 * time.Hour)

	// Create the JWT claims
	claims := jwt.MapClaims{
		"user_id": owner.ID.String(),
		"email":   owner.Email,
		"owner":   true, // Indicates this is an owner, not a client
		"exp":     expirationTime.Unix(),
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate encoded token
	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not generate token",
		})
	}

	// Return success response with token and owner info
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"id":     owner.ID,
		"name":   owner.Name,
		"email":  owner.Email,
		"phone":  owner.Phone,
		"career": owner.Career,
		"token":  tokenString,
	})
}

// GetOwnerAppointments retrieves all appointments for a specific owner
func GetOwnerAppointments(c *fiber.Ctx) error {
	id := c.Params("id")
	ownerID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid owner ID",
		})
	}

	// Find owner first to verify existence
	var owner models.Owner
	if err := Global.DB.First(&owner, "id = ?", ownerID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Owner not found",
		})
	}

	// Find all appointments associated with this owner
	var appointments []models.Appointment
	if err := Global.DB.Joins("JOIN owner_appointments ON owner_appointments.appointment_id = appointments.id").
		Where("owner_appointments.owner_id = ?", ownerID).
		Preload("Clients").
		Preload("Services").
		Preload("Animals").
		Find(&appointments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch appointments",
		})
	}

	// Format the appointments for response
	formattedAppointments := make([]fiber.Map, len(appointments))
	for i, appointment := range appointments {
		// Format clients
		clients := make([]fiber.Map, len(appointment.Clients))
		for j, client := range appointment.Clients {
			clients[j] = fiber.Map{
				"id":    client.ID,
				"name":  client.Name,
				"email": client.Email,
				"phone": client.Phone,
			}
		}

		// Format services
		services := make([]fiber.Map, len(appointment.Services))
		for j, service := range appointment.Services {
			services[j] = fiber.Map{
				"id":           service.ID,
				"service_name": service.ServiceName,
				"service_desc": service.ServiceDesc,
				"price":        service.Price,
				"duration":     service.Duration,
			}
		}

		// Format animals
		animals := make([]fiber.Map, len(appointment.Animals))
		for j, animal := range appointment.Animals {
			animals[j] = fiber.Map{
				"id":          animal.ID,
				"animal_name": animal.AnimalName,
				"animal_race": animal.AnimalRace,
				"animal_age":  animal.AnimalAge,
				"species":     animal.Species,
			}
		}

		// Format appointment
		formattedAppointments[i] = fiber.Map{
			"id":        appointment.ID,
			"datetime":  appointment.DateTime.Format("01-02-2006 3:04PM"),
			"notes":     appointment.Notes,
			"clients":   clients,
			"services":  services,
			"animals":   animals,
			"createdAt": appointment.CreatedAt,
			"updatedAt": appointment.UpdatedAt,
		}
	}

	return c.Status(fiber.StatusOK).JSON(formattedAppointments)
}
