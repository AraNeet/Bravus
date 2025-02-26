package main

import (
	"log"

	"github.com/AramisAra/BravusBackend/Global"
	"github.com/AramisAra/BravusBackend/Router"
	"github.com/AramisAra/BravusBackend/handlers"
	middlewares "github.com/AramisAra/BravusBackend/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/template/html/v2"
	"github.com/joho/godotenv"
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
	Global.Engine = html.New("./view", ".html")

	app := fiber.New(fiber.Config{
		CaseSensitive: true,
		StrictRouting: true,
		Views: Global.Engine,
	})
	app.Use(middlewares.LocalPGMiddleware())
	app.Static("/static", "./static")

	Router.MainRouter(app)

	app.Get("/health", HealthCheck)

	err = app.Listen(Port)
	if err != nil {
		log.Fatal(err)
	}
}
