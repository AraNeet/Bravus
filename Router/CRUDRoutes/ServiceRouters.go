package CRUD_Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	middleware "github.com/AramisAra/BravusBackend/middleware"
	"github.com/gofiber/fiber/v2"
)

func ServiceRoutes(app *fiber.App) {
	service := app.Group("/service")

	// Protected routes (require authentication)
	service.Post("/create", middleware.AuthMiddleware(), CRUD.CreateService)
	service.Get("/get-services", middleware.AuthMiddleware(), CRUD.GetServices)
	service.Put("/update", middleware.AuthMiddleware(), CRUD.UpdateService)
	service.Delete("/delete", middleware.AuthMiddleware(), CRUD.DeleteService)
	service.Get("/owner/:id", middleware.AuthMiddleware(), CRUD.GetServicesByOwner)

	// Public routes (no authentication required)
	service.Post("/create-no-auth", CRUD.CreateService)
}
