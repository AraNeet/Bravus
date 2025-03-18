package CRUD_Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	middlewares "github.com/AramisAra/BravusBackend/middleware"
	"github.com/gofiber/fiber/v2"
)

// ClientRoutes handles all routes for client CRUD operations
func ClientRoutes(app *fiber.App) {
	client := app.Group("/client")
	client.Post("/register", CRUD.CreateClient)
	client.Post("/login", CRUD.LoginClient)
	client.Get("/get-clients", middlewares.AuthMiddleware(), CRUD.GetClients)
	client.Get("/get-client/:id", middlewares.AuthMiddleware(), CRUD.GetClientByID)
	client.Put("/update/:id", middlewares.AuthMiddleware(), CRUD.UpdateClient)
	client.Delete("/delete/:id", middlewares.AuthMiddleware(), CRUD.DeleteClient)
}
