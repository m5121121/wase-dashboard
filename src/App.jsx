import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbxD_q2GNDIJ8KlFV5fKqoloyQbWSCb5-CgOJZwjAgXUhInRO22HCfy05u2Wm7evRKXq/exec';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentWeather, setCurrentWeather] = useState("Clear");
  
  const getTodayJST = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  const [startDate, setStartDate] = useState(getTodayJST());
  const [endDate, setEndDate] = useState(getTodayJST());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ start: startDate, end: endDate });
      const response = await fetch(`${GAS_URL}?${params.toString()}`);
      const rawData = await response.json();
      
      if (Array.isArray(rawData) && rawData.length > 0) {
        const formattedData = rawData.map(item => ({
          time: String(item["日時"] || ""),
          weather: item["天気"] || "Clear",
          temp: item["気温"] != null ? parseFloat(item["気温"]) : null,
          humi: item["湿度"] != null ? parseFloat(item["湿度"]) : null,
          pres: item["気圧"] != null ? parseFloat(item["気圧"]) : null
        }));
        setData(formattedData);
        setCurrentWeather(formattedData[formattedData.length - 1].weather);
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

  useEffect(() => { fetchData(); }, [fetchData]);

  const weatherThemes = {
    Clear: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop',
    Clouds: 'https://images.unsplash.com/photo-1483977399921-6cf3832f7c4e?q=80&w=1000&auto=format&fit=crop',
    Rain: 'https://images.unsplash.com/photo-1534274988757-a28bf1f539cf?q=80&w=1000&auto=format&fit=crop',
    Drizzle: 'https://images.unsplash.com/photo-1558486012-817176f84c6d?q=80&w=1000&auto=format&fit=crop',
    Thunderstorm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1000&auto=format&fit=crop',
    Snow: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?q=80&w=1000&auto=format&fit=crop',
    Atmosphere: 'https://images.unsplash.com/photo-1543968996-ee822b8176ba?q=80&w=1000&auto=format&fit=crop'
  };

  const getThemeImg = (weather) => {
    const atmosphereList = ["Mist", "Smoke", "Haze", "Dust", "Fog", "Sand", "Ash", "Squall", "Tornado"];
    if (atmosphereList.includes(weather)) return weatherThemes.Atmosphere;
    return weatherThemes[weather] || weatherThemes.Clear;
  };

  const currentImg = getThemeImg(currentWeather);
  const latest = data.length > 0 ? data[data.length - 1] : null;

  const styles = {
    container: { width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' },
    header: { 
      position: 'relative', height: '140px', display: 'flex', flexDirection: 'column', 
      justifyContent: 'flex-end', padding: '0 24px 20px 24px', overflow: 'hidden', color: '#fff'
    },
    headerBg: {
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      backgroundImage: `url(${currentImg})`, backgroundSize: 'cover', backgroundPosition: 'center',
      zIndex: 1
    },
    overlay: {
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
      zIndex: 2
    },
    headerContent: { position: 'relative', zIndex: 3, textShadow: '0 2px 4px rgba(0,0,0,0.3)' },
    datePanel: { backgroundColor: '#fff', padding: '12px', display: 'flex', gap: '8px', justifyContent: 'center', borderBottom: '1px solid #e2e8f0' },
    input: { padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', width: '110px' },
    cardContainer: { display: 'flex', gap: '10px', padding: '12px 16px', backgroundColor: '#f8fafc' },
    chartArea: { backgroundColor: '#fff', height: '340px', width: '100%', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' },
    updateBtn: { padding: '6px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#10b981', color: 'white', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerBg} />
        <div style={styles.overlay} />
        <div style={styles.headerContent}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '900', margin: 0 }}>🍃 裏磐梯農園 Log</h1>
          <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '4px' }}>
             {latest ? `${latest.time.substring(0, 10)} ${latest.time.substring(11, 16)} 更新` : '--'}
          </div>
        </div>
      </header>

      <div style={styles.datePanel}>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.input} />
        <span style={{ color: '#94a3b8', alignSelf: 'center' }}>~</span>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.input} />
        <button onClick={fetchData} disabled={loading} style={styles.updateBtn}>表示</button>
      </div>

      <div style={styles.cardContainer}>
        <MiniCard label="気温" value={latest?.temp} unit="℃" color="#f97316" />
        <MiniCard label="湿度" value={latest?.humi} unit="%" color="#8b5cf6" />
        <MiniCard label="気圧" value={latest?.pres} unit="hPa" color="#0ea5e9" />
      </div>

      <div style={styles.chartArea}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" fontSize={10} tickFormatter={(t) => t.substring(11, 16)} minTickGap={35} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" fontSize={10} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} allowDecimals={true} />
              <YAxis yAxisId="right" orientation="right" fontSize={10} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip isAnimationActive={false} contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none' }} />
              <Legend verticalAlign="top" height={40} align="right" iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f97316" name="気温" strokeWidth={3} dot={false} isAnimationActive={false} />
              <Line yAxisId="left" type="monotone" dataKey="humi" stroke="#8b5cf6" name="湿度" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="pres" stroke="#0ea5e9" name="気圧" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>データなし</div>}
      </div>

      {/* 寒暖差ページ（スクロール用セクション） */}
      <YesterdayInsight data={data} />

      {/* 旧システムログ */}
      <ConsoleLog />
    </div>
  );
};

const YesterdayInsight = ({ data }) => {
  const getYesterdayDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  };
  
  const yesterdayStr = getYesterdayDate();
  const yesterdayRows = data.filter(d => d.time.startsWith(yesterdayStr));

  if (yesterdayRows.length === 0) return (
    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', backgroundColor: '#fff' }}>
      昨日のデータが不足しているため解析できません
    </div>
  );

  const temps = yesterdayRows.map(r => r.temp);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const diff = maxTemp - minTemp;
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

  const styles = {
    section: { padding: '30px 20px', backgroundColor: '#fff', borderTop: '8px solid #f1f5f9' },
    title: { fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' },
    mainCard: { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' },
    diffValue: { fontSize: '2.5rem', fontWeight: '900', color: diff > 10 ? '#ef4444' : '#334155', margin: '4px 0' }
  };

  return (
    <div style={styles.section}>
      <div style={styles.title}>📊 昨日の寒暖差レポート</div>
      <div style={styles.mainCard}>
        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>TEMPERATURE DIFF</div>
        <div style={styles.diffValue}>{diff.toFixed(1)}℃</div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{yesterdayStr} の最大振れ幅</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: '15px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
          <span>最小: {minTemp.toFixed(1)}℃</span>
          <span>平均: {avgTemp.toFixed(1)}℃</span>
          <span>最大: {maxTemp.toFixed(1)}℃</span>
        </div>
      </div>
      <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', fontSize: '0.75rem', color: '#166534', lineHeight: '1.5' }}>
        <strong>🌱 農業メモ:</strong> {diff > 10 ? "10度以上の寒暖差があります。糖度アップのチャンスです。" : "安定した気温です。計画的な作業に適しています。"}
      </div>
    </div>
  );
};

const ConsoleLog = () => {
  const [logs, setLogs] = useState(["> System online."]);
  useEffect(() => {
    const msgs = ["Stable", "Syncing", "Ready"];
    const itv = setInterval(() => {
      setLogs(p => [...p.slice(-1), `> ${msgs[Math.floor(Math.random()*msgs.length)]}`]);
    }, 8000);
    return () => clearInterval(itv);
  }, []);
  return (
    <div style={{ width: '100%', padding: '8px 24px', backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '0.65rem', color: '#64748b', minHeight: '40px' }}>
      {logs.map((l, i) => <div key={i} style={{ opacity: (i+1)/logs.length, lineHeight: '1.1' }}>{l}</div>)}
    </div>
  );
};

const MiniCard = ({ label, value, unit, color }) => (
  <div style={{ flex: 1, backgroundColor: 'white', padding: '10px 8px', borderRadius: '10px', borderLeft: `4px solid ${color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold' }}>{label}</div>
    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>
      {value != null ? value.toFixed(1) : '--'}<small style={{ fontSize: '0.6rem' }}>{unit}</small>
    </div>
  </div>
);

export default App;
