package Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	"github.com/gofiber/fiber/v2"
)

func AppointmentRoutes(app *fiber.App) {
	appointment := app.Group("appointment")
	appointment.Post("/create", CRUD.CreateAppointment)
}
