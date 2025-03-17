package Util

import (
	"errors"

	"github.com/google/uuid"
)

// ValidateUUIDs validates a list of UUIDs
func ValidateUUIDs(ids ...string) error {
	for _, id := range ids {
		if _, err := uuid.Parse(id); err != nil {
			return errors.New("invalid UUID: " + id)
		}
	}
	return nil
}
