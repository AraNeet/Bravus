package MainRouter

import (
	Auth "github.com/AramisAra/BravusBackend/Router/Auth"
	CRUD "github.com/AramisAra/BravusBackend/Router/CRUDRoutes"
	Google "github.com/AramisAra/BravusBackend/Router/google"
	"github.com/gofiber/fiber/v2"
)

func MainRouter(app *fiber.App) {
	// CRUD Routes
	CRUD.ClientRoutes(app)
	CRUD.OwnerRoutes(app)
	CRUD.AnimalRoutes(app)
	CRUD.ServiceRoutes(app)
	CRUD.AppointmentRoutes(app)
	CRUD.ReviewRoutes(app)
	CRUD.RatingRoutes(app)

	// Auth Routes
	Auth.AuthRoutes(app)

	// Google API Routes
	Google.SheetsRoutes(app)
	Google.AuthRoutes(app)
}
