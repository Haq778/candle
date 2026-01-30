import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
} from "lightweight-charts";

import "./App.css";

const API_BASE = "http://localhost:8080";

function App() {
  const chartContainerRef = useRef(null);

  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const lineSeriesRef = useRef(null);

  const realtimeTimerRef = useRef(null);

  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);

  // =========================
  // INIT CHART
  // =========================
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#000",
      },
      grid: {
        vertLines: { color: "#eee" },
        horzLines: { color: "#eee" },
      },
      timeScale: {
        timeVisible: true,
      },
    });

    // =========================
    // CANDLESTICK SERIES
    // =========================
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    // =========================
    // LINE SERIES
    // =========================
    const lineSeries = chart.addSeries(LineSeries, {
      color: "#2563eb",
      lineWidth: 2,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    lineSeriesRef.current = lineSeries;

    return () => {
      chart.remove();
    };
  }, []);

  // =========================
  // LOAD INITIAL DATA
  // =========================
  const loadInitialChart = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/candles/chart?symbol=PEPEUSDT&interval=15m&limit=100`
      );

      const json = await res.json();

      if (json.success) {
        candleSeriesRef.current.setData(json.data);

        // Line Curve from Close Price
        const lineData = json.data.map((c) => ({
          time: c.time,
          value: c.close,
        }));

        lineSeriesRef.current.setData(lineData);
      }
    } catch (err) {
      console.error("Initial Load Error:", err);
    }
  };

  useEffect(() => {
    loadInitialChart();
  }, []);

  // =========================
  // REAL-TIME UPDATE
  // =========================
  useEffect(() => {
    if (!candleSeriesRef.current || !lineSeriesRef.current) return;

    realtimeTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/candles/latest?symbol=PEPEUSDT&interval=15m`
        );

        const json = await res.json();

        if (json.success && json.data) {
          candleSeriesRef.current.update(json.data);

          lineSeriesRef.current.update({
            time: json.data.time,
            value: json.data.close,
          });
        }
      } catch (err) {
        console.error("Realtime Error:", err);
      }
    }, 15000);

    return () => clearInterval(realtimeTimerRef.current);
  }, []);

  // =========================
  // TABLE DATA PAGINATION
  // =========================
  useEffect(() => {
    fetch(`${API_BASE}/api/candles?page=${page}&limit=10`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setTableData(res.data);
        }
      });
  }, [page]);

  return (
    <div className="dashboard">
      <h1 className="title">Real-Time Candle Dashboard</h1>

      {/* ========================= */}
      {/* CHART */}
      {/* ========================= */}
      <h2 className="subtitle">Candlestick + Kurva Close Price</h2>

      <div className="card chart-box">
        <div ref={chartContainerRef} />
      </div>

      {/* ========================= */}
      {/* TABLE */}
      {/* ========================= */}
      <h2 className="subtitle">Candle Table</h2>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Interval</th>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
              <th>Close</th>
              <th>Volume</th>
              <th>Open Time</th>
            </tr>
          </thead>

          <tbody>
            {tableData.map((c, i) => (
              <tr key={i}>
                <td>{c.Symbol}</td>
                <td>{c.Interval}</td>
                <td>{c.Open}</td>
                <td>{c.High}</td>
                <td>{c.Low}</td>
                <td>{c.Close}</td>
                <td>{c.Volume}</td>
                <td>{new Date(c.OpenTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION BUTTON */}
        <div className="pagination">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))}>
            Prev
          </button>

          <button onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default App;
