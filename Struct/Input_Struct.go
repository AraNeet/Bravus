package Struct

import (
	"time"

	"github.com/google/uuid"
)

// RegisterRequestHandler
/*
Struct that handle the registering the user
*/
type RegisterRequestHandler struct {
	Name     string `json:"name"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Owner    bool   `json:"owner"`
	Career   string `json:"career"`
}

// AnimalRequestHandler Struct that handles animal creations
type AnimalRequestHandler struct {
	AnimalName string `json:"animal-name"`
	AnimalRace string `json:"animal-race"`
	AnimalAge  uint   `json:"animal-age"`
	Species    string `json:"species"`
	Metadata   string `json:"metadata"`
}

// ServiceRequestHandler Struct that handle service creations
type ServiceRequestHandler struct {
	ServiceName string  `json:"service-name"`
	ServiceDesc string  `json:"service-desc"`
	Price       float64 `json:"price"`
	Duration    int     `json:"duration"`
}

type AppointmentRequestHandler struct {
	DateTime  string   `json:"datetime"`
	Notes     string   `json:"notes"`
	AnimalIDs []string `json:"animal_ids"`
}

// ClientInput represents input for client creation/update
type ClientInput struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Phone    string `json:"phone" validate:"required"`
	Password string `json:"password" validate:"required,min=6"`
	Location string `json:"location" validate:"required"`
}

// OwnerInput represents input for owner creation/update
type OwnerInput struct {
	Name     string `json:"name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Phone    string `json:"phone" validate:"required"`
	Password string `json:"password" validate:"required,min=6"`
	Location string `json:"location" validate:"required"`
	Bio      string `json:"bio"`
	Career   string `json:"career"`
}

// AnimalInput represents input for animal creation/update
type AnimalInput struct {
	AnimalName string    `json:"animal_name" validate:"required"`
	AnimalRace string    `json:"animal_race" validate:"required"`
	AnimalAge  uint      `json:"animal_age" validate:"required,min=0"`
	Species    string    `json:"species" validate:"required"`
	Metadata   string    `json:"metadata"`
	ClientID   uuid.UUID `json:"client_id" validate:"required"`
}

// ServiceInput represents input for service creation/update
type ServiceInput struct {
	ServiceName string    `json:"service_name" validate:"required"`
	ServiceDesc string    `json:"service_desc" validate:"required"`
	Price       float64   `json:"price" validate:"required,min=0"`
	Duration    int       `json:"duration" validate:"required,min=1"`
	OwnerID     uuid.UUID `json:"owner_id" validate:"required"`
}

// AppointmentInput represents input for appointment creation/update
type AppointmentInput struct {
	DateTime   time.Time   `json:"datetime" validate:"required"`
	Notes      string      `json:"notes"`
	ClientIDs  []uuid.UUID `json:"client_ids" validate:"required,min=1"`
	OwnerIDs   []uuid.UUID `json:"owner_ids" validate:"required,min=1"`
	AnimalIDs  []uuid.UUID `json:"animal_ids" validate:"required,min=1"`
	ServiceIDs []uuid.UUID `json:"service_ids" validate:"required,min=1"`
}

// ReviewInput represents input for review creation/update
type ReviewInput struct {
	Content  string    `json:"content" validate:"required"`
	ClientID uuid.UUID `json:"client_id" validate:"required"`
	OwnerID  uuid.UUID `json:"owner_id" validate:"required"`
}

// RatingInput represents input for rating creation/update
type RatingInput struct {
	Score    float64   `json:"score" validate:"required,min=0,max=5"`
	ClientID uuid.UUID `json:"client_id" validate:"required"`
	OwnerID  uuid.UUID `json:"owner_id" validate:"required"`
}
