package Struct

import (
	"github.com/google/uuid"
)

// RegisterUserSerializer
/*
Struct return would register a new user
*/
type AuthUserSerializer struct {
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"firstname"`
	LastName  string    `json:"lastname"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Owner     bool      `json:"owner"`
	Career    string    `json:"career"`
	Token     string    `json:"token"`
}

// Owners Serializer return all needed information for owners
type OwnersSerializer struct {
	ID        uuid.UUID `json:"id"`
	FirstName string    `json:"firstname"`
	LastName  string    `json:"lastname"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Owner     bool      `json:"owner"`
	Career    string    `json:"career"`

	Appointments []AppointmentSerializer `json:"appointments"`
	Services     []ServiceSerializer     `json:"services"`
}

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

	Animals      []AnimalSerializer      `json:"animals"`
	Appointments []AppointmentSerializer `json:"appointments"`
	Services     []ServiceSerializer     `json:"services"`
}

// ServiceSerializer
/*
Struct take information from the database and cuts out data
*/
type ServiceSerializer struct {
	ID          uuid.UUID `json:"id"`
	ServiceName string    `json:"service-name"`
	ServiceDesc string    `json:"service-desc"`
	Price       float64   `json:"price"`
}

// AnimalSerializer
/*
Struct take information from the database and cuts out data
*/
type AnimalSerializer struct {
	ID         uuid.UUID `json:"id"`
	AnimalName string    `json:"animal-name"`
	AnimalRace string    `json:"animal-race"`
	AnimalAge  uint      `json:"animal-age"`
	Species    string    `json:"species"`
	Metadata   string    `json:"metadata"`
	OwnerID    uuid.UUID `json:"owner-id"`
	CreatedAt  string    `json:"created_at"`
	UpdatedAt  string    `json:"updated_at"`
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
	ID       uuid.UUID                   `json:"id"`
	Users    []UserAppointmentSerializer `json:"Users"`
	Service  uuid.UUID                   `json:"service"`
	DateTime string                      `json:"datetime"`
}
