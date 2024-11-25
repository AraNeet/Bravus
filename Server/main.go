package main

import (
	"github.com/AramisAra/BravusBackend/Global"
	"github.com/AramisAra/BravusBackend/Router"
	"github.com/AramisAra/BravusBackend/config"
	"github.com/AramisAra/BravusBackend/handlers"
	middlewares "github.com/AramisAra/BravusBackend/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"log"
)

const (
	Port = ":8000"
)

// HealthCheck is an HTTP handler function for a health check endpoint,
// serving a simple "OK" message to indicate the server is up and running.
func HealthCheck(c *fiber.Ctx) error {
	return c.SendString("OK")
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file. Or the file is missing.")
	}

	Global.DB = handlers.ConnectPostgresDB()

	app := fiber.New(config.Fb)
	app.Use(middlewares.LocalPGMiddleware())

	Router.MainRouter(app)

	app.Get("/health", HealthCheck)

	err = app.Listen(Port)
	if err != nil {
		log.Fatal(err)
	}
}
