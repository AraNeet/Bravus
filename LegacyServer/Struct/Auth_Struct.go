package Struct

import "github.com/google/uuid"

// RegisterRequestHandler
/*
Struct that handle the registering the user
*/
type RegisterRequestHandler struct {
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Phone     string `json:"phone"`
	Career    string `json:"career"`
}

// LoginRequestHandler
/*
Struct that handle the logging in the user
*/
type LoginRequestHandler struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginData
/*
Struct that handle the login data the user needs for
active use of the app
*/
type LoginData struct {
	ID    uuid.UUID `json:"id"`
	Token string    `json:"token"`
}
