package middlewares

import (
	"github.com/gofiber/fiber/v2"
)

func NewAuthMiddleware() {}

func jwtError(c *fiber.Ctx, err error) error {
	return nil
}
