package models

import (
	"time"

	"gorm.io/gorm"
)

type ReservationStatus string

const (
	ReservationPending   ReservationStatus = "pending"
	ReservationConfirmed ReservationStatus = "confirmed"
	ReservationCancelled ReservationStatus = "cancelled"
	ReservationCompleted ReservationStatus = "completed"
)

type Reservation struct {
	gorm.Model
	PlayerID  uint              `json:"player_id"`
	Player    Player            `gorm:"foreignKey:PlayerID" json:"player,omitempty"`
	TableID   uint              `json:"table_id"`
	Table     Table             `gorm:"foreignKey:TableID" json:"table,omitempty"`
	StartTime time.Time         `json:"start_time"`
	EndTime   time.Time         `json:"end_time"`
	Status    ReservationStatus `gorm:"default:'pending'" json:"status"`
	Notes     string            `json:"notes"`
	CreatedAt time.Time         `json:"created_at"`
}
