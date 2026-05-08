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
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(' ')) return "--:--";
    const parts = timeStr.split(' ');
    return parts[1] ? parts[1].substring(0, 5) : "--:--";
  };

  const styles = {
    container: { 
      width: '100vw', 
      height: '100vh', // 画面全体を固定
      backgroundColor: '#f8fafc', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden' // スクロールを抑止
    },
    header: { 
      padding: '10px 20px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      backgroundColor: '#fff',
      borderBottom: '1px solid #e2e8f0',
      flexShrink: 0
    },
    cardContainer: { 
      display: 'flex', 
      gap: '10px', 
      padding: '10px 20px',
      backgroundColor: '#f8fafc',
      flexShrink: 0
    },
    chartWrapper: { 
      flexGrow: 1, // 残りの高さをすべて使う
      width: '100%', 
      backgroundColor: '#fff',
      padding: '0px',
      position: 'relative'
    },
    updateBtn: { 
      padding: '6px 15px', 
      borderRadius: '6px', 
      border: 'none', 
      backgroundColor: loading ? '#94a3b8' : '#10b981', 
      color: 'white', 
      fontSize: '0.8rem',
      cursor: 'pointer' 
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>
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
        {/* コンテナの高さが不定にならないよう 99% 程度に設定 */}
        <ResponsiveContainer width="100%" height="95%">
          <LineChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="time" 
              fontSize={11} 
              tickFormatter={(str) => formatTimeOnly(str)} 
              minTickGap={40}
              axisLine={false}
            />
            <YAxis yAxisId="left" fontSize={11} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" fontSize={11} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
            
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend verticalAlign="top" height={30} align="right" iconType="circle" />
            
            <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f97316" name="気温" strokeWidth={2.5} dot={false} animationDuration={400} isAnimationActive={true} />
            <Line yAxisId="left" type="monotone" dataKey="humi" stroke="#8b5cf6" name="湿度" strokeWidth={2.5} dot={false} animationDuration={400} isAnimationActive={true} />
            <Line yAxisId="right" type="monotone" dataKey="pres" stroke="#0ea5e9" name="気圧" strokeWidth={2.5} dot={false} animationDuration={400} isAnimationActive={true} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MiniCard = ({ label, value, unit, color }) => (
  <div style={{
    flex: 1,
    backgroundColor: 'white',
    padding: '8px 15px',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    borderLeft: `4px solid ${color}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: '100px'
  }}>
    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>{label}</span>
    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>
      {value != null ? value.toFixed(1) : '--'}<small style={{fontSize: '0.6rem', marginLeft: '2px'}}>{unit}</small>
    </div>
  </div>
);

export default App;
