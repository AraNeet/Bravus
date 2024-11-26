package Struct

// RegisterRequestHandler
/*
Struct that handle the registering the user
*/
type RegisterRequestHandler struct {
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
	Phone     string `json:"phone"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Owner     bool   `json:"owner"`
	Career    string `json:"career"`
}

// AnimalRequestHandler Struct that handles animal creations
type AnimalRequestHandler struct {
	AnimalName   string `json:"animal-name"`
	AnimalSpecie string `json:"animal-specie"`
	AnimalAge    uint   `json:"animal-age"`
}

// ServiceRequestHandler Struct that handle service creations
type ServiceRequestHandler struct {
	NameService string  `json:"name-service"`
	ServiceDesc string  `json:"service-desc"`
	Price       float64 `json:"price"`
}

type AppointmentRequestHandler struct {
	ClientID string `json:"client-id"`
	OwnerID  string `json:"owner-id"`
	Service  string `json:"service"`
	Date     string `json:"date"`
	Time     string `json:"time"`
}
