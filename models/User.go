package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TODO. Update User to store companies or agencies.

// User
/*
Model for app users. This table handle normal user and Business user.
*/
type User struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4();not null"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	FirstName string         `json:"firstname" gorm:"not null"`
	LastName  string         `json:"lastname" gorm:"not null"`
	Phone     string         `json:"phone"`
	Email     string         `json:"email" gorm:"unique;not null;"`
	Password  string         `json:"password" gorm:"not null"`
	Owner     bool           `json:"owner" gorm:"default:false"`
	Career    string         `json:"career" gorm:"default:No Career"`

	// Consistent join table name
	Appointments []Appointment `gorm:"many2many:user_appointments;joinForeignKey:user_id;joinReferences:appointment_id" json:"appointments"`
	Animals      []Animal      `gorm:"foreignKey:OwnerID;references:ID" json:"animals"`
	Services     []Service     `gorm:"foreignKey:UserID" json:"services"`
}

// Animal
/*
Model for the Animal of the user. Handle all information related to the animal.
*/
type Animal struct {
	ID         uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4();not null"`
	CreatedAt  time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt  gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	AnimalName string         `json:"animal-name"`
	AnimalRace string         `json:"animal-race"`
	AnimalAge  uint           `json:"animal-age"`
	OwnerID    uuid.UUID      `json:"owner-id"`
	Owner      User           `gorm:"foreignKey:OwnerID;references:ID" json:"-"`
}
