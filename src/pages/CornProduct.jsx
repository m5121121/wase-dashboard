import React, { useMemo } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

/**
 * 【復活版・文字サイズ20px】最高・最低気温のカスタムラベル
 */
const CustomMaxMinDot = (props) => {
  const { cx, cy, index, maxIndex, minIndex, maxVal, minVal, dataLength } = props;

  // 1. 最高気温の点
  if (index === maxIndex) {
    const isRightEdge = index > dataLength * 0.85; // 右端付近での文字切れ防止
    return (
      <g id="dashboard-max-label">
        <circle cx={cx} cy={cy} r={7} fill="#f43f5e" stroke="#fff" strokeWidth={3} />
        <text
          x={cx}
          y={cy}
          dx={isRightEdge ? -15 : 15}
          dy={-18}
          fill="#f43f5e"
          fontSize={20}
          fontWeight="900"
          textAnchor={isRightEdge ? "end" : "start"}
          style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: '4px', strokeLinejoin: 'round' }}
        >
          最高 {maxVal}℃
        </text>
      </g>
    );
  }

  // 2. 最低気温の点
  if (index === minIndex) {
    const isRightEdge = index > dataLength * 0.85; // 右端付近での文字切れ防止
    return (
      <g id="dashboard-min-label">
        <circle cx={cx} cy={cy} r={7} fill="#0ea5e9" stroke="#fff" strokeWidth={3} />
        <text
          x={cx}
          y={cy}
          dx={isRightEdge ? -15 : 15}
          dy={32}
          fill="#0ea5e9"
          fontSize={20}
          fontWeight="900"
          textAnchor={isRightEdge ? "end" : "start"}
          style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: '4px', strokeLinejoin: 'round' }}
        >
          最低 {minVal}℃
        </text>
      </g>
    );
  }

  return null;
};

const Dashboard = () => {
  const { 
    data, startDate, setStartDate, endDate, setEndDate, 
    fetchData, stats 
  } = useSensorData();

  // データ配列から最高・最低気温のインデックス（位置）を計算
  const { maxIndex, minIndex } = useMemo(() => {
    if (!data || data.length === 0) return { maxIndex: -1, minIndex: -1 };
    let maxIdx = 0;
    let minIdx = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i].temp > data[maxIdx].temp) maxIdx = i;
      if (data[i].temp < data[minIdx].temp) minIdx = i;
    }
    return { maxIndex: maxIdx, minIndex: minIdx };
  }, [data]);

  return (
    <div style={{ padding: '12px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* ヘッダー：スマホでも絶対に崩れないフレックス配置 */}
      <header style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e293b', margin: 0, textAlign: 'center' }}>
          🚜 裏磐梯農園 管理ダッシュボード
        </h1>
        
        {/* 日付コントロール */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            style={inputStyle}
          />
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>〜</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            style={inputStyle}
          />
          <button onClick={fetchData} style={buttonStyle}>表示</button>
        </div>
      </header>

      {/* 統計カード：スマホは横2列スクイーズ、寒暖差は最下部にワイド配置 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <div style={cardStyle}>
          <p style={labelStyle}>最高気温</p>
          <p style={valueStyle}>{stats.max} <span style={unitStyle}>℃</span></p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>最低気温</p>
          <p style={valueStyle}>{stats.min} <span style={unitStyle}>℃</span></p>
        </div>
        <div style={{...cardStyle, borderLeft: '5px solid #ea580c', background: '#fff7ed', gridColumn: 'span 2'}}>
          <p style={{...labelStyle, color: '#c2410c'}}>寒暖差（最大-最小）</p>
          <p style={{...valueStyle, color: '#ea580c'}}>{stats.diff} <span style={unitStyle}>℃</span></p>
        </div>
      </div>

      {/* グラフ外枠：左右のパディングを完全にゼロにしてスマホ画面いっぱいに広げる */}
      <div style={graphContainerStyle}>
        <div style={{ padding: '0 16px 12px 16px', display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid #f1f5f9', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>気温・湿度推移</h2>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>※M5Stack(ENV III)からのリアルタイムデータ</div>
        </div>

        {/* グラフ描画コンテナ */}
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            {/* 1軸にしたため、左右のマージンを -10 程度にするだけで完全に画面端まで広がります */}
            <AreaChart data={data} margin={{ top: 45, right: -10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHumi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.05}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              
              {/* X軸の文字サイズと余白調整 */}
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={8}
                padding={{ left: 20, right: 20 }}
              />
              
              {/* 余白を殺す原因だった YAxis を1つのみにし、かつ完全に hide します */}
              <YAxis domain={['dataMin - 3', 'dataMax + 4']} hide />
              
              {/* タップ時に気温と湿度が両方バッチリ見えるポップアップ */}
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '13px' }}
              />
              
              {/* 気温レイヤー：1軸に統合。最高・最低ラベルを上部に絶対描画 */}
              <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#f43f5e" 
                strokeWidth={3.5} 
                fillOpacity={1} 
                fill="url(#colorTemp)" 
                name="気温" 
                isAnimationActive={false}
                dot={(props) => (
                  <CustomMaxMinDot 
                    {...props} 
                    maxIndex={maxIndex} 
                    minIndex={minIndex} 
                    maxVal={stats.max} 
                    minVal={stats.min} 
                    dataLength={data.length} 
                  />
                )}
              />
              
              {/* 湿度レイヤー：同じ軸で重ねて描画。ドットはなし */}
              <Area 
                type="monotone" 
                dataKey="humi" 
                stroke="#0ea5e9" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorHumi)" 
                name="湿度"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// スタイル定義（スマホでの見やすさを追求）
const cardStyle = { backgroundColor: 'white', padding: '14px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const labelStyle = { color: '#64748b', fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500', margin: 0 };
const valueStyle = { fontSize: '1.6rem', fontWeight: '900', color: '#1e293b', lineHeight: '1', margin: 0 };
const unitStyle = { fontSize: '0.85rem', fontWeight: 'normal', marginLeft: '2px' };

const graphContainerStyle = { backgroundColor: 'white', padding: '16px 0px 8px 0px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' };

const inputStyle = { padding: '8px 4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '32%', maxWidth: '120px', textAlign: 'center', backgroundColor: '#fff', webkitAppearance: 'none' };
const buttonStyle = { padding: '8px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 };

export default Dashboard;