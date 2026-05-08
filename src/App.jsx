import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// ★ あなたのGASウェブアプリURLに書き換えてください
const GAS_URL = "https://script.google.com/macros/s/AKfycbxD_q2GNDIJ8KlFV5fKqoloyQbWSCb5-CgOJZwjAgXUhInRO22HCfy05u2Wm7evRKXq/exec";

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // GASからのデータ取得
      const response = await axios.get(GAS_URL);
      
      // データの整形：日本語キーへの対応と日時のフォーマット
      const formattedData = response.data.map(item => ({
        ...item,
        // ISO形式の日時を "14:20" のような短い形式に変換して表示用キー(time)を作成
        time: new Date(item.日時).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        // 数値データが文字列で来ている場合の保険として、Number型に変換
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
    // 1分ごとにデータを更新
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
        <h1 style={{ color: "#2e7d32", margin: 0 }}>裏磐梯 Agri-Tech Dashboard</h1>
        <p style={{ margin: "5px 0", color: "#666" }}>
          Status: <span style={{ color: "#4caf50", fontWeight: "bold" }}>● Live</span> | Systena 16th Year Engineer Edition
        </p>
      </header>

      <div style={{ display: "grid", gap: "20px" }}>
        {/* メイングラフカード */}
        <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <h3 style={{ marginTop: 0, color: "#444" }}>環境センサーリアルタイムログ (ENV III)</h3>
          <div style={{ width: '100%', height: 450 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }} 
                  interval="preserveStartEnd"
                />
                {/* 左軸：気温・湿度用 */}
                <YAxis 
                  yAxisId="left" 
                  tick={{ fontSize: 12 }}
                  label={{ value: '気温(℃) / 湿度(%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} 
                />
                {/* 右軸：気圧用（スケールが異なるため分離） */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 12 }}
                  label={{ value: '気圧(hPa)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }} 
                />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }} />
                <Legend verticalAlign="top" height={36}/>
                
                {/* 気温：オレンジ */}
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#ff7300" 
                  name="気温(℃)" 
                  strokeWidth={3} 
                  dot={{ r: 2 }} 
                  activeDot={{ r: 6 }} 
                />
                {/* 湿度：緑 */}
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="humi" 
                  stroke="#387908" 
                  name="湿度(%)" 
                  strokeWidth={2} 
                  dot={false} 
                />
                {/* 気圧：青 */}
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="press" 
                  stroke="#0000ff" 
                  name="気圧(hPa)" 
                  strokeWidth={1} 
                  dot={false} 
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 補足情報セクション */}
        <div style={{ fontSize: "0.9rem", color: "#888", textAlign: "right" }}>
          最終更新: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default App;
