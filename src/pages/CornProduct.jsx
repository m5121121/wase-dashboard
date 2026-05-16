import React, { useMemo } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

/**
 * 【文字サイズ20px版】最高・最低気温のカスタムラベルコンポーネント
 */
const CustomMaxMinDot = (props) => {
  const { cx, cy, index, maxIndex, minIndex, maxVal, minVal, dataLength } = props;

  // 1. 最高気温の点
  if (index === maxIndex) {
    const isRightEdge = index > dataLength * 0.85; // 右端での文字切れ対策
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
    const isRightEdge = index > dataLength * 0.85; // 右端での文字切れ対策
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

  // 現在の data 配列から「最高気温」「最低気温」のインデックス（何番目か）を確実に特定する
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
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
          🚜 裏磐梯農園 管理ダッシュボード
        </h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            style={inputStyle}
          />
          <span style={{ color: '#64748b' }}>〜</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            style={inputStyle}
          />
          <button onClick={fetchData} style={buttonStyle}>表示</button>
        </div>
      </header>

      {/* 統計カードセクション */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={cardStyle}>
          <p style={labelStyle}>最高気温</p>
          <p style={valueStyle}>{stats.max} <span style={unitStyle}>℃</span></p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>最低気温</p>
          <p style={valueStyle}>{stats.min} <span style={unitStyle}>℃</span></p>
        </div>
        <div style={{...cardStyle, borderLeft: '5px solid #ea580c', background: '#fff7ed'}}>
          <p style={{...labelStyle, color: '#c2410c'}}>寒暖差（最大-最小）</p>
          <p style={{...valueStyle, color: '#ea580c'}}>{stats.diff} <span style={unitStyle}>℃</span></p>
        </div>
      </div>

      {/* グラフセクション */}
      <div style={graphContainerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>気温・湿度推移</h2>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>※M5Stack(ENV III)からのリアルタイムデータ</div>
        </div>
        <div style={{ width: '100%', height: '450px' }}>
          <ResponsiveContainer width="100%" height="100%">
            {/* margin.top を 40 に広げて大きな文字が上に切れないように調整 */}
            <AreaChart data={data} margin={{ top: 40, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHumi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#f43f5e" fontSize={12} tickLine={false} axisLine={false} unit="℃" />
              <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" fontSize={12} tickLine={false} axisLine={false} unit="%" />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              
              {/* 気温のAreaコンポーネントの dot 属性にカスタム関数を注入。バグ回避のためアニメーションはオフにします */}
              <Area 
                yAxisId="left" 
                type="monotone" 
                dataKey="temp" 
                stroke="#f43f5e" 
                strokeWidth={3} 
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
              
              {/* 湿度はドットなしのまま維持 */}
              <Area yAxisId="right" type="monotone" dataKey="humi" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorHumi)" name="湿度" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// スタイル定義
const cardStyle = { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const labelStyle = { color: '#64748b', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '500' };
const valueStyle = { fontSize: '2.2rem', fontWeight: 'bold', color: '#1e293b', lineHeight: '1' };
const unitStyle = { fontSize: '1.1rem', fontWeight: 'normal', marginLeft: '4px' };
const graphContainerStyle = { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const inputStyle = { padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem' };
const buttonStyle = { padding: '8px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };

export default Dashboard;