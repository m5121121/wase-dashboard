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
      
      // データが配列であることを確認してからマッピング
      if (Array.isArray(rawData)) {
        const formattedData = rawData.map(item => ({
          time: item["日時"] || "", // undefined対策
          temp: item["気温"] ? parseFloat(item["気温"]) : null,
          humi: item["湿度"] ? parseFloat(item["湿度"]) : null,
          pres: item["気圧"] ? parseFloat(item["気圧"]) : null
        })).filter(item => item.time !== ""); // 空データを除外
        
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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '15px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2>裏磐梯農園ダッシュボード</h2>
        <button onClick={fetchData} disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          {loading ? '更新中...' : 'データを更新'}
        </button>
      </header>

      {latest && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          <div style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
            <small>気温</small><div>{latest.temp?.toFixed(1)}℃</div>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
            <small>湿度</small><div>{latest.humi?.toFixed(1)}%</div>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
            <small>気圧</small><div>{latest.pres?.toFixed(1)}hPa</div>
          </div>
        </div>
      )}

      <div style={{ width: '100%', height: 400, backgroundColor: 'white' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="time" 
              fontSize={10} 
              tickFormatter={(str) => {
                // 安全な文字列処理：スペースで分割して2番目（時刻）を取得
                if (typeof str === 'string' && str.includes(' ')) {
                  const timePart = str.split(' ')[1];
                  return timePart ? timePart.substring(0, 5) : str;
                }
                return str;
              }}
            />
            <YAxis yAxisId="left" fontSize={10} />
            <YAxis yAxisId="right" orientation="right" fontSize={10} domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ff7300" name="気温" dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="humi" stroke="#8884d8" name="湿度" dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="pres" stroke="#82ca9d" name="気圧" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default App;
