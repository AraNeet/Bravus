package CRUD_Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	"github.com/gofiber/fiber/v2"
)

func OwnerRoutes(app *fiber.App) {
	owner := app.Group("/owner")
	owner.Post("/register", CRUD.CreateOwner)
	owner.Post("/login", CRUD.LoginOwner)
	owner.Get("/get-owners", CRUD.GetOwners)
	owner.Get("/get-owner/:id", CRUD.GetOwnerByID)
	owner.Get("/get-owner-appointments/:id", CRUD.GetOwnerAppointments)
	owner.Put("/update/:id", CRUD.UpdateOwner)
	owner.Delete("/delete/:id", CRUD.DeleteOwner)
}
