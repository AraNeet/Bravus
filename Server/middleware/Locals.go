package middlewares

import (
	"github.com/AramisAra/BravusBackend/Global"
	"github.com/gofiber/fiber/v2"
)

func LocalPGMiddleware() func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		c.Locals("db", Global.DB)
		return c.Next()
	}
}
