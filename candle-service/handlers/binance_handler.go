package handlers

import (
	"net/http"

	"candle-service/services"
	"github.com/gin-gonic/gin"
)

func TestBinanceHandler(c *gin.Context) {
	client := services.NewBinanceClient()

	data, err := client.FetchCandles("PEPEUSDT", "15m", 100)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"count": len(data),
		"data":  data,
	})
}
