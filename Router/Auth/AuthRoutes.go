package AuthRoutes

import (
	AUTH "github.com/AramisAra/BravusBackend/handlers/Auth"
	"github.com/gofiber/fiber/v2"
)

func AuthRoutes(app *fiber.App) {
	auth := app.Group("auth")
	auth.Get("/check", AUTH.ValidateToken)
}
