import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

const API_BASE = "http://localhost:8080";

function App() {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
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

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    return () => {
      chart.remove();
    };
  }, []);

  // =========================
  // LOAD INITIAL DATA
  // =========================
  const loadInitialChart = async () => {
    const res = await fetch(
      `${API_BASE}/api/candles/chart?symbol=PEPEUSDT&interval=15m&limit=100`
    );
    const json = await res.json();

    if (json.success && seriesRef.current) {
      seriesRef.current.setData(json.data);
    }
  };

  useEffect(() => {
    loadInitialChart();
  }, []);

  // =========================
  // REAL-TIME UPDATE
  // =========================
  useEffect(() => {
    if (!seriesRef.current) return;

    realtimeTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/candles/latest?symbol=PEPEUSDT&interval=15m`
        );
        const json = await res.json();

        if (json.success && json.data) {
          // 🔥 REAL-TIME UPDATE
          seriesRef.current.update(json.data);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000); // setiap 2 detik

    return () => {
      clearInterval(realtimeTimerRef.current);
    };
  }, []);

  // =========================
  // TABLE DATA
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
    <div style={{ padding: 20 }}>
      <h1>Real-Time Candle Dashboard</h1>

      <h2>Candlestick (Live)</h2>
      <div ref={chartContainerRef} />

      <hr />

      <h2>Candle Table</h2>
      <table border="1" cellPadding="6" width="100%">
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

      <br />

      <button onClick={() => setPage(p => Math.max(p - 1, 1))}>
        Prev
      </button>
      <button onClick={() => setPage(p => p + 1)}>
        Next
      </button>
    </div>
  );
}

export default App;
