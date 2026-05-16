import React, { useMemo } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip
} from 'recharts';

/**
 * 最高・最低気温のカスタムラベル（文字サイズ拡大版）
 */
const CustomMaxMinDot = (props) => {
  const { cx, cy, index, maxIndex, minIndex, maxVal, minVal, dataLength } = props;

  // 1. 最高気温の点（文字サイズを大きく調整）
  if (index === maxIndex) {
    const isRightEdge = index > dataLength * 0.85;
    return (
      <g id="forced-max-label">
        <circle cx={cx} cy={cy} r={7} fill="#f43f5e" stroke="#fff" strokeWidth={3} />
        <text
          x={cx}
          y={cy}
          dx={isRightEdge ? -15 : 15} // 文字サイズに合わせて余白を少し拡大
          dy={-18}                   // 文字がドットに被らないよう少し上に引き上げ
          fill="#f43f5e"
          fontSize={20}              // ★15から20にサイズアップ！
          fontWeight="900"
          textAnchor={isRightEdge ? "end" : "start"}
          style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: '4px', strokeLinejoin: 'round' }}
        >
          最高 {maxVal}℃
        </text>
      </g>
    );
  }

  // 2. 最低気温の点（文字サイズを大きく調整）
  if (index === minIndex) {
    const isRightEdge = index > dataLength * 0.85;
    return (
      <g id="forced-min-label">
        <circle cx={cx} cy={cy} r={7} fill="#0ea5e9" stroke="#fff" strokeWidth={3} />
        <text
          x={cx}
          y={cy}
          dx={isRightEdge ? -15 : 15} // 文字サイズに合わせて余白を少し拡大
          dy={32}                    // 文字が大きくなった分、少し下側に余裕を持たせる
          fill="#0ea5e9"
          fontSize={20}              // ★15から20にサイズアップ！
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

const CornProduct = () => {
  const baseUrl = import.meta.env.BASE_URL || "/";
  const heroImagePath = `${baseUrl}corn-hero.jpg`;

  const yesterdayString = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const { data: rawData, stats, loading } = useSensorData(yesterdayString, yesterdayString);

  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    return [...rawData].sort((a, b) => a.time.localeCompare(b.time));
  }, [rawData]);

  const { maxIndex, minIndex } = useMemo(() => {
    if (!chartData || chartData.length === 0) return { maxIndex: -1, minIndex: -1 };
    let maxIdx = 0;
    let minIdx = 0;
    for (let i = 1; i < chartData.length; i++) {
      if (chartData[i].temp > chartData[maxIdx].temp) maxIdx = i;
      if (chartData[i].temp < chartData[minIdx].temp) minIdx = i;
    }
    return { maxIndex: maxIdx, minIndex: minIdx };
  }, [chartData]);

  if (loading && rawData.length === 0) {
    return <div style={{ textAlign: 'center', padding: '100px', color: '#666' }}>データを読み込み中...</div>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ position: 'relative', height: '320px', backgroundImage: `url("${heroImagePath}")`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#444' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />
        <h1 style={{ color: '#000', fontSize: 'clamp(1.8rem, 7vw, 3.8rem)', fontWeight: '900', zIndex: 1, textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 0 0 10px rgba(0,0,0,0.2)' }}>
          裏磐梯ゴールドラッシュ
        </h1>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 10px' }}>
        <div style={{ backgroundColor: '#fff', padding: '25px 0px', borderRadius: '16px', boxShadow: '0 4px 25px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          
          <div style={{ padding: '0 15px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: 'bold', borderLeft: '6px solid #f43f5e', paddingLeft: '12px', margin: 0 }}>
              24時間の気温変化 <small style={{ fontWeight: 'normal', fontSize: '0.8rem', color: '#64748b', display: 'block' }}>{yesterdayString}</small>
            </h3>
            
            <div style={{ backgroundColor: '#ea580c', color: 'white', padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>昨日の寒暖差</span>
              <span style={{ fontSize: '1.8rem', fontWeight: '900' }}>
                {chartData.length > 0 ? stats.diff : '--'}<small style={{fontSize: '1rem'}}>℃</small>
              </span>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '450px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 40, right: 15, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  
                  <XAxis 
                    dataKey="time" 
                    tick={{fontSize: 11, fill: '#64748b', fontWeight: 'bold'}} 
                    dy={10} 
                  />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                  
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontSize: '14px', fontWeight: 'bold' }}
                    formatter={(val) => [`${val} ℃`, '気温']}
                  />

                  <ReferenceLine y={stats.max} stroke="#f43f5e" strokeWidth={1} strokeDasharray="4 4" />
                  <ReferenceLine y={stats.min} stroke="#0ea5e9" strokeWidth={1} strokeDasharray="4 4" />

                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#f43f5e" 
                    strokeWidth={4} 
                    fill="url(#tempGradient)"
                    isAnimationActive={false} 
                    dot={(props) => (
                      <CustomMaxMinDot 
                        {...props} 
                        maxIndex={maxIndex} 
                        minIndex={minIndex} 
                        maxVal={stats.max} 
                        minVal={stats.min} 
                        dataLength={chartData.length} 
                      />
                    )}
                  />

                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>データが存在しません</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CornProduct;