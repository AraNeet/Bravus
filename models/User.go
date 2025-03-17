package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Client represents a client user in the system
type Client struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4();not null"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	Name      string         `json:"name" gorm:"not null;size:100"`
	Email     string         `json:"email" gorm:"unique;not null;size:100"`
	Phone     string         `json:"phone" gorm:"size:20"`
	Password  string         `json:"password" gorm:"not null"`
	Location  string         `json:"location" gorm:"size:200"`

	// Relationships with cascade delete
	Animals      []Animal      `gorm:"foreignKey:ClientID;references:ID;constraint:OnDelete:CASCADE" json:"animals"`
	Appointments []Appointment `gorm:"many2many:client_appointments;joinForeignKey:client_id;joinReferences:appointment_id;constraint:OnDelete:CASCADE" json:"appointments"`
}

// Owner represents a business owner in the system
type Owner struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4();not null"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	Name      string         `json:"name" gorm:"not null;size:100"`
	Email     string         `json:"email" gorm:"unique;not null;size:100"`
	Phone     string         `json:"phone" gorm:"size:20"`
	Password  string         `json:"password" gorm:"not null"`
	Location  string         `json:"location" gorm:"size:200"`
	Bio       string         `json:"bio" gorm:"type:text"`
	Career    string         `json:"career" gorm:"size:100"`

	// Relationships with cascade delete
	Services     []Service     `gorm:"foreignKey:OwnerID;references:ID;constraint:OnDelete:CASCADE" json:"services"`
	Appointments []Appointment `gorm:"many2many:owner_appointments;joinForeignKey:owner_id;joinReferences:appointment_id;constraint:OnDelete:CASCADE" json:"appointments"`
	Reviews      []Review      `gorm:"foreignKey:OwnerID;references:ID;constraint:OnDelete:CASCADE" json:"reviews"`
	Ratings      []Rating      `gorm:"foreignKey:OwnerID;references:ID;constraint:OnDelete:CASCADE" json:"ratings"`
}

// Animal represents a pet owned by a client
/*
Model for the Animal of the user. Handle all information related to the animal.
*/
type Animal struct {
	ID         uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4();not null"`
	CreatedAt  time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt  gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	AnimalName string         `json:"animal_name" gorm:"not null;size:100"`
	AnimalRace string         `json:"animal_race" gorm:"not null;size:100"`
	AnimalAge  uint           `json:"animal_age" gorm:"not null;check:animal_age >= 0"`
	Species    string         `json:"species" gorm:"not null;size:50"`
	Metadata   string         `json:"metadata" gorm:"type:text"`
	ClientID   uuid.UUID      `json:"client_id" gorm:"not null"`
	Client     Client         `gorm:"foreignKey:ClientID;references:ID" json:"-"`

	// Relationship with appointments
	Appointments []Appointment `gorm:"many2many:animal_appointments;joinForeignKey:animal_id;joinReferences:appointment_id" json:"appointments"`
}

// BeforeCreate validates the animal data before creation
func (a *Animal) BeforeCreate(tx *gorm.DB) error {
	if a.AnimalName == "" {
		return gorm.ErrRecordNotFound
	}
	if a.AnimalRace == "" {
		return gorm.ErrRecordNotFound
	}
	if a.AnimalAge == 0 {
		return gorm.ErrRecordNotFound
	}
	if a.Species == "" {
		return gorm.ErrRecordNotFound
	}
	return nil
}
