package handlers

import (
	"os"
	"time"

	"github.com/AramisAra/BravusBackend/Global"
	"github.com/AramisAra/BravusBackend/config"
	"github.com/AramisAra/BravusBackend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"log"
)

func ConnectPostgresDB() *gorm.DB {
	db, err := gorm.Open(postgres.Open(os.Getenv("DevDB")), &config.Grm)
	if err != nil {
		log.Fatal("Failed to connect to database")
	}

	if Global.Devmode {
		err = db.AutoMigrate(&models.User{}, &models.Animal{}, &models.Appointment{}, &models.Service{})
		if err != nil {
			log.Fatal("Failed to migrate database")
		}
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get sql database")
	}
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(10 * time.Second)
	return db
}
