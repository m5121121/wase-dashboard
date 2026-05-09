import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// GASのデプロイURL
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxD_q2GNDIJ8KlFV5fKqoloyQbWSCb5-CgOJZwjAgXUhInRO22HCfy05u2Wm7evRKXq/exec';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 日本時間で今日の日付(yyyy-mm-dd)を正確に取得する関数
  const getTodayJST = () => {
    return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  };

  const [startDate, setStartDate] = useState(getTodayJST());
  const [endDate, setEndDate] = useState(getTodayJST());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = GAS_URL;
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);
      
      const response = await fetch(`${url}?${params.toString()}`);
      const rawData = await response.json();
      
      if (Array.isArray(rawData) && rawData.length > 0) {
        const formattedData = rawData.map(item => ({
          time: String(item["日時"] || ""),
          temp: item["気温"] != null ? parseFloat(item["気温"]) : null,
          humi: item["湿度"] != null ? parseFloat(item["湿度"]) : null,
          pres: item["気圧"] != null ? parseFloat(item["気圧"]) : null
        }));
        setData(formattedData);
      } else {
        setData([]); 
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setData([]);
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

  const styles = {
    container: { width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' },
    header: { padding: '10px 15px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' },
    headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    dateControls: { display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'center' },
    input: { padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem', width: '105px' },
    cardContainer: { display: 'flex', gap: '8px', padding: '10px 15px', backgroundColor: '#f8fafc', justifyContent: 'space-between' },
    chartArea: { backgroundColor: '#fff', height: '350px', width: '100%', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    updateBtn: { padding: '5px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#10b981', color: 'white', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <style>{`
        body { margin: 0; padding: 0; overflow-y: auto !important; }
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
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" fontSize={10} tickFormatter={formatTimeOnly} minTickGap={30} axisLine={false} tickLine={false} />
              
              {/* 気温・湿度軸: データの最小・最大に合わせて自動ズーム */}
              <YAxis 
                yAxisId="left" 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                domain={['dataMin - 1', 'dataMax + 1']} 
                allowDecimals={true}
              />
              
              {/* 気圧軸: 自動調整 */}
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                fontSize={10} 
                axisLine={false} 
                tickLine={false} 
                domain={['auto', 'auto']} 
              />
              
              <Tooltip isAnimationActive={false} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" height={36} align="right" iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              
              <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f97316" name="気温" strokeWidth={3} dot={false} isAnimationActive={false} />
              <Line yAxisId="left" type="monotone" dataKey="humi" stroke="#8b5cf6" name="湿度" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="pres" stroke="#0ea5e9" name="気圧" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{loading ? '読み込み中...' : 'データがありません'}</div>
        )}
      </div>

      <ConsoleLog />
    </div>
  );
};

const ConsoleLog = () => {
  const [logs, setLogs] = useState(["> System initialized.", "> Sensors active."]);
  
  useEffect(() => {
    const messages = ["Status: Stable", "Process: OK", "Analyzing...", "Cloud sync...", "Calibration: OK"];
    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => [...prev.slice(-1), `> ${msg}`]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      width: '100%', padding: '6px 20px', backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0', 
      fontFamily: 'monospace', fontSize: '0.65rem', color: '#64748b', minHeight: '40px', 
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center'
    }}>
      {logs.map((log, i) => (
        <div key={i} style={{ 
          opacity: (i + 1) / logs.length, 
          lineHeight: '1.0', // 行間を極限まで圧縮
          marginBottom: '1px' 
        }}>
          {log}
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#10b981' }}>{'>'}</span>
        <span style={{ 
          display: 'inline-block', width: '5px', height: '9px', 
          backgroundColor: '#10b981', marginLeft: '4px', animation: 'blink 1s infinite' 
        }} />
      </div>
    </div>
  );
};

const MiniCard = ({ label, value, unit, color }) => (
  <div style={{ 
    flex: 1, minWidth: 0, backgroundColor: 'white', padding: '8px', 
    borderRadius: '8px', borderLeft: `4px solid ${color}`, 
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' 
  }}>
    <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden' }}>{label}</span>
    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1e293b' }}>
      {value != null ? value.toFixed(1) : '--'}<small style={{fontSize: '0.55rem', marginLeft: '1px'}}>{unit}</small>
    </div>
  </div>
);

export default App;
