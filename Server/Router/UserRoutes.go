package Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	"github.com/gofiber/fiber/v2"
)

func UserRoutes(app *fiber.App) {
	User := app.Group("/user")
	User.Post("/register", CRUD.CreateUser)
}
