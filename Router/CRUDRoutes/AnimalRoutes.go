package CRUD_Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	middleware "github.com/AramisAra/BravusBackend/middleware"
	"github.com/gofiber/fiber/v2"
)

func AnimalRoutes(app *fiber.App) {
	animal := app.Group("/animal")

	// Protected routes (require authentication)
	animal.Post("/create", middleware.AuthMiddleware(), CRUD.CreateAnimal)
	animal.Get("/get-animal", middleware.AuthMiddleware(), CRUD.GetAnimal)
	animal.Get("/client", middleware.AuthMiddleware(), CRUD.GetAnimalsByClientId)
	animal.Put("/update", middleware.AuthMiddleware(), CRUD.UpdateAnimal)
	animal.Delete("/delete", middleware.AuthMiddleware(), CRUD.DeleteAnimal)

	// Public routes (no authentication required)
	animal.Post("/create-no-auth", CRUD.CreateAnimal)
}
