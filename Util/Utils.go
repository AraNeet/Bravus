package Util

import (
	"errors"

	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/models"
)

// Serializer converts model data into serialized structs
// Pass a token value to use the registration serializer
func Serializer(data interface{}, token ...string) (interface{}, error) {
	switch v := data.(type) {
	case models.Client:
		animalsData := animalFilter(v)

		// If token is provided, use RegisterUserSerializer
		if len(token) > 0 {
			return Struct.AuthClientSerializer{
				ID:       v.ID,
				Name:     v.Name,
				Email:    v.Email,
				Phone:    v.Phone,
				Location: v.Location,
				Token:    token[0],
			}, nil
		}

		// Otherwise, use regular ClientSerializer
		return Struct.ClientSerializer{
			ID:       v.ID,
			Name:     v.Name,
			Email:    v.Email,
			Phone:    v.Phone,
			Location: v.Location,
			Animals:  animalsData,
		}, nil

	case models.Owner:
		servicesData := serviceFilter(v)

		// If token is provided, use RegisterUserSerializer
		if len(token) > 0 {
			return Struct.AuthOwnerSerializer{
				ID:       v.ID,
				Name:     v.Name,
				Email:    v.Email,
				Phone:    v.Phone,
				Location: v.Location,
				Token:    token[0],
			}, nil
		}

		// Otherwise, use regular OwnerSerializer
		return Struct.OwnerSerializer{
			ID:       v.ID,
			Name:     v.Name,
			Email:    v.Email,
			Phone:    v.Phone,
			Location: v.Location,
			Services: servicesData,
		}, nil

	case models.Animal:
		return Struct.AnimalSerializer{
			ID:         v.ID,
			AnimalName: v.AnimalName,
			AnimalRace: v.AnimalRace,
			AnimalAge:  v.AnimalAge,
			Species:    v.Species,
			Metadata:   v.Metadata,
			ClientID:   v.ClientID,
			CreatedAt:  v.CreatedAt.Format("2006-01-02 15:04"),
			UpdatedAt:  v.UpdatedAt.Format("2006-01-02 15:04"),
		}, nil

	case models.Appointment:
		return appointmentFilter(v), nil

	case models.Service:
		return Struct.ServiceSerializer{
			ID:          v.ID,
			ServiceName: v.ServiceName,
			ServiceDesc: v.ServiceDesc,
			Price:       v.Price,
			Duration:    v.Duration,
			OwnerID:     v.OwnerID,
		}, nil

	default:
		return nil, errors.New("unsupported type for serialization")
	}
}
