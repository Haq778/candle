package services

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type BinanceCandle struct {
	OpenTime int64  `json:"open_time"`
	Open     string `json:"open"`
	High     string `json:"high"`
	Low      string `json:"low"`
	Close    string `json:"close"`
	Volume   string `json:"volume"`
}

func FetchCandles(symbol, interval string, limit int) ([]BinanceCandle, error) {
	url := fmt.Sprintf(
		"https://testnet.binance.vision/api/v3/klines?symbol=%s&interval=%s&limit=%d",
		symbol, interval, limit,
	)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var raw [][]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, err
	}

	candles := make([]BinanceCandle, 0)

	for _, r := range raw {
		candles = append(candles, BinanceCandle{
			OpenTime: int64(r[0].(float64)),
			Open:     r[1].(string),
			High:     r[2].(string),
			Low:      r[3].(string),
			Close:    r[4].(string),
			Volume:   r[5].(string),
		})
	}

	return candles, nil
}
