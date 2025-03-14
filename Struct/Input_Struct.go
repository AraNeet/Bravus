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
}

type AppointmentRequestHandler struct {
	DateTime string `json:"datetime"`
}
