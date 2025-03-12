package MainRouter

import (
	Auth "github.com/AramisAra/BravusBackend/Router/Auth"
	CRUD "github.com/AramisAra/BravusBackend/Router/CRUDRoutes"
	"github.com/gofiber/fiber/v2"
)

func MainRouter(app *fiber.App) {
	CRUD.UserRoutes(app)
	CRUD.AnimalRoutes(app)
	CRUD.AppointmentRoutes(app)
	CRUD.ServiceRoutes(app)
	Auth.AuthRoutes(app)
}
