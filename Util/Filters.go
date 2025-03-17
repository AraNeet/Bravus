package Util

import (
	"github.com/AramisAra/BravusBackend/Struct"
	"github.com/AramisAra/BravusBackend/models"
)

// Filter client's animals
func animalFilter(client models.Client) []Struct.AnimalSerializer {
	animalsData := make([]Struct.AnimalSerializer, 0)
	for _, animal := range client.Animals {
		animalData := Struct.AnimalSerializer{
			ID:         animal.ID,
			AnimalName: animal.AnimalName,
			AnimalRace: animal.AnimalRace,
			AnimalAge:  animal.AnimalAge,
			Species:    animal.Species,
			Metadata:   animal.Metadata,
			ClientID:   animal.ClientID,
			CreatedAt:  animal.CreatedAt.Format("2006-01-02 15:04"),
			UpdatedAt:  animal.UpdatedAt.Format("2006-01-02 15:04"),
		}
		animalsData = append(animalsData, animalData)
	}
	return animalsData
}

// Filter owner's services
func serviceFilter(owner models.Owner) []Struct.ServiceSerializer {
	servicesData := make([]Struct.ServiceSerializer, 0)
	for _, service := range owner.Services {
		serviceData := Struct.ServiceSerializer{
			ID:          service.ID,
			ServiceName: service.ServiceName,
			ServiceDesc: service.ServiceDesc,
			Price:       service.Price,
			Duration:    service.Duration,
			OwnerID:     service.OwnerID,
		}
		servicesData = append(servicesData, serviceData)
	}
	return servicesData
}

// Filter appointment data
func appointmentFilter(appointment models.Appointment) Struct.AppointmentSerializer {
	// Create client serializers for each client in appointment
	clientSerializers := make([]Struct.ClientAppointmentSerializer, len(appointment.Clients))
	for i, client := range appointment.Clients {
		clientSerializers[i] = Struct.ClientAppointmentSerializer{
			ID:       client.ID,
			Name:     client.Name,
			Phone:    client.Phone,
			Location: client.Location,
		}
	}

	// Create owner serializers for each owner in appointment
	ownerSerializers := make([]Struct.OwnerAppointmentSerializer, len(appointment.Owners))
	for i, owner := range appointment.Owners {
		ownerSerializers[i] = Struct.OwnerAppointmentSerializer{
			ID:       owner.ID,
			Name:     owner.Name,
			Phone:    owner.Phone,
			Location: owner.Location,
		}
	}

	// Create animal serializers
	animalSerializers := make([]Struct.AnimalSerializer, len(appointment.Animals))
	for i, animal := range appointment.Animals {
		animalSerializers[i] = Struct.AnimalSerializer{
			ID:         animal.ID,
			AnimalName: animal.AnimalName,
			AnimalRace: animal.AnimalRace,
			AnimalAge:  animal.AnimalAge,
			Species:    animal.Species,
			ClientID:   animal.ClientID,
		}
	}

	// Create service serializers
	serviceSerializers := make([]Struct.ServiceSerializer, len(appointment.Services))
	for i, service := range appointment.Services {
		serviceSerializers[i] = Struct.ServiceSerializer{
			ID:          service.ID,
			ServiceName: service.ServiceName,
			ServiceDesc: service.ServiceDesc,
			Price:       service.Price,
			Duration:    service.Duration,
			OwnerID:     service.OwnerID,
		}
	}

	formattedDateTime := appointment.DateTime.Format("2006-01-02 15:04")

	// Create appointment with all related data
	return Struct.AppointmentSerializer{
		ID:       appointment.ID,
		DateTime: formattedDateTime,
		Notes:    appointment.Notes,
		Clients:  clientSerializers,
		Owners:   ownerSerializers,
		Animals:  animalSerializers,
		Services: serviceSerializers,
	}
}
