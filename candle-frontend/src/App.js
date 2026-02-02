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

  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);

  // =========================
  // INIT CHART (SAFE)
  // =========================
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 420,
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
        secondsVisible: false,
      },
    });

    // Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    // Line Series
    const lineSeries = chart.addSeries(LineSeries, {
      color: "#2563eb",
      lineWidth: 2,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    lineSeriesRef.current = lineSeries;

    // ✅ Resize Responsive Fix
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
  // LOAD CHART DATA (SAFE)
  // =========================
  const loadChartData = async () => {
    try {
      // ✅ Pastikan chart sudah siap
      if (!candleSeriesRef.current || !lineSeriesRef.current) return;

      const res = await fetch(
        `${API_BASE}/api/candles/chart?symbol=PEPEUSDT&interval=15m&limit=100`
      );

      const json = await res.json();

      // ✅ Validasi Data
      if (!json.success || !Array.isArray(json.data)) {
        console.warn("Chart data kosong atau error");
        return;
      }

      // ✅ Set Data Candlestick
      candleSeriesRef.current.setData(json.data);

      // ✅ Set Data Line Close Price
      const lineData = json.data.map((c) => ({
        time: c.time,
        value: c.close,
      }));

      lineSeriesRef.current.setData(lineData);
    } catch (err) {
      console.error("Chart Load Error:", err);
    }
  };

  // =========================
  // FIRST LOAD (AFTER CHART READY)
  // =========================
  useEffect(() => {
    const timer = setTimeout(() => {
      loadChartData();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // =========================
  // AUTO REFRESH
  // =========================
  useEffect(() => {
    const timer = setInterval(() => {
      loadChartData();
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  // =========================
  // TABLE PAGINATION
  // =========================
  useEffect(() => {
    fetch(`${API_BASE}/api/candles?page=${page}&limit=10`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setTableData(res.data);
        }
      })
      .catch((err) => console.error("Table Error:", err));
  }, [page]);

  return (
    <div className="dashboard">
      <h1 className="title">Real-Time Candle Dashboard</h1>

      {/* ========================= */}
      {/* CHART */}
      {/* ========================= */}
      <h2 className="subtitle">Candlestick + Close Price</h2>

      <div className="card chart-card">
        <div ref={chartContainerRef} className="chart-wrapper" />
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
            {tableData.length === 0 ? (
              <tr>
                <td colSpan="8" className="nodata">
                  No Data Available
                </td>
              </tr>
            ) : (
              tableData.map((c, i) => (
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
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
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
