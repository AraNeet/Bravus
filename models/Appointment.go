package models

import (
	"github.com/google/uuid"
)

// Appointment
/*
Model for the appointment table
*/
type Appointment struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	Date      string    `json:"date" gorm:"DATE"`
	Time      string    `json:"time" gorm:"TIME"`
	Users     []User    `gorm:"many2many:user_appointments;" json:"participants"`
	ServiceID uuid.UUID  `json:"service-id"`
}
