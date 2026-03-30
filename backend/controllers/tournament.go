package controllers

import (
	"net/http"

	"babyconnect/config"
	"babyconnect/models"

	"github.com/gin-gonic/gin"
)

type CreateTournamentInput struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	MaxPlayers  int    `json:"max_players"`
}

func CreateTournament(c *gin.Context) {
	var input CreateTournamentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	maxPlayers := input.MaxPlayers
	if maxPlayers == 0 {
		maxPlayers = 16
	}

	tournament := models.Tournament{
		Name:        input.Name,
		Description: input.Description,
		MaxPlayers:  maxPlayers,
		Status:      models.TournamentOpen,
	}

	if err := config.DB.Create(&tournament).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tournament"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"tournament": tournament})
}

func GetTournaments(c *gin.Context) {
	var tournaments []models.Tournament
	config.DB.Preload("Winner").Order("created_at DESC").Find(&tournaments)

	// Add participant count
	type TournamentWithCount struct {
		models.Tournament
		ParticipantCount int64 `json:"participant_count"`
	}

	result := make([]TournamentWithCount, len(tournaments))
	for i, t := range tournaments {
		var count int64
		config.DB.Model(&models.TournamentParticipant{}).
			Where("tournament_id = ?", t.ID).Count(&count)
		result[i] = TournamentWithCount{Tournament: t, ParticipantCount: count}
	}

	c.JSON(http.StatusOK, gin.H{"tournaments": result, "count": len(result)})
}

func GetTournament(c *gin.Context) {
	id := c.Param("id")
	var tournament models.Tournament
	if err := config.DB.Preload("Winner").Preload("Matches").First(&tournament, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tournament not found"})
		return
	}

	var participants []models.TournamentParticipant
	config.DB.Preload("Player").Where("tournament_id = ?", id).Find(&participants)

	c.JSON(http.StatusOK, gin.H{
		"tournament":   tournament,
		"participants": participants,
	})
}

func JoinTournament(c *gin.Context) {
	tournamentID := c.Param("id")
	var tournament models.Tournament
	if err := config.DB.First(&tournament, tournamentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tournament not found"})
		return
	}

	if tournament.Status != models.TournamentOpen {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tournament is not open for registration"})
		return
	}

	var input struct {
		PlayerID uint `json:"player_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check max players
	var count int64
	config.DB.Model(&models.TournamentParticipant{}).
		Where("tournament_id = ?", tournamentID).Count(&count)
	if int(count) >= tournament.MaxPlayers {
		c.JSON(http.StatusConflict, gin.H{"error": "Tournament is full"})
		return
	}

	// Check if already registered
	var existing models.TournamentParticipant
	if err := config.DB.Where("tournament_id = ? AND player_id = ?", tournamentID, input.PlayerID).
		First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Player already registered"})
		return
	}

	participant := models.TournamentParticipant{
		TournamentID: tournament.ID,
		PlayerID:     input.PlayerID,
	}
	config.DB.Create(&participant)
	c.JSON(http.StatusCreated, gin.H{"message": "Successfully joined tournament"})
}
