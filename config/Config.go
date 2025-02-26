package config

import (
	"github.com/AramisAra/BravusBackend/Global"
	"github.com/gofiber/template/html/v2"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func StartEngine() *html.Engine {
	engine := html.New("../handlers/Front-end/views", ".html")
	
	return engine
}

var (
	Fb = fiber.Config{
		CaseSensitive: true,
		StrictRouting: true,
		Views: Global.Engine,
	}
	Grm = gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		DryRun: false,
	}
)
