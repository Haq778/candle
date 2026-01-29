package repositories

import (
	"candle-service/database"
	"candle-service/models"
)

func InsertCandle(c models.Candle) error {
	query := `
		INSERT INTO candles (
			symbol, interval, open_time, close_time,
			open, high, low, close, volume
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		ON CONFLICT (symbol, interval, open_time) DO NOTHING
	`

	_, err := database.DB.Exec(
		query,
		c.Symbol,
		c.Interval,
		c.OpenTime,
		c.CloseTime,
		c.Open,
		c.High,
		c.Low,
		c.Close,
		c.Volume,
	)

	return err
}

func GetCandles(limit, offset int, order string) ([]models.Candle, int, error) {
	if order != "asc" && order != "desc" {
		order = "desc"
	}

	query := `
		SELECT 
			symbol, interval, open_time, close_time,
			open, high, low, close, volume
		FROM candles
		ORDER BY open_time ` + order + `
		LIMIT $1 OFFSET $2
	`

	rows, err := database.DB.Query(query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var candles []models.Candle

	for rows.Next() {
		var c models.Candle
		if err := rows.Scan(
			&c.Symbol,
			&c.Interval,
			&c.OpenTime,
			&c.CloseTime,
			&c.Open,
			&c.High,
			&c.Low,
			&c.Close,
			&c.Volume,
		); err != nil {
			return nil, 0, err
		}
		candles = append(candles, c)
	}

	var total int
	err = database.DB.QueryRow("SELECT COUNT(*) FROM candles").Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	return candles, total, nil
}

func GetCandlesForChart(symbol, interval string, limit int) ([]models.Candle, error) {
	query := `
		SELECT 
			open_time,
			open,
			high,
			low,
			close,
			volume
		FROM candles
		WHERE symbol = $1 AND interval = $2
		ORDER BY open_time ASC
		LIMIT $3
	`

	rows, err := database.DB.Query(query, symbol, interval, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var candles []models.Candle

	for rows.Next() {
		var c models.Candle
		if err := rows.Scan(
			&c.OpenTime,
			&c.Open,
			&c.High,
			&c.Low,
			&c.Close,
			&c.Volume,
		); err != nil {
			return nil, err
		}
		candles = append(candles, c)
	}

	return candles, nil
}
