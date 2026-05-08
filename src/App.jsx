import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxD_q2GNDIJ8KlFV5fKqoloyQbWSCb5-CgOJZwjAgXUhInRO22HCfy05u2Wm7evRKXq/exec';
const UPDATE_INTERVAL = 300000;

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(GAS_URL);
      const rawData = await response.json();
      if (Array.isArray(rawData)) {
        const formattedData = rawData.map(item => ({
          time: String(item["日時"] || ""),
          temp: item["気温"] != null ? parseFloat(item["気温"]) : null,
          humi: item["湿度"] != null ? parseFloat(item["湿度"]) : null,
          pres: item["気圧"] != null ? parseFloat(item["気圧"]) : null
        })).filter(item => item.time !== "");
        setData(formattedData);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, UPDATE_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData]);

  const latest = data.length > 0 ? data[data.length - 1] : null;

  const formatTimeOnly = (timeStr) => {
    if (!timeStr) return "--:--";
    const timeMatch = timeStr.match(/(\d{1,2}:\d{2})/);
    if (timeMatch) return timeMatch[1];
    if (timeStr.includes(' ') || timeStr.includes('T')) {
      const parts = timeStr.split(/[ T]/);
      return parts[parts.length - 1].substring(0, 5);
    }
    return timeStr.length > 10 ? timeStr.substring(11, 16) : timeStr;
  };

  const styles = {
    // 修正: width を 100% に変更し、boxSizing を追加
    container: { 
      width: '100%', 
      height: '100vh', 
      backgroundColor: '#f8fafc', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      boxSizing: 'border-box'
    },
    header: { padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', flexShrink: 0 },
    cardContainer: { display: 'flex', gap: '10px', padding: '10px 20px', backgroundColor: '#f8fafc', flexShrink: 0 },
    chartWrapper: { flexGrow: 1, width: '100%', backgroundColor: '#fff', position: 'relative', display: 'flex', flexDirection: 'column' },
    updateBtn: { padding: '6px 15px', borderRadius: '6px', border: 'none', backgroundColor: loading ? '#94a3b8' : '#10b981', color: 'white', fontSize: '0.8rem', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      {/* 修正: ボディ全体の余白を消すスタイルタグを挿入 */}
      <style>{`
        body { margin: 0; padding: 0; overflow: hidden; width: 100%; }
        @keyframes blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
      `}</style>

      <header style={styles.header}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
          🍃 裏磐梯農園 Log 
          <small style={{fontWeight: 'normal', color: '#64748b', fontSize: '0.8rem', marginLeft: '10px'}}>
            Update: {latest ? formatTimeOnly(latest.time) : '--:--'}
          </small>
        </h1>
        <button onClick={fetchData} disabled={loading} style={styles.updateBtn}>
          {loading ? '...' : '再読込'}
        </button>
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

const ConsoleLog = ({ loading }) => {
  const [logs, setLogs] = useState(["> System initialized.", "> Monitoring micro-climate...", "> Sensors active."]);
  useEffect(() => {
    const messages = ["Current Status: Stable", "Process: Photosynthesis Optimized", "Analyzing micro-climate patterns...", "Cloud sync in progress...", "Calibration: OK", "Adjusting for high altitude (800m)..."];
    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => [...prev.slice(-2), `> ${msg}`]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => { if (loading) setLogs(prev => [...prev, "> Synchronizing with data bank..."]); }, [loading]);
  return (
    <div style={{ width: '100%', padding: '8px 20px', backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '0.7rem', color: '#64748b', height: '65px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left', boxSizing: 'border-box' }}>
      {logs.map((log, i) => (<div key={i} style={{ opacity: (i + 1) / logs.length, lineHeight: '1.4' }}>{log}</div>))}
      <div><span style={{ color: '#10b981' }}>{'>'}</span><span style={{ display: 'inline-block', width: '6px', height: '10px', backgroundColor: '#10b981', marginLeft: '5px', animation: 'blink 1s infinite' }} /></div>
    </div>
  );
};

const MiniCard = ({ label, value, unit, color }) => (
  <div style={{ flex: 1, backgroundColor: 'white', padding: '8px 15px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderLeft: `4px solid ${color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>{label}</span>
    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>{value != null ? value.toFixed(1) : '--'}<small style={{fontSize: '0.6rem', marginLeft: '2px'}}>{unit}</small></div>
  </div>
);

export default App;
