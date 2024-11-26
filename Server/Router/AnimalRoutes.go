package Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	"github.com/gofiber/fiber/v2"
)

func AnimalRoutes(app *fiber.App) {
	animal := app.Group("/animal")
	animal.Post("/create", CRUD.CreateAnimal)
}
