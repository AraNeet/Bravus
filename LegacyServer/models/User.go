package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TODO. Update User to store companies or agencies.

// User
/*
Model for app users. This table handle normal user and Business user.
*/
type User struct {
	gorm.Model
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	FirstName string    `json:"firstname"`
	LastName  string    `json:"lastname"`
	Phone     string    `json:"phone"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
	Owner     bool      `json:"owner"`
	Career    *string   `json:"career"`

	Appointments *[]Appointment `gorm:"many2many;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;serializer:json" json:"appointments"`
	Animals      *[]Animal      `gorm:"foreignKey:OwnerID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;serializer:json" json:"animals"`
	Services     *[]Service     `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;serializer:json" json:"services"`
}

// Animal
/*
Model for the Animal of the user. Handle all information related to the animal.
*/
type Animal struct {
	gorm.Model
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	AnimalName   string    `json:"animal-name"`
	AnimalSpecie string    `json:"animal-specie"`
	AnimalAge    uint      `json:"animal-age"`
	OwnerID      string    `json:"owner-id"`
}
