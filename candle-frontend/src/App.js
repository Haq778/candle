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
  // INIT CHART RESPONSIVE FIX
  // =========================
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 420,

      layout: {
        background: { color: "transparent" },
        textColor: "#dbeafe",
      },

      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },

      timeScale: {
        timeVisible: true,
        borderColor: "rgba(255,255,255,0.08)",
      },
    });

    // Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#4ade80",
      downColor: "#f87171",
      borderVisible: false,
      wickUpColor: "#4ade80",
      wickDownColor: "#f87171",
    });

    // Line Series (Close Curve)
    const lineSeries = chart.addSeries(LineSeries, {
      color: "#a78bfa",
      lineWidth: 2,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    lineSeriesRef.current = lineSeries;

    // ✅ FIX RESPONSIVE RESIZE
    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
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

      if (json.success && Array.isArray(json.data)) {
        candleSeriesRef.current.setData(json.data);

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
  // REALTIME UPDATE
  // =========================
  useEffect(() => {
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
  // TABLE PAGINATION
  // =========================
  useEffect(() => {
    fetch(`${API_BASE}/api/candles?page=${page}&limit=10`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setTableData(json.data);
        } else {
          setTableData([]);
        }
      });
  }, [page]);

  return (
    <div className="dashboard">
      {/* HEADER */}
      <div className="header">
        <h1 className="title">Candle Market Dashboard</h1>
        <p className="desc">
          Real-time candlestick monitoring with premium modern UI ✨
        </p>
      </div>

      {/* CHART */}
      <h2 className="subtitle">Live Price Chart</h2>

      <div className="card chart-card">
        <div className="chart-wrapper" ref={chartContainerRef}></div>
      </div>

      {/* TABLE */}
      <h2 className="subtitle">Candle Data Table</h2>

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
            {tableData.length > 0 ? (
              tableData.map((c, i) => (
                <tr key={i}>
                  <td>{c.symbol}</td>
                  <td>{c.interval}</td>
                  <td>{c.open}</td>
                  <td>{c.high}</td>
                  <td>{c.low}</td>
                  <td>{c.close}</td>
                  <td>{c.volume}</td>
                  <td>{new Date(c.open_time).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="nodata">
                  No Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="pagination">
          <button onClick={() => setPage((p) => Math.max(p - 1, 1))}>
            Prev
          </button>

          <span className="pageinfo">Page {page}</span>

          <button onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default App;
