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

  // 時刻文字列から HH:mm を抽出する安全な関数
  const formatTimeOnly = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(' ')) return "--:--";
    const parts = timeStr.split(' ');
    return parts[1] ? parts[1].substring(0, 5) : "--:--";
  };

  const styles = {
    container: { maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f0f4f8', minHeight: '100vh', color: '#334155' },
    header: { textAlign: 'center', marginBottom: '30px' },
    title: { fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' },
    updateBtn: { padding: '10px 25px', borderRadius: '8px', border: 'none', backgroundColor: loading ? '#94a3b8' : '#4ade80', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
    cardContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    chartWrapper: { backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', height: '450px' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🍃 裏磐梯農園ダッシュボード</h1>
        <button onClick={fetchData} disabled={loading} style={styles.updateBtn}>
          {loading ? '更新中...' : '今すぐ更新'}
        </button>
        <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#64748b' }}>
          最終取得：{latest ? latest.time : '読み込み中...'}
        </div>
      </header>

      <div style={styles.cardContainer}>
        <DataCard label="気温" value={latest?.temp} unit="℃" color="#f97316" />
        <DataCard label="湿度" value={latest?.humi} unit="%" color="#8b5cf6" />
        <DataCard label="気圧" value={latest?.pres} unit="hPa" color="#10b981" />
        <DataCard label="更新時刻" value={formatTimeOnly(latest?.time)} unit="" color="#3b82f6" isString />
      </div>

      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              fontSize={12} 
              tickFormatter={(str) => formatTimeOnly(str)} 
            />
            <YAxis yAxisId="left" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" fontSize={12} domain={['auto', 'auto']} />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />
            <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f97316" name="気温(℃)" strokeWidth={3} dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="humi" stroke="#8b5cf6" name="湿度(%)" strokeWidth={3} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="pres" stroke="#10b981" name="気圧(hPa)" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const DataCard = ({ label, value, unit, color, isString }) => (
  <div style={{
    backgroundColor: 'white', padding: '20px', borderRadius: '16px', textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderTop: `6px solid ${color}`
  }}>
    <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>{label}</div>
    <div style={{ fontSize: '2.2rem', fontWeight: '800', color: color }}>
      {value != null ? (isString ? value : value.toFixed(1)) : '--'}
      <span style={{ fontSize: '1.2rem', marginLeft: '4px' }}>{unit}</span>
    </div>
  </div>
);

export default App;
