package Util

import (
	"errors"

	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/models"
	"github.com/google/uuid"
)

func Serializer(data interface{}) (interface{}, error) {
	switch v := data.(type) {
	case models.User:
		appointmentsData := make([]Struct.AppointmentSerializer, 0)
		for _, appointment := range v.Appointments {
			// Create filtered participants for each appointment
			userAppointmentSerializers := make([]Struct.UserAppointmentSerializer, len(appointment.Users))
			for i, user := range appointment.Users {
				userAppointmentSerializers[i] = Struct.UserAppointmentSerializer{
					FirstName: user.FirstName,
					LastName:  user.LastName,
					Phone:     user.Phone,
					Career:    user.Career,
				}
			}

			formattedDateTime := appointment.DateTime.Format("2006-01-02 15:04")

			// Create appointment with filtered participants
			appointmentData := Struct.AppointmentSerializer{
				ID:       appointment.ID,
				Users:    userAppointmentSerializers,
				Service:  appointment.ServiceID,
				DateTime: formattedDateTime,
			}
			appointmentsData = append(appointmentsData, appointmentData)
		}

		return Struct.UserSerializer{
			FirstName:    v.FirstName,
			LastName:     v.LastName,
			Email:        v.Email,
			Phone:        v.Phone,
			Owner:        v.Owner,
			Career:       v.Career,
			Animals:      v.Animals,
			Appointments: appointmentsData,
			Services:     v.Services,
		}, nil
	case models.Animal:
		return Struct.AnimalSerializer{
			AnimalName:   v.AnimalName,
			AnimalSpecie: v.AnimalSpecie,
			AnimalAge:    v.AnimalAge,
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
			NameService: v.ServiceName,
			ServiceDesc: v.ServiceDesc,
			Price:       v.Price,
		}, nil

	default:
		return nil, errors.New("unsupported type for serialization")
	}
}

func ValidateUUIDs(ids ...string) error {
	for _, id := range ids {
		if _, err := uuid.Parse(id); err != nil {
			return errors.New("invalid UUID: " + id)
		}
	}
	return nil
}
