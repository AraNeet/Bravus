package Struct

// UserUpdater
/*
Struct that manages user request for updating user profiles.
*/
type UserUpdater struct {
	Name   string `json:"name"`
	Phone  string `json:"phone"`
	Career string `json:"career"`
}

// AnimalUpdater
/*
Struct that manages animal request for updating animals info.
*/
type AnimalUpdater struct {
	AnimalName string `json:"animal-name"`
	AnimalRace string `json:"animal-race"`
	AnimalAge  uint   `json:"animal-age"`
	Species    string `json:"species"`
	Metadata   string `json:"metadata"`
}

// ServiceUpdater
/*
Struct that manages service request for update a service.
*/
type ServiceUpdater struct {
	ServiceName string  `json:"service-name"`
	ServiceDesc string  `json:"service-desc"`
	Price       float64 `json:"price"`
	Duration    int     `json:"duration"`
}

// AppointmentUpdater
/*
Struct that manages appointment request for update date or time of the appointment.
*/
type AppointmentUpdater struct {
	DateTime  string   `json:"datetime"`
	Service   string   `json:"service"`
	AnimalIDs []string `json:"animal_ids"`
}
