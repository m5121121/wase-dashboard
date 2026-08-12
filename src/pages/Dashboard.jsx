import React, { useState, useEffect } from 'react';
import { useSensorData } from '../hooks/useSensorData'; 
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  // 1. 「昨日」の日付（YYYY-MM-DD形式）を取得
  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1); 
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const yesterday = getYesterdayString();

  // カレンダーの初期表示用ステート
  const [localStartDate, setLocalStartDate] = useState(yesterday);
  const [localEndDate, setLocalEndDate] = useState(yesterday);

  // 2. カスタムフックを使用（初期値として昨日を渡す）
  const { 
    data, 
    stats,
    loading, 
    fetchData 
  } = useSensorData(yesterday, yesterday);

  // 3. 「表示」ボタンを押したときの処理
  const handleDisplayClick = () => {
    fetchData(localStartDate, localEndDate);
  };

  // Tooltipラベル整形
  const formatTooltipLabel = (value, items) => {
    const activePayload = items?.[0]?.payload;
    if (activePayload && data && data.length > 0) {
      const index = data.findIndex(item => item === activePayload);
      if (index !== -1) {
        if (localStartDate === localEndDate) {
          return `${localStartDate} ${value}`;
        }
        const halfLength = data.length / 2;
        const targetDate = index < halfLength ? localStartDate : localEndDate;
        return `${targetDate} ${value}`;
      }
    }
    return localEndDate ? `${localEndDate} ${value}` : value;
  };

  return (
    <div style={{ padding: '12px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* ヘッダーセクション */}
      <header style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e293b', margin: 0, textAlign: 'center' }}>
          🌥️ 気象データ推移 ☔️
        </h1>
        
        {/* 日付選択コントロール */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <input 
            type="date" 
            value={localStartDate} 
            onChange={(e) => setLocalStartDate(e.target.value)} 
            disabled={loading}
            style={inputStyle}
          />
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>〜</span>
          <input 
            type="date" 
            value={localEndDate} 
            onChange={(e) => setLocalEndDate(e.target.value)} 
            disabled={loading}
            style={inputStyle}
          />
          <button 
            onClick={handleDisplayClick} 
            disabled={loading} 
            style={{...buttonStyle, backgroundColor: loading ? '#94a3b8' : '#16a34a'}}
          >
            {loading ? '読込中...' : '表示'}
          </button>
        </div>
      </header>

      {/* 統計カードセクション */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
        
        {/* 最高気温カード */}
        <div style={{...cardStyle, borderLeft: '5px solid #f43f5e', background: '#fff1f2'}}>
          <p style={{...labelStyle, color: '#be123c'}}>最高気温</p>
          <p style={{...valueStyle, color: '#9f1239'}}>
            {loading ? '--' : (stats?.max ?? '--')} <span style={unitStyle}>℃</span>
          </p>
        </div>
        
        {/* 最低気温カード */}
        <div style={{...cardStyle, borderLeft: '5px solid #0ea5e9', background: '#f0f9ff'}}>
          <p style={{...labelStyle, color: '#0369a1'}}>最低気温</p>
          <p style={{...valueStyle, color: '#075985'}}>
            {loading ? '--' : (stats?.min ?? '--')} <span style={unitStyle}>℃</span>
          </p>
        </div>
        
        {/* 寒暖差カード */}
        <div style={{...cardStyle, borderLeft: '5px solid #ea580c', background: '#fff7ed', gridColumn: 'span 2'}}>
          <p style={{...labelStyle, color: '#c2410c'}}>寒暖差（最大-最小）</p>
          <p style={{...valueStyle, color: '#ea580c'}}>
            {loading ? '--' : (stats?.diff ?? '--')} <span style={unitStyle}>℃</span>
          </p>
        </div>
      </div>

      {/* グラフコンテナ */}
      <div style={graphContainerStyle}>
        <div style={{ padding: '0 16px 10px 16px', borderBottom: '1px solid #f1f5f9', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, textAlign: 'center' }}>気温・湿度推移</h2>
        </div>

        <div style={{ width: '100%', height: '420px', position: 'relative' }}>
          
          {loading ? (
            <div style={loadingOverlayStyle}>
              <div style={spinnerStyle}></div>
              <p style={{ margin: '12px 0 0 0', fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
                データを取得しています...
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: -12, left: -32, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHumi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={6}
                />
                
                <YAxis yAxisId="left" stroke="#f43f5e" fontSize={10} tickLine={false} axisLine={false} unit="℃" />
                <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                
                <Tooltip 
                  labelFormatter={(value, items) => formatTooltipLabel(value, items)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '13px' }}
                />
                
                <Area yAxisId="left" type="monotone" dataKey="temp" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTemp)" name="気温" />
                <Area yAxisId="right" type="monotone" dataKey="humi" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHumi)" name="湿度" />
              </AreaChart>
            </ResponsiveContainer>
          )}
          
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

// スタイル定義
const cardStyle = { padding: '14px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const labelStyle = { fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500', margin: 0 };
const valueStyle = { fontSize: '1.6rem', fontWeight: '900', lineHeight: '1', margin: 0 };
const unitStyle = { fontSize: '0.85rem', fontWeight: 'normal', marginLeft: '2px' };
const graphContainerStyle = { backgroundColor: 'white', padding: '14px 0px 8px 0px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' };
const inputStyle = { padding: '8px 4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '32%', maxWidth: '120px', textAlign: 'center', backgroundColor: '#fff' };
const buttonStyle = { padding: '8px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 };
const loadingOverlayStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.85)', zIndex: 10 };
const spinnerStyle = { width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' };

export default Dashboard;