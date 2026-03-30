package models

import (
	"time"

	"gorm.io/gorm"
)

type TournamentStatus string

const (
	TournamentOpen       TournamentStatus = "open"
	TournamentInProgress TournamentStatus = "in_progress"
	TournamentFinished   TournamentStatus = "finished"
)

type Tournament struct {
	gorm.Model
	Name        string           `gorm:"not null" json:"name"`
	Description string           `json:"description"`
	MaxPlayers  int              `gorm:"default:16" json:"max_players"`
	Status      TournamentStatus `gorm:"default:'open'" json:"status"`
	StartDate   *time.Time       `json:"start_date,omitempty"`
	EndDate     *time.Time       `json:"end_date,omitempty"`
	WinnerID    *uint            `json:"winner_id,omitempty"`
	Winner      *Player          `gorm:"foreignKey:WinnerID" json:"winner,omitempty"`
	Matches     []Match          `gorm:"foreignKey:TournamentID" json:"matches,omitempty"`
	CreatedAt   time.Time        `json:"created_at"`
}

type TournamentParticipant struct {
	gorm.Model
	TournamentID uint       `json:"tournament_id"`
	PlayerID     uint       `json:"player_id"`
	Player       Player     `gorm:"foreignKey:PlayerID" json:"player,omitempty"`
	JoinedAt     time.Time  `json:"joined_at"`
}
