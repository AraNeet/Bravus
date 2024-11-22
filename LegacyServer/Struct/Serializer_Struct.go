package Struct

import (
	models2 "github.com/AramisAra/BravusBackend/models"
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
	Career    string `json:"career"`

	Animals      []models2.Animal      `json:"animals"`
	Appointments []models2.Appointment `json:"appointments"`
	Services     []models2.Service     `json:"services"`
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
	ClientName string `json:"client-name"`
	OwnerName  string `json:"owner-name"`
	Service    string `json:"service"`
	Date       string `json:"date"`
	Time       string `json:"time"`
}
