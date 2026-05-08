import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// ★ 先ほどデプロイしたGASのウェブアプリURLをここに貼ってください
const GAS_URL = "https://script.google.com/macros/s/AKfycbxD_q2GNDIJ8KlFV5fKqoloyQbWSCb5-CgOJZwjAgXUhInRO22HCfy05u2Wm7evRKXq/exec";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get(GAS_URL);
      // GASからのデータを整形（もし日時が文字列ならDate型に変換するなど）
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Data fetch error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 1分ごとに更新
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{padding: "20px"}}>Loading Urabandai Data...</div>;

  return (
    <div style={{ padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <header style={{ marginBottom: "30px" }}>
        <h1 style={{ color: "#2e7d32" }}>裏磐梯 Agri-Tech Dashboard</h1>
        <p>Status: <span style={{ color: "green" }}>● Live</span> | 16th Year Engineer Edition</p>
      </header>

      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h3>環境センサーログ (ENV III)</h3>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="日時" /> 
              <YAxis yAxisId="left" label={{ value: '温度 (℃)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: '気圧 (hPa)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ff7300" name="温度" strokeWidth={2} dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="humi" stroke="#387908" name="湿度" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="press" stroke="#0000ff" name="気圧" strokeWidth={1} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
