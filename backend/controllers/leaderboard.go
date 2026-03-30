package controllers

import (
	"net/http"

	"babyconnect/config"
	"babyconnect/models"

	"github.com/gin-gonic/gin"
)

type LeaderboardEntry struct {
	Rank      int            `json:"rank"`
	Player    models.Player  `json:"player"`
	WinRate   float64        `json:"win_rate"`
	TotalGames int           `json:"total_games"`
}

func GetLeaderboard(c *gin.Context) {
	var players []models.Player
	config.DB.Order("elo_rating DESC").Limit(100).Find(&players)

	leaderboard := make([]LeaderboardEntry, len(players))
	for i, p := range players {
		leaderboard[i] = LeaderboardEntry{
			Rank:       i + 1,
			Player:     p,
			WinRate:    p.WinRate(),
			TotalGames: p.Wins + p.Losses + p.Draws,
		}
	}

	c.JSON(http.StatusOK, gin.H{"leaderboard": leaderboard})
}

func GetStats(c *gin.Context) {
	var totalPlayers int64
	var totalMatches int64
	var ongoingMatches int64

	config.DB.Model(&models.Player{}).Count(&totalPlayers)
	config.DB.Model(&models.Match{}).Where("status = ?", models.MatchStatusCompleted).Count(&totalMatches)
	config.DB.Model(&models.Match{}).Where("status = ?", models.MatchStatusOngoing).Count(&ongoingMatches)

	// Top scorer
	var topScorer models.Player
	config.DB.Order("goals DESC").First(&topScorer)

	// Most active player
	var mostActive models.Player
	config.DB.Order("wins + losses + draws DESC").First(&mostActive)

	c.JSON(http.StatusOK, gin.H{
		"total_players":   totalPlayers,
		"total_matches":   totalMatches,
		"ongoing_matches": ongoingMatches,
		"top_scorer":      topScorer,
		"most_active":     mostActive,
	})
}
