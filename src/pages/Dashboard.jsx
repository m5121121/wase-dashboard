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

  // 2. 💡【最重要】ダッシュボード側だけで管理する「ローカルな日付ステート」を新設します。
  // これにより、カスタムフック内部が勝手に日付を書き戻しても、カレンダーの文字は絶対に影響を受けません。
  const [localStartDate, setLocalStartDate] = useState('2026-05-15');
  const [localEndDate, setLocalEndDate] = useState('2026-05-15');

  // 3. 初回読み込み時にフック側の初期値が存在していれば、ローカルのステートに同期させる
  useEffect(() => {
    if (startDate) setLocalStartDate(startDate);
    if (endDate) setLocalEndDate(endDate);
  }, [startDate, endDate]);

  // 4. 「表示」ボタンを押した時の処理
  const handleDisplayClick = () => {
    // フック側の日付をローカルの値で上書き
    setStartDate(localStartDate);
    setEndDate(localEndDate);
    
    // 少しだけタイミングをずらして（Stateが確実に更新されてから）データを再取得
    setTimeout(() => {
      fetchData();
    }, 50);
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
            // 💡 フックの値ではなく、ダッシュボード側の独立したStateを結びつけるので100%文字が変わります
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
          {/* 💡 独自に作成したクリック関数を呼び出します */}
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

      {/* グラフコンテナ（白い外枠カード）左右の余白を完全排除 */}
      <div style={graphContainerStyle}>
        <div style={{ padding: '0 16px 10px 16px', borderBottom: '1px solid #f1f5f9', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>気温・湿度推移</h2>
        </div>

        {/* グラフ描画エリア：幅100% */}
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
              
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '13px' }}
              />
              
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

// スタイル定義（変更なし）
const cardStyle = { backgroundColor: 'white', padding: '14px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const labelStyle = { color: '#64748b', fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500', margin: 0 };
const valueStyle = { fontSize: '1.6rem', fontWeight: '900', color: '#1e293b', lineHeight: '1', margin: 0 };
const unitStyle = { fontSize: '0.85rem', fontWeight: 'normal', marginLeft: '2px' };
const graphContainerStyle = { backgroundColor: 'white', padding: '14px 0px 8px 0px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' };
const inputStyle = { padding: '8px 4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '32%', maxWidth: '120px', textAlign: 'center', backgroundColor: '#fff', webkitAppearance: 'none' };
const buttonStyle = { padding: '8px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 };

export default Dashboard;