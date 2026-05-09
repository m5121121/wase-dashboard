import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSensorData } from '../hooks/useSensorData';

const Dashboard = () => {
  const { data, loading, startDate, setStartDate, endDate, setEndDate, fetchData } = useSensorData();
  const latest = data.length > 0 ? data[data.length - 1] : null;
  const currentWeather = latest?.weather || "Clear";

  const weatherThemes = {
    Clear: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
    Clouds: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop',
    Atmosphere: 'https://images.unsplash.com/photo-1543968996-ee822b8176ba?q=80&w=1000&auto=format&fit=crop'
    // ...他テーマは省略（必要に応じて追加）
  };

  const currentImg = weatherThemes[currentWeather] || weatherThemes.Clear;

  const styles = {
    container: { width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc' },
    header: { 
      position: 'relative', height: '70px', display: 'flex', alignItems: 'center', 
      padding: '0 24px', overflow: 'hidden', color: '#1e293b'
    },
    headerBg: {
      position: 'absolute', inset: 0, backgroundImage: `url(${currentImg})`, 
      backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 1
    },
    overlay: {
      position: 'absolute', inset: 0, zIndex: 2,
      background: 'linear-gradient(to right, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)'
    },
    headerContent: { 
      position: 'relative', zIndex: 3,
      textShadow: '1px 1px 0 #fff, -1px 1px 0 #fff, 1px -1px 0 #fff, -1px -1px 0 #fff'
    },
    datePanel: { backgroundColor: '#fff', padding: '10px', display: 'flex', gap: '8px', justifyContent: 'center', borderBottom: '1px solid #e2e8f0' },
    input: { padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerBg} />
        <div style={styles.overlay} />
        <div style={styles.headerContent}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0 }}>🍃 裏磐梯農園 Log</h1>
        </div>
      </header>

      <div style={styles.datePanel}>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.input} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.input} />
        <button onClick={fetchData} disabled={loading} style={{ padding: '5px 14px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', border: 'none' }}>表示</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', padding: '12px' }}>
        <MiniCard label="気温" value={latest?.temp} unit="℃" color="#f97316" />
        <MiniCard label="湿度" value={latest?.humi} unit="%" color="#8b5cf6" />
        <MiniCard label="気圧" value={latest?.pres} unit="hPa" color="#0ea5e9" />
      </div>

      <div style={{ height: '340px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 15, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" fontSize={10} tickFormatter={(t) => t.substring(11, 16)} />
            <YAxis yAxisId="left" fontSize={10} axisLine={false} />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MiniCard = ({ label, value, unit, color }) => (
  <div style={{ flex: 1, backgroundColor: 'white', padding: '10px', borderRadius: '10px', borderLeft: `4px solid ${color}` }}>
    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{label}</div>
    <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>{value?.toFixed(1) || '--'}{unit}</div>
  </div>
);

export default Dashboard;
