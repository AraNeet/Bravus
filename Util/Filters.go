package Util

import (
	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/models"
)

// Clean out. Important  data from the responses
func animalFilter(v models.User) []Struct.AnimalSerializer {
	animalsData := make([]Struct.AnimalSerializer, 0)
	for _, animal := range v.Animals {
		animalData := Struct.AnimalSerializer{
			ID:         animal.ID,
			AnimalName: animal.AnimalName,
			AnimalRace: animal.AnimalRace,
			AnimalAge:  animal.AnimalAge,
			Species:    animal.Species,
			Metadata:   animal.Metadata,
			OwnerID:    animal.OwnerID,
		}
		animalsData = append(animalsData, animalData)
	}
	return animalsData
}

// Clean out. Important  data from the responses
func serviceFilter(v models.User) []Struct.ServiceSerializer {
	servicesData := make([]Struct.ServiceSerializer, 0)
	for _, service := range v.Services {
		serviceData := Struct.ServiceSerializer{
			ID:          service.ID,
			ServiceName: service.ServiceName,
			ServiceDesc: service.ServiceDesc,
			Price:       service.Price,
		}
		servicesData = append(servicesData, serviceData)
	}
	return servicesData
}

// Clean out. Important  data from the responses
func appointmentFilter(v models.User) []Struct.AppointmentSerializer {
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
	return appointmentsData
}
