import React, { useState, useEffect, useCallback, useRef } from 'react';
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
          time: item["日時"] || "",
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
    if (!timeStr || typeof timeStr !== 'string') return "--:--";
    if (timeStr.includes(' ')) return timeStr.split(' ')[1].substring(0, 5);
    if (timeStr.includes(':')) return timeStr.substring(0, 5);
    return timeStr.substring(0, 5);
  };

  const styles = {
    container: { width: '100vw', height: '100vh', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', overflow: 'hidden', color: '#f8fafc' },
    header: { padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', borderBottom: '1px solid #334155', flexShrink: 0 },
    cardContainer: { display: 'flex', gap: '10px', padding: '10px 20px', backgroundColor: '#0f172a', flexShrink: 0 },
    chartWrapper: { flexGrow: 1, width: '100%', backgroundColor: '#0f172a', position: 'relative', paddingBottom: '10px' },
    updateBtn: { padding: '6px 15px', borderRadius: '6px', border: '1px solid #10b981', backgroundColor: 'transparent', color: '#10b981', fontSize: '0.8rem', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: '#38bdf8' }}>
          SYS_URABANDAI_FARM_v3.0 
          <small style={{fontWeight: 'normal', color: '#94a3b8', fontSize: '0.8rem', marginLeft: '10px'}}>
            STATUS: ACTIVE / UPDATED: {latest ? formatTimeOnly(latest.time) : '--:--'}
          </small>
        </h1>
        <button onClick={fetchData} disabled={loading} style={styles.updateBtn}>
          {loading ? 'SYNC...' : 'RE-SYNC'}
        </button>
      </header>

      <div style={styles.cardContainer}>
        <MiniCard label="TEMPERATURE" value={latest?.temp} unit="°C" color="#f97316" />
        <MiniCard label="HUMIDITY" value={latest?.humi} unit="%" color="#8b5cf6" />
        <MiniCard label="PRESSURE" value={latest?.pres} unit="hPa" color="#0ea5e9" />
      </div>

      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="75%">
          <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis dataKey="time" fontSize={10} tickFormatter={formatTimeOnly} minTickGap={50} axisLine={false} tick={{fill: '#64748b'}} />
            <YAxis yAxisId="left" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
            <YAxis yAxisId="right" orientation="right" fontSize={10} axisLine={false} tickLine={false} domain={['auto', 'auto']} tick={{fill: '#64748b'}} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff', fontSize: '12px' }} />
            <Legend verticalAlign="top" height={30} align="right" iconType="circle" />
            <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f97316" name="TEMP" strokeWidth={2} dot={false} animationDuration={400} />
            <Line yAxisId="left" type="monotone" dataKey="humi" stroke="#8b5cf6" name="HUMI" strokeWidth={2} dot={false} animationDuration={400} />
            <Line yAxisId="right" type="monotone" dataKey="pres" stroke="#0ea5e9" name="PRES" strokeWidth={2} dot={false} animationDuration={400} />
          </LineChart>
        </ResponsiveContainer>
        
        {/* コンソールログセクション */}
        <ConsoleLog loading={loading} latest={latest} />
      </div>
    </div>
  );
};

// コンソールログコンポーネント
const ConsoleLog = ({ loading, latest }) => {
  const [logs, setLogs] = useState([
    "> System initialized.",
    "> Establishing connection to sensors...",
    "> Connection stable."
  ]);
  const logEndRef = useRef(null);

  // 定期的にフェイクの「テック系ログ」を追加する
  useEffect(() => {
    const messages = [
      "Current Status: Stable",
      "Process: Photosynthesis Optimized",
      "Analyzing micro-climate patterns...",
      "Cloud sync in progress...",
      "Sensor calibration: OK",
      "Neural link: Healthy",
      "Adjusting parameters for high altitude..."
    ];
    
    const interval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-4), `[${timestamp}] ${randomMsg}`]);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loading) setLogs(prev => [...prev, "> Fetching latest environmental data..."]);
  }, [loading]);

  return (
    <div style={{
      margin: '0 20px',
      padding: '10px 15px',
      backgroundColor: '#000',
      borderRadius: '5px',
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '0.75rem',
      color: '#4ade80',
      height: '80px',
      overflowY: 'hidden',
      border: '1px solid #1e293b'
    }}>
      {logs.map((log, i) => (
        <div key={i} style={{ marginBottom: '2px', opacity: (i + 1) / logs.length }}>{log}</div>
      ))}
      <div style={{ display: 'inline-block', width: '8px', height: '12px', backgroundColor: '#4ade80', marginLeft: '5px', animation: 'blink 1s infinite' }}></div>
      <style>{`
        @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
    </div>
  );
};

const MiniCard = ({ label, value, unit, color }) => (
  <div style={{
    flex: 1, backgroundColor: '#1e293b', padding: '8px 15px', borderRadius: '8px',
    borderLeft: `4px solid ${color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  }}>
    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold' }}>{label}</span>
    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f8fafc' }}>
      {value != null ? value.toFixed(1) : '--'}<small style={{fontSize: '0.6rem', marginLeft: '2px'}}>{unit}</small>
    </div>
  </div>
);

export default App;
