package Global

import (
	"github.com/gofiber/template/html/v2"

	"gorm.io/gorm"
)

var (
	DB *gorm.DB
	Engine *html.Engine
	Debug bool = true
	Devmode bool = false
)
