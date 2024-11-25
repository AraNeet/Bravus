package Router

import "github.com/gofiber/fiber/v2"

func MainRouter(app *fiber.App) {
	UserRoutes(app)
}
