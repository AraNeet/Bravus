package Struct

import (
	"github.com/AramisAra/BravusBackend/models"
	"github.com/google/uuid"
)

// UserSerializer
/*
Struct take information from the database and cuts out Data
*/
type UserSerializer struct {
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Owner     bool   `json:"owner"`
	Career    string `json:"career"`

	Animals      []models.Animal      `json:"animals"`
	Appointments []models.Appointment `json:"appointments"`
	Services     []models.Service     `json:"services"`
}

// ServiceSerializer
/*
Struct take information from the database and cuts out data
*/
type ServiceSerializer struct {
	NameService string  `json:"name-service"`
	ServiceDesc string  `json:"service-desc"`
	Price       float64 `json:"price"`
}

// AnimalSerializer
/*
Struct take information from the database and cuts out data
*/
type AnimalSerializer struct {
	AnimalName   string `json:"animal-name"`
	AnimalSpecie string `json:"animal-specie"`
	AnimalAge    uint   `json:"animal-age"`
}

// AppointmentSerializer
/*
Struct take information from the database and cuts out data
*/
type AppointmentSerializer struct {
	ClientID uuid.UUID `json:"client-id"`
	OwnerID  uuid.UUID `json:"owner-id"`
	Service  string    `json:"service"`
	Date     string    `json:"date"`
	Time     string    `json:"time"`
}
