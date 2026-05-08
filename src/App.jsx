import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GAS_URL = 'あなたのGASのURL';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  // 期間選択用の状態
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // クエリパラメータの構築
      let url = GAS_URL;
      if (startDate && endDate) {
        url += `?start=${startDate}&end=${endDate}`;
      }
      
      const response = await fetch(url);
      const rawData = await response.json();
      
      if (Array.isArray(rawData)) {
        const formattedData = rawData.map(item => ({
          time: String(item["日時"] || ""),
          temp: item["気温"] != null ? parseFloat(item["気温"]) : null,
          humi: item["湿度"] != null ? parseFloat(item["湿度"]) : null,
          pres: item["気圧"] != null ? parseFloat(item["気圧"]) : null
        }));
        setData(formattedData);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]); // 日付が変わったらフェッチ関数を更新

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latest = data.length > 0 ? data[data.length - 1] : null;

  const formatTimeOnly = (timeStr) => {
    if (!timeStr) return "--:--";
    const timeMatch = timeStr.match(/(\d{1,2}:\d{2})/);
    return timeMatch ? timeMatch[1] : timeStr.substring(11, 16);
  };

  const styles = {
    container: { width: '100%', height: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    header: { padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 },
    dateControls: { display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.8rem' },
    input: { padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem' },
    cardContainer: { display: 'flex', gap: '10px', padding: '10px 20px', backgroundColor: '#f8fafc', flexShrink: 0 },
    chartWrapper: { flexGrow: 1, width: '100%', backgroundColor: '#fff', position: 'relative', display: 'flex', flexDirection: 'column' }
  };

  return (
    <div style={styles.container}>
      <style>{`body { margin: 0; padding: 0; } @keyframes blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }`}</style>

      <header style={styles.header}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>🍃 裏磐梯農園 Log</h1>
        
        {/* 期間選択 UI */}
        <div style={styles.dateControls}>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.input} />
          <span>~</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.input} />
          <button onClick={fetchData} disabled={loading} style={{
            padding: '5px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#10b981', color: 'white', cursor: 'pointer', fontSize: '0.8rem'
          }}>
            {loading ? '...' : '表示'}
          </button>
        </div>
      </header>

      <div style={styles.cardContainer}>
        <MiniCard label="気温" value={latest?.temp} unit="℃" color="#f97316" />
        <MiniCard label="湿度" value={latest?.humi} unit="%" color="#8b5cf6" />
        <MiniCard label="気圧" value={latest?.pres} unit="hPa" color="#0ea5e9" />
      </div>

      <div style={styles.chartWrapper}>
        <div style={{ flexGrow: 1, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" fontSize={11} tickFormatter={formatTimeOnly} minTickGap={50} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" fontSize={11} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip isAnimationActive={false} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" height={30} align="right" iconType="circle" />
              <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f97316" name="気温" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line yAxisId="left" type="monotone" dataKey="humi" stroke="#8b5cf6" name="湿度" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="pres" stroke="#0ea5e9" name="気圧" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ConsoleLog loading={loading} />
      </div>
    </div>
  );
};

// ... ConsoleLog, MiniCard は以前と同じ ...
export default App;
