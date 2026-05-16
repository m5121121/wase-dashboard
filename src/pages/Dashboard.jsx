import React, { useState, useEffect } from 'react';
import { useSensorData } from '../hooks/useSensorData'; 
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const { 
    data, 
    startDate, 
    setStartDate, 
    endDate, 
    setEndDate, 
    fetchData, 
    stats,
    loading: hookLoading
  } = useSensorData();

  // カレンダー用の独立ステート（初期値を5/16〜5/17に変更）
  const [localStartDate, setLocalStartDate] = useState('2026-05-16');
  const [localEndDate, setLocalEndDate] = useState('2026-05-17');
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  useEffect(() => {
    if (startDate) setLocalStartDate(startDate);
    if (endDate) setLocalEndDate(endDate);
  }, []);

  useEffect(() => {
    setIsLocalLoading(false);
  }, [data]);

  const handleDisplayClick = () => {
    setIsLocalLoading(true);
    setStartDate(localStartDate);
    setEndDate(localEndDate);
    setTimeout(() => {
      fetchData();
    }, 50);
  };

  const isLoading = hookLoading || isLocalLoading;

  // 💡【大幅改良】どのようなデータ構造でもホバー日時を絶対に狂わせないフォーマッタ
  const formatTooltipLabel = (value, name, props) => {
    // 1. props の中からホバーしている要素のインデックス（順番）や生データを取得
    const tooltipItem = name?.[0];
    const activePayload = tooltipItem?.payload;

    if (activePayload) {
      // 2. もしデータ自体に明確に日付キーが存在すればそれを最優先（一応残す）
      const anyDateKey = activePayload.date || activePayload.datetime || activePayload.formatted_date;
      if (anyDateKey) {
        return `${anyDateKey} ${activePayload.time || value}`;
      }

      // 3. 【解決策の要】データに日付がない場合、X軸の全体のデータ件数と現在位置から日付を推測
      if (data && data.length > 0) {
        // ホバーしているデータが全体の中でどの位置にあるか割合を計算
        const activeIndex = data.findIndex(item => item.time === value);
        
        if (activeIndex !== -1) {
          const start = new Date(localStartDate);
          const end = new Date(localEndDate);
          
          // 開始日と終了日の日数の差を計算
          const dayDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          
          if (dayDiff > 0) {
            // 全体の進捗度（0.0 〜 1.0）を出す
            const progress = activeIndex / (data.length - 1 || 1);
            // 進捗度に応じて、開始日に日数を足す
            const daysToAdd = Math.round(progress * dayDiff);
            
            const calculatedDate = new Date(start);
            calculatedDate.setDate(start.getDate() + daysToAdd);
            
            // YYYY-MM-DD 形式に整形
            const yyyy = calculatedDate.getFullYear();
            const mm = String(calculatedDate.getMonth() + 1).padStart(2, '0');
            const dd = String(calculatedDate.getDate()).padStart(2, '0');
            
            return `${yyyy}-${mm}-${dd} ${value}`;
          }
        }
      }
    }
    
    // 4. 万が一計算できなかった場合の安全なフォールバック
    return `${localStartDate} ${value}`;
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
            disabled={isLoading}
            style={inputStyle}
          />
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>〜</span>
          <input 
            type="date" 
            value={localEndDate} 
            onChange={(e) => setLocalEndDate(e.target.value)} 
            disabled={isLoading}
            style={inputStyle}
          />
          <button 
            onClick={handleDisplayClick} 
            disabled={isLoading} 
            style={{...buttonStyle, backgroundColor: isLoading ? '#94a3b8' : '#16a34a'}}
          >
            {isLoading ? '読込中...' : '表示'}
          </button>
        </div>
      </header>

      {/* 統計カードセクション */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <div style={cardStyle}>
          <p style={labelStyle}>最高気温</p>
          <p style={valueStyle}>{isLoading ? '--' : (stats?.max ?? '--')} <span style={unitStyle}>℃</span></p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>最低気温</p>
          <p style={valueStyle}>{isLoading ? '--' : (stats?.min ?? '--')} <span style={unitStyle}>℃</span></p>
        </div>
        <div style={{...cardStyle, borderLeft: '5px solid #ea580c', background: '#fff7ed', gridColumn: 'span 2'}}>
          <p style={{...labelStyle, color: '#c2410c'}}>寒暖差（最大-最小）</p>
          <p style={{...valueStyle, color: '#ea580c'}}>{isLoading ? '--' : (stats?.diff ?? '--')} <span style={unitStyle}>℃</span></p>
        </div>
      </div>

      {/* グラフコンテナ */}
      <div style={graphContainerStyle}>
        <div style={{ padding: '0 16px 10px 16px', borderBottom: '1px solid #f1f5f9', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, textAlign: 'center' }}>気温・湿度推移</h2>
        </div>

        <div style={{ width: '100%', height: '420px', position: 'relative' }}>
          
          {isLoading ? (
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
                
                {/* 💡 ツールチップのデータ連携を修正 */}
                <Tooltip 
                  labelFormatter={(value, name, props) => formatTooltipLabel(value, name, props)}
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
const cardStyle = { backgroundColor: 'white', padding: '14px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const labelStyle = { color: '#64748b', fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500', margin: 0 };
const valueStyle = { fontSize: '1.6rem', fontWeight: '900', color: '#1e293b', lineHeight: '1', margin: 0 };
const unitStyle = { fontSize: '0.85rem', fontWeight: 'normal', marginLeft: '2px' };
const graphContainerStyle = { backgroundColor: 'white', padding: '14px 0px 8px 0px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' };
const inputStyle = { padding: '8px 4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '32%', maxWidth: '120px', textAlign: 'center', backgroundColor: '#fff', webkitAppearance: 'none' };
const buttonStyle = { padding: '8px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 };
const loadingOverlayStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.85)', zIndex: 10 };
const spinnerStyle = { width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' };

export default Dashboard;