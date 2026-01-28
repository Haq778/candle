package handlers

import (
	"math"
	"net/http"
	"strconv"

	"candle-service/services"

	"github.com/gin-gonic/gin"
)

type FetchCandleRequest struct {
	Symbol   string `json:"symbol" binding:"required"`
	Interval string `json:"interval" binding:"required"`
	Limit    int    `json:"limit"`
}

/*
========================
POST /api/candles/fetch
========================
*/
func FetchCandlesHandler(c *gin.Context) {
	var req FetchCandleRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	if req.Limit <= 0 {
		req.Limit = 100
	}

	count, skipped, err := services.FetchAndSaveCandles(req.Symbol, req.Interval, req.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Candles fetched and saved",
		"meta": gin.H{
			"symbol":   req.Symbol,
			"interval": req.Interval,
			"saved":    count,
			"skipped":  skipped,
		},
	})
}

/*
========================
GET /api/candles (TABLE)
========================
*/
func GetCandlesHandler(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	order := c.DefaultQuery("order", "desc")

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}

	candles, total, err := services.GetCandleTable(page, limit, order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Candle table fetched",
		"meta": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
		},
		"data": candles,
	})
}

/*
========================
GET /api/candles/chart
========================
*/
func GetCandleChartHandler(c *gin.Context) {
	symbol := c.DefaultQuery("symbol", "PEPEUSDT")
	interval := c.DefaultQuery("interval", "15m")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

	if limit <= 0 {
		limit = 100
	}

	candles, err := services.GetCandleChart(symbol, interval, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// Format khusus chart
	var data []gin.H
	for _, c := range candles {
		data = append(data, gin.H{
			"time":   c.OpenTime.Unix(), // seconds
			"open":   c.Open,
			"high":   c.High,
			"low":    c.Low,
			"close":  c.Close,
			"volume": c.Volume,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Chart data fetched",
		"meta": gin.H{
			"symbol":   symbol,
			"interval": interval,
		},
		"data": data,
	})
}
