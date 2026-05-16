import React, { useState, useEffect } from 'react';
import { useSensorData } from '../hooks/useSensorData'; 
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  // 1. フックから必要な関数と状態を取得
  const { 
    data, 
    startDate, 
    setStartDate, 
    endDate, 
    setEndDate, 
    fetchData, 
    stats 
  } = useSensorData();

  // 2. 💡初期値を最新データの「2026-05-16」に設定し、完全に独立したステートで管理します
  const [localStartDate, setLocalStartDate] = useState('2026-05-16');
  const [localEndDate, setLocalEndDate] = useState('2026-05-16');

  // 3. 💡フック側の強制書き戻しによるバグを防ぐため、初回起動時のみ同期させます
  useEffect(() => {
    if (startDate) setLocalStartDate(startDate);
    if (endDate) setLocalEndDate(endDate);
  }, []); // 空配列にすることで、初回以外はカレンダーの文字が勝手に戻らなくなります

  // 4. 「表示」ボタンを押した時の処理
  const handleDisplayClick = () => {
    setStartDate(localStartDate);
    setEndDate(localEndDate);
    
    // 状態が確実に反映されてからデータ再取得をかけるため、わずかに遅延を入れます
    setTimeout(() => {
      fetchData();
    }, 50);
  };

  // 5. 💡ホバー（ツールチップ）時のタイトルを「日付 + 時間」の形式に整形する関数
  const formatTooltipLabel = (timeLabel) => {
    // localStartDate (例: "2026-05-16") とデータの時間 (例: "12:00") を結合
    return `${localStartDate} ${timeLabel}`;
  };

  return (
    <div style={{ padding: '12px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* ヘッダーセクション */}
      <header style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e293b', margin: 0, textAlign: 'center' }}>
          🚜 裏磐梯農園 管理ダッシュボード
        </h1>
        
        {/* 日付選択コントロール */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <input 
            type="date" 
            value={localStartDate} 
            onChange={(e) => setLocalStartDate(e.target.value)} 
            style={inputStyle}
          />
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>〜</span>
          <input 
            type="date" 
            value={localEndDate} 
            onChange={(e) => setLocalEndDate(e.target.value)} 
            style={inputStyle}
          />
          <button onClick={handleDisplayClick} style={buttonStyle}>表示</button>
        </div>
      </header>

      {/* 統計カードセクション */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <div style={cardStyle}>
          <p style={labelStyle}>最高気温</p>
          <p style={valueStyle}>{stats?.max ?? '--'} <span style={unitStyle}>℃</span></p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>最低気温</p>
          <p style={valueStyle}>{stats?.min ?? '--'} <span style={unitStyle}>℃</span></p>
        </div>
        <div style={{...cardStyle, borderLeft: '5px solid #ea580c', background: '#fff7ed', gridColumn: 'span 2'}}>
          <p style={{...labelStyle, color: '#c2410c'}}>寒暖差（最大-最小）</p>
          <p style={{...valueStyle, color: '#ea580c'}}>{stats?.diff ?? '--'} <span style={unitStyle}>℃</span></p>
        </div>
      </div>

      {/* グラフコンテナ */}
      <div style={graphContainerStyle}>
        <div style={{ padding: '0 16px 10px 16px', borderBottom: '1px solid #f1f5f9', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>気温・湿度推移</h2>
        </div>

        {/* グラフ描画エリア */}
        <div style={{ width: '100%', height: '420px' }}>
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
              
              {/* 💡 labelFormatter を指定して、ホバー時に日時（YYYY-MM-DD HH:MM）で表示されるようにします */}
              <Tooltip 
                labelFormatter={formatTooltipLabel}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '13px' }}
              />
              
              {/* 気温レイヤー */}
              <Area 
                yAxisId="left" 
                type="monotone" 
                dataKey="temp" 
                stroke="#f43f5e" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorTemp)" 
                name="気温" 
              />
              
              {/* 湿度レイヤー */}
              <Area 
                yAxisId="right" 
                type="monotone" 
                dataKey="humi" 
                stroke="#0ea5e9" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorHumi)" 
                name="湿度" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// スタイル定義
const cardStyle = { backgroundColor: 'white', padding: '14px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const labelStyle = { color: '#64748b', fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500', margin: 0 };
const valueStyle = { fontSize: '1.6rem', fontWeight: '900', color: '#1e293b', lineHeight: '1', margin: 0 };
const unitStyle = { fontSize: '0.85rem', fontWeight: 'normal', marginLeft: '2px' };
const graphContainerStyle = { backgroundColor: 'white', padding: '14px 0px 8px 0px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' };
const inputStyle = { padding: '8px 4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '32%', maxWidth: '120px', textAlign: 'center', backgroundColor: '#fff', webkitAppearance: 'none' };
const buttonStyle = { padding: '8px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 };

export default Dashboard;