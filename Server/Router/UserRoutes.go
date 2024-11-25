package Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	"github.com/gofiber/fiber/v2"
)

func UserRoutes(app *fiber.App) {
	User := app.Group("/user")
	User.Post("/register", CRUD.CreateUser)
	User.Post("/login", CRUD.LoginUser)
	User.Get("/get-user", CRUD.GetUser)
	User.Get("/get-user-animal", CRUD.GetUserWithAnimal)
	User.Get("/get-user-Appointment", CRUD.GetUserWithAppointment)
	User.Get("/get-user-Service", CRUD.GetUserWithService)
	User.Get("/get-user-business", CRUD.GetBusinessUserInfo)
	User.Put("/update", CRUD.UpdateUser)
	User.Get("/get-users", CRUD.ListUser)
	User.Delete("/delete", CRUD.DeleteUser)
}
