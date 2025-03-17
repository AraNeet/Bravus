package CRUD_Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	"github.com/gofiber/fiber/v2"
)

// ClientRoutes handles all routes for client CRUD operations
func ClientRoutes(app *fiber.App) {
	client := app.Group("/client")
	client.Post("/register", CRUD.CreateClient)
	client.Post("/login", CRUD.LoginClient)
	client.Get("/get-clients", CRUD.GetClients)
	client.Get("/get-client/:id", CRUD.GetClientByID)
	client.Put("/update/:id", CRUD.UpdateClient)
	client.Delete("/delete/:id", CRUD.DeleteClient)
}
