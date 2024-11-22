package middlewares

import (
	"github.com/gofiber/fiber/v2"
)

func NewAuthMiddleware() {}

func jwtError(c *fiber.Ctx, err error) error {
	if err.Error() == "Missing or malformed JWT" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing or malformed JWT"})
	}
	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid or expired JWT"})
}
