package CRUD_Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	"github.com/gofiber/fiber/v2"
)

func AnimalRoutes(app *fiber.App) {
	animal := app.Group("/animal")
	animal.Post("/create", CRUD.CreateAnimal)
	animal.Get("/get-animal", CRUD.GetAnimal)
	animal.Put("/update", CRUD.UpdateAnimal)
	animal.Delete("/delete", CRUD.DeleteAnimal)
}
