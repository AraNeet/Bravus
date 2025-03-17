package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Review represents a review for an owner
type Review struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4();not null"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	Content   string         `json:"content" gorm:"type:text;not null"`

	// Relationships
	ClientID uuid.UUID `json:"client_id" gorm:"not null"`
	Client   Client    `gorm:"foreignKey:ClientID;references:ID" json:"-"`
	OwnerID  uuid.UUID `json:"owner_id" gorm:"not null"`
	Owner    Owner     `gorm:"foreignKey:OwnerID;references:ID" json:"-"`
}

// BeforeCreate validates the review data before creation
func (r *Review) BeforeCreate(tx *gorm.DB) error {
	if r.Content == "" {
		return gorm.ErrRecordNotFound
	}
	return nil
}
