import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const GAS_URL = "https://script.google.com/macros/s/XXXXX/exec";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get(GAS_URL);
      const formattedData = response.data.map(item => ({
        ...item,
        time: new Date(item.日時).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: Number(item.気温),
        humi: Number(item.湿度),
        press: Number(item.気圧)
      }));
      setData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error("データ取得エラー:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
        <h2>裏磐梯 Agri-Tech Dashboard</h2>
        <p>データを読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", backgroundColor: "#fafafa", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "30px", borderBottom: "2px solid #2e7d32", paddingBottom: "10px" }}>
        {/* 1. タイトル下の余白を marginBottom: "15px" で確保 */}
        <h1 style={{ color: "#2e7d32", margin: "0 0 15px 0" }}>裏磐梯 Agri-Tech Dashboard</h1>
        <p style={{ margin: "5px 0", color: "#666" }}>
          Status: <span style={{ color: "#4caf50", fontWeight: "bold" }}>● Live</span> | Systena 16th Year Engineer Edition
        </p>
      </header>

      <div style={{ display: "grid", gap: "20px" }}>
        <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <h3 style={{ marginTop: 0, color: "#444" }}>環境センサーリアルタイムログ (ENV III)</h3>
          <div style={{ width: '100%', height: 500 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }} 
                  interval="preserveStartEnd"
                />
                
                {/* 2. 気温専用の軸 (左端) */}
                <YAxis 
                  yAxisId="tempAxis" 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 12 }}
                  width={50}
                  label={{ value: '℃', angle: 0, position: 'top', offset: 10, style: { fontSize: '12px' } }} 
                />

                {/* 3. 湿度専用の軸 (左から2番目) */}
                <YAxis 
                  yAxisId="humiAxis" 
                  orientation="left"
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  width={50}
                  dx={-5}
                  label={{ value: '%', angle: 0, position: 'top', offset: 10, style: { fontSize: '12px' } }} 
                />

                {/* 4. 気圧専用の軸 (右端) */}
                <YAxis 
                  yAxisId="pressAxis" 
                  orientation="right" 
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'hPa', angle: 0, position: 'top', offset: 10, style: { fontSize: '12px' } }} 
                />

                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }} />
                <Legend verticalAlign="top" height={40}/>
                
                {/* 各ラインに専用のyAxisIdを割り当て */}
                <Line 
                  yAxisId="tempAxis" 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#ff7300" 
                  name="気温(℃)" 
                  strokeWidth={3} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  yAxisId="humiAxis" 
                  type="monotone" 
                  dataKey="humi" 
                  stroke="#387908" 
                  name="湿度(%)" 
                  strokeWidth={2} 
                  dot={false} 
                />
                <Line 
                  yAxisId="pressAxis" 
                  type="monotone" 
                  dataKey="press" 
                  stroke="#2196f3" 
                  name="気圧(hPa)" 
                  strokeWidth={1} 
                  dot={false} 
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ fontSize: "0.9rem", color: "#888", textAlign: "right" }}>
          最終更新: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default App;
