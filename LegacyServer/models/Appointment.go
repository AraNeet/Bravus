package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Appointment
/*
Model for the appointment table
*/
type Appointment struct {
	gorm.Model
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	Date      string    `json:"date" gorm:"DATE"`
	Time      string    `json:"time" gorm:"TIME"`
	UserID    uuid.UUID `json:"user-id"`
	ServiceID string    `json:"service-id"`
}
