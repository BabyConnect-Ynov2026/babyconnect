package controllers

import (
	"net/http"

	"babyconnect/config"
	"babyconnect/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Username string `json:"username" binding:"required,min=3,max=30"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	player := models.Player{
		Username: input.Username,
		Email:    input.Email,
		Password: string(hash),
		FullName: input.FullName,
	}

	if err := config.DB.Create(&player).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username or email already exists"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"player": player})
}

func GetPlayers(c *gin.Context) {
	var players []models.Player
	config.DB.Order("elo_rating DESC").Find(&players)
	c.JSON(http.StatusOK, gin.H{"players": players, "count": len(players)})
}

func GetPlayer(c *gin.Context) {
	id := c.Param("id")
	var player models.Player
	if err := config.DB.First(&player, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"player": player})
}

func GetPlayerStats(c *gin.Context) {
	id := c.Param("id")
	var player models.Player
	if err := config.DB.First(&player, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
		return
	}

	var recentMatches []models.Match
	config.DB.Where("red_team_id_1 = ? OR red_team_id_2 = ? OR blue_team_id_1 = ? OR blue_team_id_2 = ?",
		id, id, id, id).
		Order("created_at DESC").Limit(10).
		Preload("RedPlayer1").Preload("BluePlayer1").
		Find(&recentMatches)

	c.JSON(http.StatusOK, gin.H{
		"player":         player,
		"win_rate":       player.WinRate(),
		"recent_matches": recentMatches,
	})
}
