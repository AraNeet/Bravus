package main

import (
	"log"
	"os"

	"github.com/AramisAra/BravusBackend/Global"
	Main_Router "github.com/AramisAra/BravusBackend/Router"
	"github.com/AramisAra/BravusBackend/handlers"
	middlewares "github.com/AramisAra/BravusBackend/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
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

	// Check for required environment variables
	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}

	Global.DB = handlers.ConnectPostgresDB()

	// Create new Fiber app with JWT error handler
	app := fiber.New(fiber.Config{
		ErrorHandler: middlewares.JWTError,
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, Access-Control-Allow-Origin",
		AllowCredentials: true,
	}))

	// Database middleware
	app.Use(middlewares.LocalPGMiddleware())

	// Routes
	Main_Router.MainRouter(app)

	// Health check endpoint
	app.Get("/health", HealthCheck)

	// Start server
	err = app.Listen(Port)
	if err != nil {
		log.Fatal(err)
	}
}
