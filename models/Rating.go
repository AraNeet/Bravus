package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Rating represents a rating for an owner
type Rating struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4();not null"`
	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	Score     float64        `json:"score" gorm:"not null;type:decimal(2,1);check:score >= 0 AND score <= 5"`

	// Relationships
	ClientID uuid.UUID `json:"client_id" gorm:"not null"`
	Client   Client    `gorm:"foreignKey:ClientID;references:ID" json:"-"`
	OwnerID  uuid.UUID `json:"owner_id" gorm:"not null"`
	Owner    Owner     `gorm:"foreignKey:OwnerID;references:ID" json:"-"`
}

// BeforeCreate validates the rating data before creation
func (r *Rating) BeforeCreate(tx *gorm.DB) error {
	if r.Score < 0 || r.Score > 5 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
