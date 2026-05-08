import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxD_q2GNDIJ8KlFV5fKqoloyQbWSCb5-CgOJZwjAgXUhInRO22HCfy05u2Wm7evRKXq/exec';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = GAS_URL;
      if (startDate && endDate) {
        url += (url.includes('?') ? '&' : '?') + `start=${startDate}&end=${endDate}`;
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
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latest = data.length > 0 ? data[data.length - 1] : null;

  const formatTimeOnly = (timeStr) => {
    if (!timeStr) return "--:--";
    const timeMatch = timeStr.match(/(\d{1,2}:\d{2})/);
    return timeMatch ? timeMatch[1] : timeStr.substring(11, 16);
  };

  // スタイル定義の修正
  const styles = {
    container: { 
      width: '100%', 
      minHeight: '100vh', // 最小高さを100%にし、スクロールを許容
      backgroundColor: '#f8fafc', 
      display: 'flex', 
      flexDirection: 'column',
      boxSizing: 'border-box' 
    },
    header: { 
      padding: '12px 15px', 
      backgroundColor: '#fff', 
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column', // スマホでは縦並びを考慮
      gap: '10px'
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    dateControls: { 
      display: 'flex', 
      gap: '5px', 
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'nowrap' // はみ出さないように
    },
    input: { 
      padding: '6px', 
      borderRadius: '4px', 
      border: '1px solid #cbd5e1', 
      fontSize: '0.75rem', 
      width: '110px' // スマホで入り切るサイズ
    },
    cardContainer: { 
      display: 'flex', 
      gap: '8px', 
      padding: '10px', 
      backgroundColor: '#f8fafc',
      flexWrap: 'wrap' // スマホで3列が苦しい場合は折り返し
    },
    chartArea: { 
      backgroundColor: '#fff', 
      padding: '10px 0',
      height: '350px', // スマホで見やすい高さを固定
      width: '100%',
      borderTop: '1px solid #e2e8f0',
      borderBottom: '1px solid #e2e8f0'
    },
    updateBtn: { 
      padding: '6px 12px', 
      borderRadius: '6px', 
      border: 'none', 
      backgroundColor: '#10b981', 
      color: 'white', 
      fontSize: '0.8rem', 
      cursor: 'pointer', 
      fontWeight: 'bold' 
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        body { margin: 0; padding: 0; overflow-y: auto !important; } /* スクロールを強制 */
        @keyframes blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>🍃 裏磐梯農園 Log</h1>
        </div>
        
        <div style={styles.dateControls}>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.input} />
          <span style={{color: '#64748b', fontSize: '0.7rem'}}>~</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.input} />
          <button onClick={fetchData} disabled={loading} style={styles.updateBtn}>
            {loading ? '...' : '表示'}
          </button>
        </div>
      </header>

      <div style={styles.cardContainer}>
        <MiniCard label="気温" value={latest?.temp} unit="℃" color="#f97316" />
        <MiniCard label="湿度" value={latest?.humi} unit="%" color="#8b5cf6" />
        <MiniCard label="気圧" value={latest?.pres} unit="hPa" color="#0ea5e9" />
      </div>

      <div style={styles.chartArea}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" fontSize={10} tickFormatter={formatTimeOnly} minTickGap={30} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" fontSize={10} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip isAnimationActive={false} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend verticalAlign="top" height={36} align="right" iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f97316" name="気温" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line yAxisId="left" type="monotone" dataKey="humi" stroke="#8b5cf6" name="湿度" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line yAxisId="right" type="monotone" dataKey="pres" stroke="#0ea5e9" name="気圧" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ConsoleLog loading={loading} />
    </div>
  );
};

const ConsoleLog = ({ loading }) => {
  const [logs, setLogs] = useState(["> System initialized.", "> Monitoring active."]);
  useEffect(() => {
    const messages = ["Status: Stable", "Photosynthesis Optimized", "Analyzing climate...", "Cloud sync...", "Calibration: OK"];
    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => [...prev.slice(-1), `> ${msg}`]); // スマホ用にログ数を絞る
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loading) setLogs(prev => [...prev, "> Synchronizing..."]);
  }, [loading]);

  return (
    <div style={{ width: '100%', padding: '15px 20px', backgroundColor: '#1e293b', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.7rem', minHeight: '100px', boxSizing: 'border-box' }}>
      {logs.map((log, i) => (<div key={i} style={{ marginBottom: '4px' }}>{log}</div>))}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#10b981' }}>{'>'}</span>
        <span style={{ display: 'inline-block', width: '6px', height: '12px', backgroundColor: '#10b981', marginLeft: '5px', animation: 'blink 1s infinite' }} />
      </div>
    </div>
  );
};

const MiniCard = ({ label, value, unit, color }) => (
  <div style={{ flex: '1 1 100px', backgroundColor: 'white', padding: '10px', borderRadius: '8px', borderLeft: `4px solid ${color}`, display: 'flex', flexDirection: 'column', gap: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
    <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold' }}>{label}</span>
    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b' }}>
      {value != null ? value.toFixed(1) : '--'}<small style={{fontSize: '0.6rem', marginLeft: '2px'}}>{unit}</small>
    </div>
  </div>
);

export default App;
