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
	ID           uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4();not null"`
	CreatedAt    time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt    gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	ServiceName  string         `json:"service_name" gorm:"not null;size:100"`
	ServiceDesc  string         `json:"service_desc" gorm:"not null;type:text"`
	Price        float64        `json:"price" gorm:"not null;check:price >= 0"`
	UserID       uuid.UUID      `json:"user_id" gorm:"not null"`
	User         User           `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
	Appointments []Appointment  `gorm:"foreignKey:ServiceID;references:ID;constraint:OnDelete:CASCADE" json:"-"`
}
