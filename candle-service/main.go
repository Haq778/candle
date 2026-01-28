package main

import (
	"log"
	"time"

	"candle-service/database"
	"candle-service/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load env
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env")
	}

	// Connect DB
	if err := database.Connect(); err != nil {
		log.Fatal("Database connection failed:", err)
	}

	r := gin.Default()

	// =====================
	// ✅ CORS CONFIG (WAJIB untuk React)
	// =====================
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// =====================
	// ROUTES
	// =====================
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// Fetch from Binance & save
	r.POST("/api/candles/fetch", handlers.FetchCandlesHandler)

	// Table / pagination view
	r.GET("/api/candles", handlers.GetCandlesHandler)

	// Chart (time-series ringan)
	r.GET("/api/candles/chart", handlers.GetCandleChartHandler)

	log.Println("Server running on port 8080")
	r.Run(":8080")
}
