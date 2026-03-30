package models

import (
	"time"

	"gorm.io/gorm"
)

type Player struct {
	gorm.Model
	Username  string    `gorm:"uniqueIndex;not null" json:"username"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"not null" json:"-"`
	FullName  string    `json:"full_name"`
	AvatarURL string    `json:"avatar_url"`
	EloRating int       `gorm:"default:1000" json:"elo_rating"`
	Wins      int       `gorm:"default:0" json:"wins"`
	Losses    int       `gorm:"default:0" json:"losses"`
	Draws     int       `gorm:"default:0" json:"draws"`
	Goals     int       `gorm:"default:0" json:"goals"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (p *Player) WinRate() float64 {
	total := p.Wins + p.Losses + p.Draws
	if total == 0 {
		return 0
	}
	return float64(p.Wins) / float64(total) * 100
}
