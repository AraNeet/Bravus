package Router

import (
	frontend "github.com/AramisAra/BravusBackend/handlers/Front-end"
	"github.com/gofiber/fiber/v2"
)

func ViewsRoutes(app *fiber.App) {
	app.Get("/", frontend.HomeView)
}