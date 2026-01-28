package services

import (
	"strconv"
	"time"

	"candle-service/models"
	"candle-service/repositories"
)

func FetchAndSaveCandles(symbol, interval string, limit int) (int, int, error) {
	client := NewBinanceClient()

	rawCandles, err := client.FetchCandles(symbol, interval, limit)
	if err != nil {
		return 0, 0, err
	}

	saved := 0
	skipped := 0

	for _, d := range rawCandles {
		openTime := time.UnixMilli(int64(d[0].(float64)))
		closeTime := time.UnixMilli(int64(d[6].(float64)))

		open, _ := strconv.ParseFloat(d[1].(string), 64)
		high, _ := strconv.ParseFloat(d[2].(string), 64)
		low, _ := strconv.ParseFloat(d[3].(string), 64)
		closePrice, _ := strconv.ParseFloat(d[4].(string), 64)
		volume, _ := strconv.ParseFloat(d[5].(string), 64)

		candle := models.Candle{
			Symbol:    symbol,
			Interval:  interval,
			OpenTime:  openTime,
			CloseTime: closeTime,
			Open:      open,
			High:      high,
			Low:       low,
			Close:     closePrice,
			Volume:    volume,
		}

		err := repositories.InsertCandle(candle)
		if err != nil {
			skipped++
			continue
		}

		saved++
	}

	return saved, skipped, nil
}

func SaveCandlesFromBinance() (int, int, error) {
	client := NewBinanceClient()
	data, err := client.FetchCandles("PEPEUSDT", "15m", 100)
	if err != nil {
		return 0, 0, err
	}

	saved := 0
	skipped := 0

	for _, d := range data {
		openTime := time.UnixMilli(int64(d[0].(float64)))
		closeTime := time.UnixMilli(int64(d[6].(float64)))

		open, _ := strconv.ParseFloat(d[1].(string), 64)
		high, _ := strconv.ParseFloat(d[2].(string), 64)
		low, _ := strconv.ParseFloat(d[3].(string), 64)
		closePrice, _ := strconv.ParseFloat(d[4].(string), 64)
		volume, _ := strconv.ParseFloat(d[5].(string), 64)

		candle := models.Candle{
			Symbol:    "PEPEUSDT",
			Interval:  "15m",
			OpenTime:  openTime,
			CloseTime: closeTime,
			Open:      open,
			High:      high,
			Low:       low,
			Close:     closePrice,
			Volume:    volume,
		}

		err := repositories.InsertCandle(candle)
		if err != nil {
			// duplicate → dianggap skip
			skipped++
			continue
		}

		saved++
	}

	return saved, skipped, nil
}

func GetCandleTable(page, limit int, order string) ([]models.Candle, int, error) {
	if page < 1 {
		page = 1
	}
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit
	return repositories.GetCandles(limit, offset, order)
}

func GetCandleChart(symbol, interval string, limit int) ([]models.Candle, error) {
	if symbol == "" {
		symbol = "PEPEUSDT"
	}
	if interval == "" {
		interval = "15m"
	}
	if limit <= 0 || limit > 500 {
		limit = 100
	}

	return repositories.GetCandlesForChart(symbol, interval, limit)
}
