package models

import (
	"github.com/google/uuid"
)

// Service
/*
Model for the Service table
*/
type Service struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	ServiceName string    `json:"service-name"`
	ServiceDesc string    `json:"service-desc"`
	Price       float64   `json:"price"`
	UserID      uuid.UUID `json:"user-id"`
	User    		User      `gorm:"foreignKey:UserID;references:ID" json:"-"`
}
