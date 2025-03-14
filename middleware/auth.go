package middlewares

import (
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

// AuthMiddleware is a middleware function that validates JWT tokens
func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Skip authentication for login and register endpoints
		path := c.Path()
		if path == "/user/login" || path == "/user/register" {
			return c.Next()
		}

		// Get token from Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authorization header is missing",
			})
		}

		// Check if the header has the Bearer prefix
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authorization header format must be Bearer {token}",
			})
		}

		tokenString := parts[1]
		secretKey := os.Getenv("JWT_SECRET")

		// Parse and validate the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate the signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(secretKey), nil
		})

		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token",
			})
		}

		// Check if token is valid and get claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Add user information to the context
			c.Locals("user_id", claims["user_id"])
			c.Locals("email", claims["email"])
			c.Locals("owner", claims["owner"])
			return c.Next()
		}

		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token claims",
		})
	}
}

// JWTError handles JWT-specific errors
func JWTError(c *fiber.Ctx, err error) error {
	if err.Error() == "Missing or malformed JWT" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Missing or malformed JWT token",
		})
	}
	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		"error": "Invalid or expired JWT token",
	})
}
