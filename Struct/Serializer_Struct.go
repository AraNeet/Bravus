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

	Animals      []models.Animal         `json:"animals"`
	Appointments []AppointmentSerializer `json:"appointments"`
	Services     []models.Service        `json:"services"`
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

// UserSerializer for appointments
/*
Struct take information from user and make it edit for the appointments.
*/
type UserAppointmentSerializer struct {
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
	Phone     string `json:"phone"`
	Career    string `json:"career"`
}

// AppointmentSerializer
/*
Struct take information from the database and cuts out data
*/
type AppointmentSerializer struct {
	ID       uuid.UUID                   `json:"ID"`
	Users    []UserAppointmentSerializer `json:"Users"`
	Service  uuid.UUID                   `json:"service"`
	DateTime string                      `json:"datetime"`
}
