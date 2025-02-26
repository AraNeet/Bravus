package frontend

import (
	"github.com/gofiber/fiber/v2"
)

func HomeView(c *fiber.Ctx) error {
	return c.Render("index", fiber.Map{
		"Title": "Bravus - Appointment Scheduler",
		"Features": []fiber.Map{
			{
				"Icon":        "calendar",
				"Title":       "Smart Scheduling",
				"Description": "Intelligent appointment scheduling with conflict prevention and automated reminders.",
			},
			{
				"Icon":        "users",
				"Title":       "Multi-user Support",
				"Description": "Manage multiple staff members and their individual schedules efficiently.",
			},
			{
				"Icon":        "clock",
				"Title":       "Real-time Updates",
				"Description": "Get instant notifications and updates for appointment changes and confirmations.",
			},
		},
		"Steps": []fiber.Map{
			{
				"Number": 1,
				"Text":   "Create your account and set up your business profile",
			},
			{
				"Number": 2,
				"Text":   "Configure your availability and services",
			},
			{
				"Number": 3,
				"Text":   "Share your booking link with clients",
			},
		},
	})
}