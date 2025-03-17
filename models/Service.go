package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Service represents a service offered by a business owner
/*
Model for the Service table
*/
type Service struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4();not null"`
	CreatedAt   time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	ServiceName string         `json:"service_name" gorm:"not null;size:100"`
	ServiceDesc string         `json:"service_desc" gorm:"not null;type:text"`
	Price       float64        `json:"price" gorm:"not null;check:price >= 0"`
	Duration    int            `json:"duration" gorm:"not null;comment:duration in minutes"`

	// Relationships
	OwnerID      uuid.UUID     `json:"owner_id" gorm:"not null"`
	Owner        Owner         `gorm:"foreignKey:OwnerID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Appointments []Appointment `gorm:"many2many:appointment_services;joinForeignKey:service_id;joinReferences:appointment_id" json:"appointments"`
}

// BeforeCreate validates the service data before creation
func (s *Service) BeforeCreate(tx *gorm.DB) error {
	if s.ServiceName == "" {
		return gorm.ErrRecordNotFound
	}
	if s.ServiceDesc == "" {
		return gorm.ErrRecordNotFound
	}
	if s.Price < 0 {
		return gorm.ErrRecordNotFound
	}
	if s.Duration <= 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
