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
		return Struct.UserSerializer{
			FirstName:    v.FirstName,
			LastName:     v.LastName,
			Email:        v.Email,
			Phone:        v.Phone,
			Owner:        v.Owner,
			Career:       v.Career,
			Animals:      v.Animals,
			Appointments: v.Appointments,
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
		return Struct.AppointmentSerializer{
			Users:   userAppointmentSerializers,
			Service: v.ServiceID,
			Date:    v.Date,
			Time:    v.Time,
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

func IsValidUUID(id string) bool {
	_, err := uuid.Parse(id)
	return err == nil
}

func IsValidUUIDs(id map[string]string) bool {
	var pro error
	for i := range id {
		test := IsValidUUID(id[i])
		if !test {
			return pro != nil
		}
	}
	return pro == nil
}
