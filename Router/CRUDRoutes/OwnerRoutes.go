package CRUD_Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	middlewares "github.com/AramisAra/BravusBackend/middleware"
	"github.com/gofiber/fiber/v2"
)

func OwnerRoutes(app *fiber.App) {
	owner := app.Group("/owner")
	owner.Post("/register", CRUD.CreateOwner)
	owner.Post("/login", CRUD.LoginOwner)
	owner.Get("/get-owners", middlewares.AuthMiddleware(), CRUD.GetOwners)
	owner.Get("/get-owner/:id", middlewares.AuthMiddleware(), CRUD.GetOwnerByID)
	owner.Get("/get-owner-appointments/:id", middlewares.AuthMiddleware(), CRUD.GetOwnerAppointments)
	owner.Put("/update/:id", middlewares.AuthMiddleware(), CRUD.UpdateOwner)
	owner.Delete("/delete/:id", middlewares.AuthMiddleware(), CRUD.DeleteOwner)
}
