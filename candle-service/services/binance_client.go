package services

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type BinanceClient struct {
	BaseURL string
}

func NewBinanceClient() *BinanceClient {
	return &BinanceClient{
		BaseURL: "https://testnet.binance.vision",
	}
}

func (b *BinanceClient) FetchCandles(symbol, interval string, limit int) ([][]interface{}, error) {
	url := fmt.Sprintf(
		"%s/api/v3/klines?symbol=%s&interval=%s&limit=%d",
		b.BaseURL,
		symbol,
		interval,
		limit,
	)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("binance API error: %s", resp.Status)
	}

	var data [][]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	return data, nil
}
