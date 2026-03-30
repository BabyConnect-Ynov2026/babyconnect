package controllers

import (
	"net/http"
	"time"

	"babyconnect/config"
	"babyconnect/models"

	"github.com/gin-gonic/gin"
)

type CreateMatchInput struct {
	TableID     uint  `json:"table_id" binding:"required"`
	RedTeamID1  uint  `json:"red_team_id_1" binding:"required"`
	RedTeamID2  *uint `json:"red_team_id_2"`
	BlueTeamID1 uint  `json:"blue_team_id_1" binding:"required"`
	BlueTeamID2 *uint `json:"blue_team_id_2"`
}

type UpdateScoreInput struct {
	RedScore  int `json:"red_score" binding:"min=0"`
	BlueScore int `json:"blue_score" binding:"min=0"`
}

func CreateMatch(c *gin.Context) {
	var input CreateMatchInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	match := models.Match{
		TableID:     input.TableID,
		RedTeamID1:  input.RedTeamID1,
		RedTeamID2:  input.RedTeamID2,
		BlueTeamID1: input.BlueTeamID1,
		BlueTeamID2: input.BlueTeamID2,
		Status:      models.MatchStatusOngoing,
		StartedAt:   &now,
	}

	// Mark table as unavailable
	config.DB.Model(&models.Table{}).Where("id = ?", input.TableID).Update("available", false)

	if err := config.DB.Create(&match).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create match"})
		return
	}

	config.DB.Preload("RedPlayer1").Preload("BluePlayer1").First(&match, match.ID)
	c.JSON(http.StatusCreated, gin.H{"match": match})
}

func UpdateScore(c *gin.Context) {
	id := c.Param("id")
	var match models.Match
	if err := config.DB.First(&match, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
		return
	}

	var input UpdateScoreInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	match.RedScore = input.RedScore
	match.BlueScore = input.BlueScore
	config.DB.Save(&match)

	c.JSON(http.StatusOK, gin.H{"match": match})
}

func FinishMatch(c *gin.Context) {
	id := c.Param("id")
	var match models.Match
	if err := config.DB.Preload("RedPlayer1").Preload("BluePlayer1").First(&match, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
		return
	}

	now := time.Now()
	match.Status = models.MatchStatusCompleted
	match.FinishedAt = &now
	if match.StartedAt != nil {
		match.Duration = int(now.Sub(*match.StartedAt).Seconds())
	}

	// Update player stats and ELO
	updatePlayerStats(&match)

	// Mark table as available again
	config.DB.Model(&models.Table{}).Where("id = ?", match.TableID).Update("available", true)

	config.DB.Save(&match)
	c.JSON(http.StatusOK, gin.H{"match": match})
}

func GetMatches(c *gin.Context) {
	var matches []models.Match
	config.DB.Preload("RedPlayer1").Preload("BluePlayer1").
		Order("created_at DESC").Limit(50).Find(&matches)
	c.JSON(http.StatusOK, gin.H{"matches": matches, "count": len(matches)})
}

func GetMatch(c *gin.Context) {
	id := c.Param("id")
	var match models.Match
	if err := config.DB.Preload("RedPlayer1").Preload("BluePlayer1").Preload("Table").First(&match, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"match": match})
}

// ELO rating system
func calculateElo(playerRating, opponentRating, score float64) int {
	k := 32.0
	expected := 1.0 / (1.0 + pow10((opponentRating-playerRating)/400.0))
	return int(float64(playerRating) + k*(score-expected))
}

func pow10(x float64) float64 {
	result := 1.0
	for i := 0; i < 10; i++ {
		result *= 10
	}
	// Simple approximation for small values
	if x == 0 {
		return 1
	}
	// Use iterative approach
	base := 10.0
	exp := x
	res := 1.0
	for exp > 0 {
		if exp >= 1 {
			res *= base
			exp--
		} else {
			res *= 1.0 + exp*(base-1.0)
			break
		}
	}
	for exp < 0 {
		res /= base
		exp++
	}
	return res
}

func updatePlayerStats(match *models.Match) {
	redWon := match.RedScore > match.BlueScore

	var redScore, blueScore float64
	if redWon {
		redScore = 1.0
		blueScore = 0.0
	} else if match.RedScore == match.BlueScore {
		redScore = 0.5
		blueScore = 0.5
	} else {
		redScore = 0.0
		blueScore = 1.0
	}

	// Update Red player 1
	var red1 models.Player
	if err := config.DB.First(&red1, match.RedTeamID1).Error; err == nil {
		newElo := calculateElo(float64(red1.EloRating), float64(match.BluePlayer1.EloRating), redScore)
		updates := map[string]interface{}{
			"elo_rating": newElo,
			"goals":      red1.Goals + match.RedScore,
		}
		if redWon {
			updates["wins"] = red1.Wins + 1
		} else if match.RedScore == match.BlueScore {
			updates["draws"] = red1.Draws + 1
		} else {
			updates["losses"] = red1.Losses + 1
		}
		config.DB.Model(&red1).Updates(updates)
	}

	// Update Blue player 1
	var blue1 models.Player
	if err := config.DB.First(&blue1, match.BlueTeamID1).Error; err == nil {
		newElo := calculateElo(float64(blue1.EloRating), float64(match.RedPlayer1.EloRating), blueScore)
		updates := map[string]interface{}{
			"elo_rating": newElo,
			"goals":      blue1.Goals + match.BlueScore,
		}
		if !redWon && match.RedScore != match.BlueScore {
			updates["wins"] = blue1.Wins + 1
		} else if match.RedScore == match.BlueScore {
			updates["draws"] = blue1.Draws + 1
		} else {
			updates["losses"] = blue1.Losses + 1
		}
		config.DB.Model(&blue1).Updates(updates)
	}
}
