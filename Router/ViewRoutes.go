package Router

import (
	frontend "github.com/AramisAra/BravusBackend/handlers/Front-end"
	"github.com/gofiber/fiber/v2"
)

func ViewsRoutes(app *fiber.App) {
	views := app.Group("views")
	views.Get("/", frontend.HomeView)
}