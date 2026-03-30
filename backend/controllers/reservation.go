package controllers

import (
	"net/http"
	"time"

	"babyconnect/config"
	"babyconnect/models"

	"github.com/gin-gonic/gin"
)

type CreateReservationInput struct {
	PlayerID  uint      `json:"player_id" binding:"required"`
	TableID   uint      `json:"table_id" binding:"required"`
	StartTime time.Time `json:"start_time" binding:"required"`
	EndTime   time.Time `json:"end_time" binding:"required"`
	Notes     string    `json:"notes"`
}

func CreateReservation(c *gin.Context) {
	var input CreateReservationInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.EndTime.Before(input.StartTime) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End time must be after start time"})
		return
	}
	if input.StartTime.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot reserve in the past"})
		return
	}

	// Check for conflicts
	var conflictCount int64
	config.DB.Model(&models.Reservation{}).
		Where("table_id = ? AND status NOT IN ('cancelled') AND ((start_time <= ? AND end_time >= ?) OR (start_time <= ? AND end_time >= ?) OR (start_time >= ? AND end_time <= ?))",
			input.TableID,
			input.StartTime, input.StartTime,
			input.EndTime, input.EndTime,
			input.StartTime, input.EndTime,
		).Count(&conflictCount)

	if conflictCount > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Table already reserved for this time slot"})
		return
	}

	reservation := models.Reservation{
		PlayerID:  input.PlayerID,
		TableID:   input.TableID,
		StartTime: input.StartTime,
		EndTime:   input.EndTime,
		Notes:     input.Notes,
		Status:    models.ReservationConfirmed,
	}

	if err := config.DB.Create(&reservation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reservation"})
		return
	}

	config.DB.Preload("Player").Preload("Table").First(&reservation, reservation.ID)
	c.JSON(http.StatusCreated, gin.H{"reservation": reservation})
}

func GetReservations(c *gin.Context) {
	tableID := c.Query("table_id")
	playerID := c.Query("player_id")

	query := config.DB.Preload("Player").Preload("Table").Order("start_time ASC")

	if tableID != "" {
		query = query.Where("table_id = ?", tableID)
	}
	if playerID != "" {
		query = query.Where("player_id = ?", playerID)
	}

	// Only future reservations by default
	if c.Query("all") == "" {
		query = query.Where("end_time > ?", time.Now())
	}

	var reservations []models.Reservation
	query.Find(&reservations)

	c.JSON(http.StatusOK, gin.H{"reservations": reservations, "count": len(reservations)})
}

func CancelReservation(c *gin.Context) {
	id := c.Param("id")
	var reservation models.Reservation
	if err := config.DB.First(&reservation, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reservation not found"})
		return
	}

	config.DB.Model(&reservation).Update("status", models.ReservationCancelled)
	c.JSON(http.StatusOK, gin.H{"message": "Reservation cancelled"})
}

func GetTables(c *gin.Context) {
	var tables []models.Table
	config.DB.Find(&tables)
	c.JSON(http.StatusOK, gin.H{"tables": tables, "count": len(tables)})
}
