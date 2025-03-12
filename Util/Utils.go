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
	case models.User:
		animalsData := animalFilter(v)
		appointmentsData := appointmentFilter(v)
		servicesData := serviceFilter(v)
		// If token is provided, use RegisterUserSerializer
		if len(token) > 0 {
			return Struct.AuthUserSerializer{
				ID:        v.ID, // Assuming User model has an ID field of type uuid.UUID
				FirstName: v.FirstName,
				LastName:  v.LastName,
				Email:     v.Email,
				Phone:     v.Phone,
				Owner:     v.Owner,
				Career:    v.Career,
				Token:     token[0],
			}, nil
		}

		if v.Owner {
			return Struct.OwnersSerializer{
				ID:        v.ID,
				FirstName: v.FirstName,
				LastName:  v.LastName,
				Email:     v.Email,
				Phone:     v.Phone,
				Owner:     v.Owner,
				Career:    v.Career,

				Appointments: appointmentsData,
				Services:     servicesData,
			}, nil
		}

		// Otherwise, use regular UserSerializer

		return Struct.UserSerializer{
			FirstName:    v.FirstName,
			LastName:     v.LastName,
			Email:        v.Email,
			Phone:        v.Phone,
			Owner:        v.Owner,
			Career:       v.Career,
			Animals:      animalsData,
			Appointments: appointmentsData,
			Services:     servicesData,
		}, nil
	case models.Animal:
		return Struct.AnimalSerializer{
			ID:         v.ID,
			AnimalName: v.AnimalName,
			AnimalRace: v.AnimalRace,
			AnimalAge:  v.AnimalAge,
		}, nil
	case models.Appointment:
		userAppointmentSerializers := make([]Struct.UserAppointmentSerializer, len(v.Users))
		for i, user := range v.Users {
			userAppointmentSerializers[i] = Struct.UserAppointmentSerializer{
				FirstName: user.FirstName,
				LastName:  user.LastName,
				Phone:     user.Phone,
				Career:    user.Career,
			}
		}
		formattedDateTime := v.DateTime.Format("2006-01-02 15:04")
		return Struct.AppointmentSerializer{
			ID:       v.ID,
			Users:    userAppointmentSerializers,
			Service:  v.ServiceID,
			DateTime: formattedDateTime,
		}, nil
	case models.Service:
		return Struct.ServiceSerializer{
			ID:          v.ID,
			ServiceName: v.ServiceName,
			ServiceDesc: v.ServiceDesc,
			Price:       v.Price,
		}, nil
	default:
		return nil, errors.New("unsupported type for serialization")
	}
}
