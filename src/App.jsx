import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

// --- 設定項目 ---
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxD_q2GNDIJ8KlFV5fKqoloyQbWSCb5-CgOJZwjAgXUhInRO22HCfy05u2Wm7evRKXq/exec';
const UPDATE_INTERVAL = 300000; // 5分

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
          temp: item["気温"] ? parseFloat(item["気温"]) : null,
          humi: item["湿度"] ? parseFloat(item["湿度"]) : null,
          pres: item["気圧"] ? parseFloat(item["気圧"]) : null
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

  // スタイル定義
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
      backgroundColor: '#f0f4f8',
      minHeight: '100vh',
      color: '#334155'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    updateBtn: {
      padding: '10px 25px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: loading ? '#94a3b8' : '#4ade80',
      color: 'white',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      transition: 'all 0.2s',
      marginTop: '15px'
    },
    cardContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    chartWrapper: {
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '16px',
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      height: '450px'
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🍃 裏磐梯農園ダッシュボード</h1>
        <button onClick={fetchData} disabled={loading} style={styles.updateBtn}>
          {loading ? '更新中...' : '今すぐ更新'}
        </button>
        <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#64748b' }}>
          最終更新：{latest ? latest.time : '---'}
        </div>
      </header>

      {/* 数値カードセクション */}
      <div style={styles.cardContainer}>
        <DataCard label="気温" value={latest?.temp} unit="℃" color="#f97316" />
        <DataCard label="湿度" value={latest?.humi} unit="%" color="#8b5cf6" />
        <DataCard label="気圧" value={latest?.pres} unit="hPa" color="#10b981" />
        <DataCard label="更新時刻" value={latest?.time.split(' ')[1].substring(0, 5)} unit="" color="#3b82f6" isTime />
      </div>

      {/* グラフセクション */}
      <div style={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              fontSize={12} 
              tickMargin={10}
              tickFormatter={(str) => (str && str.includes(' ')) ? str.split(' ')[1].substring(0, 5) : ''} 
            />
            <YAxis yAxisId="left" fontSize={12} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" fontSize={12} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
            
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            
            <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f97316" name="気温(℃)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            <Line yAxisId="left" type="monotone" dataKey="humi" stroke="#8b5cf6" name="湿度(%)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            <Line yAxisId="right" type="monotone" dataKey="pres" stroke="#10b981" name="気圧(hPa)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <footer style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '20px' }}>
        <a href="#" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', borderBottom: '1px solid #cbd5e1' }}>
          裏磐梯農園プロジェクトについて
        </a>
      </footer>
    </div>
  );
};

// カスタムカードコンポーネント
const DataCard = ({ label, value, unit, color, isTime }) => (
  <div style={{
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    borderTop: `6px solid ${color}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }}>
    <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>{label}</div>
    <div style={{ fontSize: '2.2rem', fontWeight: '800', color: color }}>
      {value !== undefined ? (isTime ? value : value.toFixed(1)) : '--'}
      <span style={{ fontSize: '1.2rem', marginLeft: '4px' }}>{unit}</span>
    </div>
  </div>
);

export default App;
