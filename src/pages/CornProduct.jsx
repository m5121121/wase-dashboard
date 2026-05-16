import React, { useMemo } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

/**
 * 【2軸対応・文字サイズ20px】最高・最低気温のカスタムラベル
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

  // data 配列から最高・最低気温のインデックスを確実に特定
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
      {/* ヘッダーセクション（スマホ時は縦並び、PC時は横並び） */}
      <header style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'space-between', alignItems: 'stretch' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1e293b', margin: 0, textAlign: 'center' }}>
          🚜 裏磐梯農園 管理ダッシュボード
        </h1>
        
        {/* 日付選択コントロール（スマホでもタップしやすいよう横幅いっぱいに広げる） */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
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

      {/* 統計カードセクション（スマホは1列、PCなど幅広画面は自動でグリッド配置） */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={cardStyle}>
          <p style={labelStyle}>最高気温</p>
          <p style={valueStyle}>{stats.max} <span style={unitStyle}>℃</span></p>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>最低気温</p>
          <p style={valueStyle}>{stats.min} <span style={unitStyle}>℃</span></p>
        </div>
        <div style={{...cardStyle, borderLeft: '5px solid #ea580c', background: '#fff7ed', gridColumn: 'span 2 / span 2'}}>
          <p style={{...labelStyle, color: '#c2410c'}}>寒暖差（最大-最小）</p>
          <p style={{...valueStyle, color: '#ea580c'}}>{stats.diff} <span style={unitStyle}>℃</span></p>
        </div>
      </div>

      {/* グラフコンテナ（パディングを左右0にして端まで広げる） */}
      <div style={graphContainerStyle}>
        <div style={{ padding: '0 12px 12px 12px', display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid #f1f5f9', marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>気温・湿度推移</h2>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>※M5Stack(ENV III)からのリアルタイムデータ</div>
        </div>

        {/* グラフ描画エリア */}
        <div style={{ width: '100%', height: '400px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            {/* 左右の margin をネガティブ値（-20）に調整して、無駄な余白を完全にシャットアウト */}
            <AreaChart data={data} margin={{ top: 45, right: -20, left: -20, bottom: 0 }}>
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
              
              {/* paddingを設定して、左右の端のドットが隠れないようにマージンを内部確保 */}
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={6}
                padding={{ left: 15, right: 15 }}
              />
              
              {/* スマホ画面を広く使うため、左右の目盛り(YAxis)は非表示(hide)にします（数値はラベルとTooltipで分かるため） */}
              <YAxis yAxisId="left" domain={['dataMin - 3', 'dataMax + 4']} hide />
              <YAxis yAxisId="right" orientation="right" hide />
              
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              
              {/* 気温グラフ: yAxisId="left" に連動させ、最高・最低ラベルを確実に描画 */}
              <Area 
                yAxisId="left" 
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
              
              {/* 湿度グラフ: yAxisId="right" に連動。ドットはなし */}
              <Area 
                yAxisId="right" 
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

// スマホ最適化スタイルの定義
const cardStyle = { backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const labelStyle = { color: '#64748b', fontSize: '0.8rem', marginBottom: '4px', fontWeight: '500', margin: 0 };
const valueStyle = { fontSize: '1.7rem', fontWeight: '900', color: '#1e293b', lineHeight: '1', margin: 0 };
const unitStyle = { fontSize: '0.9rem', fontWeight: 'normal', marginLeft: '2px' };

// グラフの外枠の左右パディングを0にして、画面幅いっぱいに広げられるように修正
const graphContainerStyle = { backgroundColor: 'white', padding: '16px 0px 8px 0px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' };

const inputStyle = { padding: '8px 6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '33%', maxWidth: '130px', textAlign: 'center', backgroundColor: '#fff' };
const buttonStyle = { padding: '8px 14px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' };

export default Dashboard;