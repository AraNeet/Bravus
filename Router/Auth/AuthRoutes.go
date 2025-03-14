package AuthRoutes

import (
	AUTH "github.com/AramisAra/BravusBackend/handlers/Auth"
	middleware "github.com/AramisAra/BravusBackend/middleware"
	"github.com/gofiber/fiber/v2"
)

func AuthRoutes(app *fiber.App) {
	auth := app.Group("auth")
	auth.Get("/check", middleware.AuthMiddleware(), AUTH.ValidateToken)
}
