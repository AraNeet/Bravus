package CRUD_Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	"github.com/gofiber/fiber/v2"
)

func ServiceRoutes(app *fiber.App) {
	service := app.Group("/service")
	service.Post("/create", CRUD.CreateService)
	service.Get("/get-service", CRUD.GetService)
	service.Put("/update", CRUD.UpdateService)
	service.Delete("/delete", CRUD.DeleteService)
}
