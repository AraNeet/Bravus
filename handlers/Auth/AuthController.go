package Auth

import (
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

// ValidateToken checks if the provided JWT token is valid
func ValidateToken(c *fiber.Ctx) error {
	// Get token from Authorization header
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"valid": false,
			"error": "Authorization header is missing",
		})
	}

	// Check if the header has the Bearer prefix
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"valid": false,
			"error": "Authorization header format must be Bearer {token}",
		})
	}

	tokenString := parts[1]

	secretKey := os.Getenv("JWT_SECRET")

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {

		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secretKey), nil
	})

	// Check for errors
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"valid": false,
			"error": err.Error(),
		})
	}

	// Check if token is valid
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Extract user info from claims
		userId := claims["user_id"]
		email := claims["email"]

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"valid":   true,
			"user_id": userId,
			"email":   email,
		})
	}

	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		"valid": false,
		"error": "Invalid token",
	})
}
