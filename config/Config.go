package config

import (
	"github.com/AramisAra/BravusBackend/Global"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

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
