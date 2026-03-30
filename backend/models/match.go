package models

import (
	"time"

	"gorm.io/gorm"
)

type MatchStatus string

const (
	MatchStatusPending   MatchStatus = "pending"
	MatchStatusOngoing   MatchStatus = "ongoing"
	MatchStatusCompleted MatchStatus = "completed"
)

type Match struct {
	gorm.Model
	TableID       uint        `json:"table_id"`
	Table         Table       `gorm:"foreignKey:TableID" json:"table,omitempty"`
	RedTeamID1    uint        `json:"red_team_id_1"`
	RedPlayer1    Player      `gorm:"foreignKey:RedTeamID1" json:"red_player_1,omitempty"`
	RedTeamID2    *uint       `json:"red_team_id_2,omitempty"`
	RedPlayer2    *Player     `gorm:"foreignKey:RedTeamID2" json:"red_player_2,omitempty"`
	BlueTeamID1   uint        `json:"blue_team_id_1"`
	BluePlayer1   Player      `gorm:"foreignKey:BlueTeamID1" json:"blue_player_1,omitempty"`
	BlueTeamID2   *uint       `json:"blue_team_id_2,omitempty"`
	BluePlayer2   *Player     `gorm:"foreignKey:BlueTeamID2" json:"blue_player_2,omitempty"`
	RedScore      int         `gorm:"default:0" json:"red_score"`
	BlueScore     int         `gorm:"default:0" json:"blue_score"`
	Status        MatchStatus `gorm:"default:'pending'" json:"status"`
	Duration      int         `json:"duration_seconds"`
	TournamentID  *uint       `json:"tournament_id,omitempty"`
	StartedAt     *time.Time  `json:"started_at,omitempty"`
	FinishedAt    *time.Time  `json:"finished_at,omitempty"`
	CreatedAt     time.Time   `json:"created_at"`
}

type Table struct {
	gorm.Model
	Name      string `gorm:"uniqueIndex;not null" json:"name"`
	Location  string `json:"location"`
	Available bool   `gorm:"default:true" json:"available"`
}
