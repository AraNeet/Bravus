package CRUD

import (
	"time"

	"os"

	"github.com/AramisAra/BravusBackend/Global"
	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// CreateClient creates a new client
func CreateClient(c *fiber.Ctx) error {
	// Parse input
	input := new(Struct.ClientInput)
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

	// Create client
	client := models.Client{
		Name:     input.Name,
		Email:    input.Email,
		Phone:    input.Phone,
		Password: string(hashedPassword),
		Location: input.Location,
	}

	// Save to database
	if err := Global.DB.Create(&client).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create client",
		})
	}

	// Create JWT token
	secretKey := os.Getenv("JWT_SECRET")

	// Set token expiration (24 hours)
	expirationTime := time.Now().Add(24 * time.Hour)

	// Create the JWT claims
	claims := jwt.MapClaims{
		"user_id": client.ID.String(),
		"email":   client.Email,
		"owner":   false, // Indicates this is a client, not an owner
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

	// Return success response with token and client info
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Client created successfully",
		"id":      client.ID,
		"name":    client.Name,
		"email":   client.Email,
		"phone":   client.Phone,
		"token":   tokenString,
	})
}

// GetClients retrieves all clients
func GetClients(c *fiber.Ctx) error {
	var clients []models.Client

	// Get all clients from database
	if err := Global.DB.Find(&clients).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch clients",
		})
	}

	// Serialize clients
	serializedClients := make([]Struct.ClientSerializer, len(clients))
	for i, client := range clients {
		serializedClients[i] = Struct.ClientSerializer{
			ID:       client.ID,
			Name:     client.Name,
			Email:    client.Email,
			Phone:    client.Phone,
			Location: client.Location,
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"clients": serializedClients,
	})
}

// GetClientByID retrieves a client by ID
func GetClientByID(c *fiber.Ctx) error {
	id := c.Params("id")
	clientID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid client ID",
		})
	}

	// Find client with all related data
	var client models.Client
	if err := Global.DB.Preload("Animals").Preload("Appointments.Services").Preload("Appointments.Owners").Preload("Appointments.Animals").First(&client, "id = ?", clientID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Client not found",
		})
	}

	// Serialize animals
	animalSerializers := make([]Struct.AnimalSerializer, len(client.Animals))
	for i, animal := range client.Animals {
		animalSerializers[i] = Struct.AnimalSerializer{
			ID:         animal.ID,
			AnimalName: animal.AnimalName,
			AnimalRace: animal.AnimalRace,
			AnimalAge:  animal.AnimalAge,
			Species:    animal.Species,
			Metadata:   animal.Metadata,
			ClientID:   animal.ClientID,
			CreatedAt:  animal.CreatedAt.Format(time.RFC3339),
			UpdatedAt:  animal.UpdatedAt.Format(time.RFC3339),
		}
	}

	// Serialize appointments
	appointmentSerializers := make([]Struct.AppointmentSerializer, len(client.Appointments))
	for i, appointment := range client.Appointments {
		// Serialize services for this appointment
		serviceSerializers := make([]Struct.ServiceSerializer, len(appointment.Services))
		for j, service := range appointment.Services {
			serviceSerializers[j] = Struct.ServiceSerializer{
				ID:          service.ID,
				ServiceName: service.ServiceName,
				ServiceDesc: service.ServiceDesc,
				Price:       service.Price,
				Duration:    service.Duration,
				OwnerID:     service.OwnerID,
			}
		}

		// Serialize owners for this appointment
		ownerSerializers := make([]Struct.OwnerAppointmentSerializer, len(appointment.Owners))
		for j, owner := range appointment.Owners {
			ownerSerializers[j] = Struct.OwnerAppointmentSerializer{
				ID:       owner.ID,
				Name:     owner.Name,
				Phone:    owner.Phone,
				Location: owner.Location,
			}
		}

		// Serialize animals for this appointment
		appointmentAnimalSerializers := make([]Struct.AnimalSerializer, len(appointment.Animals))
		for j, animal := range appointment.Animals {
			appointmentAnimalSerializers[j] = Struct.AnimalSerializer{
				ID:         animal.ID,
				AnimalName: animal.AnimalName,
				AnimalRace: animal.AnimalRace,
				AnimalAge:  animal.AnimalAge,
				Species:    animal.Species,
				ClientID:   animal.ClientID,
			}
		}

		// Create a ClientAppointmentSerializer for this client
		clientAppointmentSerializer := Struct.ClientAppointmentSerializer{
			ID:       client.ID,
			Name:     client.Name,
			Phone:    client.Phone,
			Location: client.Location,
		}

		// Create the AppointmentSerializer with all data
		appointmentSerializers[i] = Struct.AppointmentSerializer{
			ID:       appointment.ID,
			DateTime: appointment.DateTime.Format(time.RFC3339),
			Notes:    appointment.Notes,
			Services: serviceSerializers,
			Owners:   ownerSerializers,
			Clients:  []Struct.ClientAppointmentSerializer{clientAppointmentSerializer},
			Animals:  appointmentAnimalSerializers,
		}
	}

	// Serialize client with all relationships
	serializedClient := Struct.ClientSerializer{
		ID:           client.ID,
		Name:         client.Name,
		Email:        client.Email,
		Phone:        client.Phone,
		Location:     client.Location,
		Animals:      animalSerializers,
		Appointments: appointmentSerializers,
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"client": serializedClient,
	})
}

// UpdateClient updates a client
func UpdateClient(c *fiber.Ctx) error {
	id := c.Params("id")
	clientID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid client ID",
		})
	}

	// Parse input
	input := new(Struct.ClientInput)
	if err := c.BodyParser(input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid input data",
		})
	}

	// Find client
	var client models.Client
	if err := Global.DB.First(&client, "id = ?", clientID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Client not found",
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
		client.Password = string(hashedPassword)
	}

	// Update other fields only if they are provided
	if input.Name != "" {
		client.Name = input.Name
	}

	if input.Email != "" {
		client.Email = input.Email
	}

	if input.Phone != "" {
		client.Phone = input.Phone
	}

	if input.Location != "" {
		client.Location = input.Location
	}

	// Save changes
	if err := Global.DB.Save(&client).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update client",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Client updated successfully",
		"client": Struct.ClientSerializer{
			ID:       client.ID,
			Name:     client.Name,
			Email:    client.Email,
			Phone:    client.Phone,
			Location: client.Location,
		},
	})
}

// DeleteClient deletes a client
func DeleteClient(c *fiber.Ctx) error {
	id := c.Params("id")
	clientID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid client ID",
		})
	}

	// Find client
	var client models.Client
	if err := Global.DB.First(&client, "id = ?", clientID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Client not found",
		})
	}

	// Delete client
	if err := Global.DB.Delete(&client).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete client",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Client deleted successfully",
	})
}

// LoginClient handles client login and JWT token generation
func LoginClient(c *fiber.Ctx) error {
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

	// Find client by email
	var client models.Client
	if err := Global.DB.Where("email = ?", input.Email).First(&client).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email or password",
		})
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(client.Password), []byte(input.Password)); err != nil {
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
		"user_id": client.ID.String(),
		"email":   client.Email,
		"owner":   false, // Indicates this is a client, not an owner
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

	// Return success response with token and client info
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"id":    client.ID,
		"name":  client.Name,
		"email": client.Email,
		"phone": client.Phone,
		"token": tokenString,
	})
}
