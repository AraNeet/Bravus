package Struct

import (
	"github.com/google/uuid"
)

// RegisterUserSerializer
/*
Struct return would register a new user
*/
type AuthUserSerializer struct {
	ID     uuid.UUID `json:"id"`
	Name   string    `json:"name"`
	Email  string    `json:"email"`
	Phone  string    `json:"phone"`
	Owner  bool      `json:"owner"`
	Career string    `json:"career"`
	Token  string    `json:"token"`
}

// Owners Serializer return all needed information for owners
type OwnersSerializer struct {
	ID     uuid.UUID `json:"id"`
	Name   string    `json:"name"`
	Email  string    `json:"email"`
	Phone  string    `json:"phone"`
	Owner  bool      `json:"owner"`
	Career string    `json:"career"`

	Appointments []AppointmentSerializer `json:"appointments"`
	Services     []ServiceSerializer     `json:"services"`
}

// UserSerializer
/*
Struct take information from the database and cuts out Data
*/
type UserSerializer struct {
	Name   string `json:"name"`
	Email  string `json:"email"`
	Phone  string `json:"phone"`
	Owner  bool   `json:"owner"`
	Career string `json:"career"`

	Animals      []AnimalSerializer      `json:"animals"`
	Appointments []AppointmentSerializer `json:"appointments"`
	Services     []ServiceSerializer     `json:"services"`
}

// Auth Client Serializer
type AuthClientSerializer struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Email    string    `json:"email"`
	Phone    string    `json:"phone"`
	Location string    `json:"location"`
	Token    string    `json:"token"`
}

// Auth Owner Serializer
type AuthOwnerSerializer struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Email    string    `json:"email"`
	Phone    string    `json:"phone"`
	Location string    `json:"location"`
	Bio      string    `json:"bio"`
	Career   string    `json:"career"`
	Token    string    `json:"token"`
}

// Client Serializer
type ClientSerializer struct {
	ID           uuid.UUID               `json:"id"`
	Name         string                  `json:"name"`
	Email        string                  `json:"email"`
	Phone        string                  `json:"phone"`
	Location     string                  `json:"location"`
	Animals      []AnimalSerializer      `json:"animals,omitempty"`
	Appointments []AppointmentSerializer `json:"appointments,omitempty"`
}

// Owner Serializer
type OwnerSerializer struct {
	ID            uuid.UUID               `json:"id"`
	Name          string                  `json:"name"`
	Email         string                  `json:"email"`
	Phone         string                  `json:"phone"`
	Location      string                  `json:"location"`
	Bio           string                  `json:"bio"`
	Career        string                  `json:"career"`
	Services      []ServiceSerializer     `json:"services,omitempty"`
	Appointments  []AppointmentSerializer `json:"appointments,omitempty"`
	Reviews       []ReviewSerializer      `json:"reviews,omitempty"`
	Ratings       []RatingSerializer      `json:"ratings,omitempty"`
	AverageRating float64                 `json:"average_rating,omitempty"`
}

// Service Serializer
type ServiceSerializer struct {
	ID          uuid.UUID `json:"id"`
	ServiceName string    `json:"service_name"`
	ServiceDesc string    `json:"service_desc"`
	Price       float64   `json:"price"`
	Duration    int       `json:"duration"`
	OwnerID     uuid.UUID `json:"owner_id"`
}

// Animal Serializer
type AnimalSerializer struct {
	ID         uuid.UUID `json:"id"`
	AnimalName string    `json:"animal_name"`
	AnimalRace string    `json:"animal_race"`
	AnimalAge  uint      `json:"animal_age"`
	Species    string    `json:"species"`
	Metadata   string    `json:"metadata"`
	ClientID   uuid.UUID `json:"client_id"`
	CreatedAt  string    `json:"created_at"`
	UpdatedAt  string    `json:"updated_at"`
}

// Client Appointment Serializer (minimal info for appointments)
type ClientAppointmentSerializer struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Phone    string    `json:"phone"`
	Location string    `json:"location"`
}

// Owner Appointment Serializer (minimal info for appointments)
type OwnerAppointmentSerializer struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Phone    string    `json:"phone"`
	Location string    `json:"location"`
}

// Appointment Serializer
type AppointmentSerializer struct {
	ID       uuid.UUID                     `json:"id"`
	DateTime string                        `json:"datetime"`
	Notes    string                        `json:"notes"`
	Clients  []ClientAppointmentSerializer `json:"clients"`
	Owners   []OwnerAppointmentSerializer  `json:"owners"`
	Animals  []AnimalSerializer            `json:"animals"`
	Services []ServiceSerializer           `json:"services"`
}

// Review Serializer
type ReviewSerializer struct {
	ID        uuid.UUID        `json:"id"`
	Content   string           `json:"content"`
	CreatedAt string           `json:"created_at"`
	ClientID  uuid.UUID        `json:"client_id"`
	OwnerID   uuid.UUID        `json:"owner_id"`
	Client    ClientSerializer `json:"client"`
}

// Rating Serializer
type RatingSerializer struct {
	ID        uuid.UUID        `json:"id"`
	Score     float64          `json:"score"`
	CreatedAt string           `json:"created_at"`
	ClientID  uuid.UUID        `json:"client_id"`
	OwnerID   uuid.UUID        `json:"owner_id"`
	Client    ClientSerializer `json:"client"`
}
