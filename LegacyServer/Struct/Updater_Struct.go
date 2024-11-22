package Struct

// UserUpdater
/*
Struct that manages user request for updating user profiles.
*/
type UserUpdater struct {
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
	Phone     string `json:"phone"`
	Career    string `json:"career"`
}

// AnimalUpdater
/*
Struct that manages animal request for updating animals info.
*/
type AnimalUpdater struct {
	AnimalName   string `json:"animal-name"`
	AnimalSpecie string `json:"animal-specie"`
	AnimalAge    uint   `json:"animal-age"`
}

// ServiceUpdater
/*
Struct that manages service request for update a service.
*/
type ServiceUpdater struct {
	NameService string  `json:"name-service"`
	ServiceDesc string  `json:"service-desc"`
	Price       float64 `json:"price"`
}

// AppointmentUpdater
/*
Struct that manages appointment request for update date or time of the appointment.
*/
type AppointmentUpdater struct {
	Date string `json:"date"`
	Time string `json:"time"`
}
