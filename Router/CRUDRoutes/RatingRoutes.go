package CRUD_Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	"github.com/gofiber/fiber/v2"
)

func RatingRoutes(app *fiber.App) {
	rating := app.Group("/rating")
	rating.Post("/create", CRUD.CreateRating)
	rating.Get("/get-ratings", CRUD.GetRatings)
	rating.Get("/get-rating/:id", CRUD.GetRatingByID)
	rating.Get("/get-ratings-by-owner/:id", CRUD.GetRatingsByOwnerID)
	rating.Get("/get-average-rating/:id", CRUD.GetAverageRatingByOwnerID)
	rating.Put("/update/:id", CRUD.UpdateRating)
	rating.Delete("/delete/:id", CRUD.DeleteRating)
}
