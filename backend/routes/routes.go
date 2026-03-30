package routes

import (
	"babyconnect/controllers"
	"babyconnect/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	r.Use(middleware.CORSMiddleware())

	api := r.Group("/api/v1")
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "service": "BabyConnect API"})
		})

		// Players
		players := api.Group("/players")
		{
			players.POST("/register", controllers.Register)
			players.GET("", controllers.GetPlayers)
			players.GET("/:id", controllers.GetPlayer)
			players.GET("/:id/stats", controllers.GetPlayerStats)
		}

		// Matches
		matches := api.Group("/matches")
		{
			matches.POST("", controllers.CreateMatch)
			matches.GET("", controllers.GetMatches)
			matches.GET("/:id", controllers.GetMatch)
			matches.PATCH("/:id/score", controllers.UpdateScore)
			matches.POST("/:id/finish", controllers.FinishMatch)
		}

		// Reservations
		reservations := api.Group("/reservations")
		{
			reservations.POST("", controllers.CreateReservation)
			reservations.GET("", controllers.GetReservations)
			reservations.DELETE("/:id", controllers.CancelReservation)
		}

		// Tables
		api.GET("/tables", controllers.GetTables)

		// Tournaments
		tournaments := api.Group("/tournaments")
		{
			tournaments.POST("", controllers.CreateTournament)
			tournaments.GET("", controllers.GetTournaments)
			tournaments.GET("/:id", controllers.GetTournament)
			tournaments.POST("/:id/join", controllers.JoinTournament)
		}

		// Leaderboard & Stats
		api.GET("/leaderboard", controllers.GetLeaderboard)
		api.GET("/stats", controllers.GetStats)
	}
}
