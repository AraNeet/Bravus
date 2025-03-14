package CRUD_Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	middleware "github.com/AramisAra/BravusBackend/middleware"
	"github.com/gofiber/fiber/v2"
)

func UserRoutes(app *fiber.App) {
	// Public routes (no authentication required)
	app.Post("/user/register", CRUD.CreateUser)
	app.Post("/user/login", CRUD.LoginUser)

	// Protected routes (require authentication)
	userGroup := app.Group("/user", middleware.AuthMiddleware())
	userGroup.Get("/get-user", CRUD.GetUser)
	userGroup.Get("/get-user-info", CRUD.GetUserWithEvery)
	userGroup.Get("/get-user-service", CRUD.GetUserWithService)
	userGroup.Get("/get-user-business", CRUD.GetBusinessUserInfo)
	userGroup.Put("/update", CRUD.UpdateUser)
	userGroup.Get("/get-users", CRUD.ListAllBusiness)
	userGroup.Delete("/delete", CRUD.DeleteUser)
}
