package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Appointment
/*
Model for the appointment table
*/
// Appointment Model
type Appointment struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	DateTime  time.Time      `json:"DateTime"`

	// Consistent join table name
	Users     []User    `gorm:"many2many:user_appointments;joinForeignKey:appointment_id;joinReferences:user_id" json:"participants"`
	ServiceID uuid.UUID `json:"service-id"`
}
