package Global

import (
	"gorm.io/gorm"
)

var (
	DB      *gorm.DB
	Devmode bool = false
)
