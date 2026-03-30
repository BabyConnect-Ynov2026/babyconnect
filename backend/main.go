package main

import (
	"log"
	"os"

	"babyconnect/config"
	"babyconnect/models"
	"babyconnect/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadEnv()
	config.ConnectDB()

	// Auto migrate all models
	if err := config.DB.AutoMigrate(
		&models.Player{},
		&models.Table{},
		&models.Match{},
		&models.Reservation{},
		&models.Tournament{},
		&models.TournamentParticipant{},
	); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Seed default tables if none exist
	seedTables()

	r := gin.Default()
	routes.SetupRoutes(r)

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("BabyConnect API running on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func seedTables() {
	var count int64
	config.DB.Model(&models.Table{}).Count(&count)
	if count > 0 {
		return
	}

	tables := []models.Table{
		{Name: "Table 1", Location: "Souk - Rez-de-chaussée", Available: true},
		{Name: "Table 2", Location: "Souk - Rez-de-chaussée", Available: true},
		{Name: "Table 3", Location: "Souk - 1er étage", Available: true},
	}

	for _, t := range tables {
		config.DB.Create(&t)
	}
	log.Println("Seeded default tables")
}
