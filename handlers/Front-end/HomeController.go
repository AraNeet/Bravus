package frontend

import (
	"github.com/gofiber/fiber/v2"
)

func HomeView(c *fiber.Ctx) error {
	return c.Render("index", fiber.Map{
		"Title": "Bravus",
	})
}

