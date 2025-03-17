package CRUD_Router

import (
	"github.com/AramisAra/BravusBackend/handlers/CRUD"
	"github.com/gofiber/fiber/v2"
)

func ReviewRoutes(app *fiber.App) {
	review := app.Group("/review")
	review.Post("/create", CRUD.CreateReview)
	review.Get("/get-reviews", CRUD.GetReviews)
	review.Get("/get-review/:id", CRUD.GetReviewByID)
	review.Get("/get-reviews-by-owner/:id", CRUD.GetReviewsByOwnerID)
	review.Put("/update/:id", CRUD.UpdateReview)
	review.Delete("/delete/:id", CRUD.DeleteReview)
}
