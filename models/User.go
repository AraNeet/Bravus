package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TODO. Update User to store companies or agencies.

// User represents a user in the system (can be either a client or a business owner)
/*
Model for app users. This table handle normal user and Business user.
*/
type User struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4();not null"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	FirstName string         `json:"firstname" gorm:"not null;size:50"`
	LastName  string         `json:"lastname" gorm:"not null;size:50"`
	Phone     string         `json:"phone" gorm:"size:20"`
	Email     string         `json:"email" gorm:"unique;not null;size:100"`
	Password  string         `json:"password" gorm:"not null"`
	Owner     bool           `json:"owner" gorm:"default:false"`
	Career    string         `json:"career" gorm:"default:No Career;size:100"`

	// Relationships with cascade delete
	Appointments []Appointment `gorm:"many2many:user_appointments;joinForeignKey:user_id;joinReferences:appointment_id;constraint:OnDelete:CASCADE" json:"appointments"`
	Animals      []Animal      `gorm:"foreignKey:OwnerID;references:ID;constraint:OnDelete:CASCADE" json:"animals"`
	Services     []Service     `gorm:"foreignKey:UserID;references:ID;constraint:OnDelete:CASCADE" json:"services"`
}

// Animal represents a pet owned by a user
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
	OwnerID    uuid.UUID      `json:"owner_id" gorm:"not null"`
	Owner      User           `gorm:"foreignKey:OwnerID;references:ID" json:"-"`
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
