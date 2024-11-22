package middlewares

import (
	"github.com/AramisAra/BravusBackend/handlers"
	"github.com/gofiber/fiber/v2"
)

func LocalPGMiddleware() func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		Db := handlers.ConnectPostgresDB()
		c.Locals("db", Db)
		return c.Next()
	}
}
