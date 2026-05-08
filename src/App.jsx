import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// --- 設定項目 ---
// 指定されたGASのWebアプリURLを設定済み
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxD_q2GNDIJ8KlFV5fKqoloyQbWSCb5-CgOJZwjAgXUhInRO22HCfy05u2Wm7evRKXq/exec';
const UPDATE_INTERVAL = 300000; // 5分（ミリ秒）

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. データ取得・整形ロジック
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(GAS_URL);
      const rawData = await response.json();
      
      // 日本語キーを英数キーにマッピングし、数値をパース
      const formattedData = rawData.map(item => ({
        time: item["日時"],
        temp: parseFloat(item["気温"]),
        humi: parseFloat(item["湿度"]),
        pres: parseFloat(item["気圧"])
      }));
      
      setData(formattedData);
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. 初回マウント時と一定時間ごとの自動更新
  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, UPDATE_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData]);

  // 最新データの抽出
  const latest = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div style={{ 
      maxWidth: '800px', margin: '0 auto', padding: '15px', 
      fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif', 
      backgroundColor: '#f8f9fa', minHeight: '100vh' 
    }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '15px' }}>裏磐梯農園ダッシュボード</h1>
        <button 
          onClick={fetchData} 
          disabled={loading}
          style={{
            padding: '12px 28px', borderRadius: '30px', border: 'none',
            backgroundColor: loading ? '#ccc' : '#28a745', color: 'white',
            fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: '0.3s'
          }}
        >
          {loading ? '更新中...' : '今すぐ更新'}
        </button>
      </header>

      {/* 3. 最新値のカード表示 */}
      {latest && (
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
          gap: '10px', marginBottom: '20px' 
        }}>
          <DataCard label="気温" value={`${latest.temp.toFixed(1)}℃`} color="#ff7300" />
          <DataCard label="湿度" value={`${latest.humi.toFixed(1)}%`} color="#8884d8" />
          <DataCard label="気圧" value={`${latest.pres.toFixed(1)}hPa`} color="#82ca9d" />
        </div>
      )}

      {/* 4. グラフセクション（レスポンシブ） */}
      <div style={{ 
        backgroundColor: 'white', padding: '15px 10px 5px 10px', borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '400px' 
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis 
              dataKey="time" 
              fontSize={10} 
              tickFormatter={(str) => str ? str.split(' ')[1].substring(0, 5) : ''} // "HH:mm" 形式で表示
            />
            
            {/* 左軸：気温・湿度用 */}
            <YAxis yAxisId="left" fontSize={10} stroke="#666" />
            {/* 右軸：気圧用（裏磐梯の標高に合わせた自動範囲設定） */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              fontSize={10} 
              stroke="#82ca9d"
              domain={['auto', 'auto']} 
            />
            
            <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            
            <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ff7300" name="気温(℃)" dot={false} strokeWidth={2} />
            <Line yAxisId="left" type="monotone" dataKey="humi" stroke="#8884d8" name="湿度(%)" dot={false} strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="pres" stroke="#82ca9d" name="気圧(hPa)" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <footer style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: '#999' }}>
        最終更新: {latest ? latest.time : '---'}
      </footer>
    </div>
  );
};

const DataCard = ({ label, value, color }) => (
  <div style={{ 
    backgroundColor: 'white', padding: '15px', borderRadius: '10px', 
    textAlign: 'center', borderTop: `5px solid ${color}`, boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
  }}>
    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>{label}</div>
    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#333' }}>{value}</div>
  </div>
);

export default App;
