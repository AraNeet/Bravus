package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Service
/*
Model for the Service table
*/
type Service struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	CreatedAt   time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
	ServiceName string         `json:"service-name"`
	ServiceDesc string         `json:"service-desc"`
	Price       float64        `json:"price"`
	UserID      uuid.UUID      `json:"user-id"`
	User        User           `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
