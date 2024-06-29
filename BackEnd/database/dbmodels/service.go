package dbmodels

import (
	"github.com/google/uuid"
)

// Model for the Service table
type Service struct {
	Base
	NameService string    `json:"nameservice"`
	ServiceDesc string    `json:"servicedesc"`
	Price       float64   `json:"price"`
	ServiceCode string    `json:"servicecode"`
	OwnerID     uuid.UUID `json:"ownerid"`
}
