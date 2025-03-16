package CRUD_Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	"github.com/gofiber/fiber/v2"
)

func AppointmentRoutes(app *fiber.App) {
	appointment := app.Group("appointment")
	appointment.Post("/create", CRUD.CreateAppointment)
	appointment.Get("/get-appointment", CRUD.GetAppointment)
	appointment.Put("/update", CRUD.UpdateAppointment)
	appointment.Delete("/delete", CRUD.DeleteAppointment)
}
