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
			&models.Client{},
			&models.Owner{},
			&models.Rating{},
			&models.Review{},
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
			ADD CONSTRAINT "fk_animals_clients" 
			FOREIGN KEY ("client_id") 
			REFERENCES "clients"("id") 
			ON DELETE CASCADE;

			-- Services table constraints
			ALTER TABLE "services" 
			ADD CONSTRAINT "fk_services_owners" 
			FOREIGN KEY ("owner_id") 
			REFERENCES "owners"("id") 
			ON DELETE CASCADE;

			-- Reviews table constraints
			ALTER TABLE "reviews" 
			ADD CONSTRAINT "fk_reviews_clients" 
			FOREIGN KEY ("client_id") 
			REFERENCES "clients"("id") 
			ON DELETE CASCADE;
			
			ALTER TABLE "reviews" 
			ADD CONSTRAINT "fk_reviews_owners" 
			FOREIGN KEY ("owner_id") 
			REFERENCES "owners"("id") 
			ON DELETE CASCADE;

			-- Ratings table constraints
			ALTER TABLE "ratings" 
			ADD CONSTRAINT "fk_ratings_clients" 
			FOREIGN KEY ("client_id") 
			REFERENCES "clients"("id") 
			ON DELETE CASCADE;
			
			ALTER TABLE "ratings" 
			ADD CONSTRAINT "fk_ratings_owners" 
			FOREIGN KEY ("owner_id") 
			REFERENCES "owners"("id") 
			ON DELETE CASCADE;
			
			-- Client-Appointment many-to-many table constraints
			ALTER TABLE "client_appointments" 
			ADD CONSTRAINT "fk_client_appointments_clients" 
			FOREIGN KEY ("client_id") 
			REFERENCES "clients"("id") 
			ON DELETE CASCADE;
			
			ALTER TABLE "client_appointments" 
			ADD CONSTRAINT "fk_client_appointments_appointments" 
			FOREIGN KEY ("appointment_id") 
			REFERENCES "appointments"("id") 
			ON DELETE CASCADE;
			
			-- Owner-Appointment many-to-many table constraints
			ALTER TABLE "owner_appointments" 
			ADD CONSTRAINT "fk_owner_appointments_owners" 
			FOREIGN KEY ("owner_id") 
			REFERENCES "owners"("id") 
			ON DELETE CASCADE;
			
			ALTER TABLE "owner_appointments" 
			ADD CONSTRAINT "fk_owner_appointments_appointments" 
			FOREIGN KEY ("appointment_id") 
			REFERENCES "appointments"("id") 
			ON DELETE CASCADE;
			
			-- Service-Appointment many-to-many table constraints
			ALTER TABLE "appointment_services" 
			ADD CONSTRAINT "fk_appointment_services_services" 
			FOREIGN KEY ("service_id") 
			REFERENCES "services"("id") 
			ON DELETE CASCADE;
			
			ALTER TABLE "appointment_services" 
			ADD CONSTRAINT "fk_appointment_services_appointments" 
			FOREIGN KEY ("appointment_id") 
			REFERENCES "appointments"("id") 
			ON DELETE CASCADE;
			
			-- Animal-Appointment many-to-many table constraints
			ALTER TABLE "animal_appointments" 
			ADD CONSTRAINT "fk_animal_appointments_animals" 
			FOREIGN KEY ("animal_id") 
			REFERENCES "animals"("id") 
			ON DELETE CASCADE;
			
			ALTER TABLE "animal_appointments" 
			ADD CONSTRAINT "fk_animal_appointments_appointments" 
			FOREIGN KEY ("appointment_id") 
			REFERENCES "appointments"("id") 
			ON DELETE CASCADE;
			
			-- Google token storage constraints
			ALTER TABLE "google_token_storages" 
			ADD CONSTRAINT "fk_google_token_storages_owners" 
			FOREIGN KEY ("owner_id")
			REFERENCES "owners"("id") 
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
