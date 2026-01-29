import { useEffect, useRef, useState } from "react";
<<<<<<< HEAD
import {
  createChart,
  CandlestickSeries,
  LineSeries,
} from "lightweight-charts";
=======
import { createChart, CandlestickSeries } from "lightweight-charts";
>>>>>>> a210c546af0f8683213ff2eb3473e6356be92ec7

const API_BASE = "http://localhost:8080";

function App() {
  const chartContainerRef = useRef(null);
<<<<<<< HEAD

  const chartRef = useRef(null);

  const candleSeriesRef = useRef(null);
  const lineSeriesRef = useRef(null);

=======
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
>>>>>>> a210c546af0f8683213ff2eb3473e6356be92ec7
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

<<<<<<< HEAD
    // =========================
    // CANDLESTICK SERIES
    // =========================
=======
>>>>>>> a210c546af0f8683213ff2eb3473e6356be92ec7
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

<<<<<<< HEAD
    // =========================
    // LINE SERIES (CURVE)
    // =========================
    const lineSeries = chart.addSeries(LineSeries, {
      color: "blue",
      lineWidth: 2,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    lineSeriesRef.current = lineSeries;
=======
    chartRef.current = chart;
    seriesRef.current = candleSeries;
>>>>>>> a210c546af0f8683213ff2eb3473e6356be92ec7

    return () => {
      chart.remove();
    };
  }, []);

  // =========================
  // LOAD INITIAL DATA
  // =========================
  const loadInitialChart = async () => {
<<<<<<< HEAD
    try {
      const res = await fetch(
        `${API_BASE}/api/candles/chart?symbol=PEPEUSDT&interval=15m&limit=100`
      );

      const json = await res.json();

      if (json.success) {
        // Candlestick Data
        candleSeriesRef.current.setData(json.data);

        // Line Data (Close Curve)
        const lineData = json.data.map((c) => ({
          time: c.time,
          value: c.close,
        }));

        lineSeriesRef.current.setData(lineData);
      }
    } catch (err) {
      console.error("Initial Load Error:", err);
=======
    const res = await fetch(
      `${API_BASE}/api/candles/chart?symbol=PEPEUSDT&interval=15m&limit=100`
    );
    const json = await res.json();

    if (json.success && seriesRef.current) {
      seriesRef.current.setData(json.data);
>>>>>>> a210c546af0f8683213ff2eb3473e6356be92ec7
    }
  };

  useEffect(() => {
    loadInitialChart();
  }, []);

  // =========================
<<<<<<< HEAD
  // REAL-TIME UPDATE (15 DETIK)
  // =========================
  useEffect(() => {
    if (!candleSeriesRef.current || !lineSeriesRef.current) return;
=======
  // REAL-TIME UPDATE
  // =========================
  useEffect(() => {
    if (!seriesRef.current) return;
>>>>>>> a210c546af0f8683213ff2eb3473e6356be92ec7

    realtimeTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/candles/latest?symbol=PEPEUSDT&interval=15m`
        );
<<<<<<< HEAD

        const json = await res.json();

        if (json.success && json.data) {
          // Update Candle
          candleSeriesRef.current.update(json.data);

          // Update Line Curve
          lineSeriesRef.current.update({
            time: json.data.time,
            value: json.data.close,
          });
        }
      } catch (err) {
        console.error("Realtime Error:", err);
      }
    }, 15000); // ✅ setiap 15 detik

    return () => clearInterval(realtimeTimerRef.current);
  }, []);

  // =========================
  // TABLE DATA PAGINATION
=======
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
>>>>>>> a210c546af0f8683213ff2eb3473e6356be92ec7
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

<<<<<<< HEAD
      <h2>Candlestick + Kurva Close Price</h2>
=======
      <h2>Candlestick (Live)</h2>
>>>>>>> a210c546af0f8683213ff2eb3473e6356be92ec7
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
<<<<<<< HEAD

=======
>>>>>>> a210c546af0f8683213ff2eb3473e6356be92ec7
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

<<<<<<< HEAD
      <button onClick={() => setPage((p) => Math.max(p - 1, 1))}>
        Prev
      </button>

      <button onClick={() => setPage((p) => p + 1)}>
=======
      <button onClick={() => setPage(p => Math.max(p - 1, 1))}>
        Prev
      </button>
      <button onClick={() => setPage(p => p + 1)}>
>>>>>>> a210c546af0f8683213ff2eb3473e6356be92ec7
        Next
      </button>
    </div>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> a210c546af0f8683213ff2eb3473e6356be92ec7
