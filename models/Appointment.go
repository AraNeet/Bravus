package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Appointment represents a scheduled service appointment
/*
Model for the appointment table
*/
// Appointment Model
type Appointment struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4();not null"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	DateTime  time.Time      `json:"datetime" gorm:"not null"`
	Notes     string         `json:"notes" gorm:"type:text"`

	// Relationships with cascade delete
	Clients  []Client  `gorm:"many2many:client_appointments;joinForeignKey:appointment_id;joinReferences:client_id;constraint:OnDelete:CASCADE" json:"clients"`
	Owners   []Owner   `gorm:"many2many:owner_appointments;joinForeignKey:appointment_id;joinReferences:owner_id;constraint:OnDelete:CASCADE" json:"owners"`
	Animals  []Animal  `gorm:"many2many:animal_appointments;joinForeignKey:appointment_id;joinReferences:animal_id;constraint:OnDelete:CASCADE" json:"animals"`
	Services []Service `gorm:"many2many:appointment_services;joinForeignKey:appointment_id;joinReferences:service_id;constraint:OnDelete:CASCADE" json:"services"`
}

// BeforeCreate validates the appointment data before creation
func (a *Appointment) BeforeCreate(tx *gorm.DB) error {
	// Ensure date is not in the past
	if a.DateTime.Before(time.Now()) {
		return gorm.ErrRecordNotFound
	}
	return nil
}
