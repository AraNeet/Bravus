package handlers

import (
	"os"
	"time"

	"github.com/AramisAra/BravusBackend/Global"
	"github.com/AramisAra/BravusBackend/config"
	"github.com/AramisAra/BravusBackend/models"
	googleModels "github.com/AramisAra/BravusBackend/models/google"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"log"
)

func ConnectPostgresDB() *gorm.DB {
	db, err := gorm.Open(postgres.Open(os.Getenv("DB")), &config.Grm)
	if err != nil {
		log.Fatal("Failed to connect to database")
	}

	if Global.Devmode {
		// First, migrate without foreign key constraints
		err = db.AutoMigrate(
			&models.User{},
			&models.Animal{},
			&models.Service{},
			&models.Appointment{},
			&googleModels.GoogleTokenStorage{},
		)
		if err != nil {
			log.Fatal("Failed to migrate database")
		}

		// Then, add foreign key constraints that aren't automatically created by GORM
		sqlDB := db.Exec(`
			-- Animals table constraints
			ALTER TABLE "animals" 
			ADD CONSTRAINT "fk_animals_users" 
			FOREIGN KEY ("owner_id") 
			REFERENCES "users"("id") 
			ON DELETE CASCADE;

			-- Services table constraints
			ALTER TABLE "services" 
			ADD CONSTRAINT "fk_services_users" 
			FOREIGN KEY ("user_id") 
			REFERENCES "users"("id") 
			ON DELETE CASCADE;

			-- Appointments table constraints
			ALTER TABLE "appointments" 
			ADD CONSTRAINT "fk_appointments_services" 
			FOREIGN KEY ("service_id") 
			REFERENCES "services"("id") 
			ON DELETE CASCADE;
			
			-- Google token storage constraints
			ALTER TABLE "google_token_storages" 
			ADD CONSTRAINT "fk_google_token_storages_users" 
			FOREIGN KEY ("user_id") 
			REFERENCES "users"("id") 
			ON DELETE CASCADE;
		`)
		if sqlDB.Error != nil {
			log.Printf("Warning: Some foreign key constraints could not be added: %v", sqlDB.Error)
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
