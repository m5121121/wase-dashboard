import React, { useMemo } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip 
} from 'recharts';

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

  // 1. 実データのみを時間順にソート（固定時間は行わない）
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    return [...rawData].sort((a, b) => a.time.localeCompare(b.time));
  }, [rawData]);

  /**
   * 2. 最高・最低気温ラベルを確実に描画するカスタムコンポーネント
   */
  const CustomLabels = (props) => {
    const { points, width } = props;
    if (!points || points.length === 0) return null;

    // 数値として最大・最小を特定
    const maxVal = Math.max(...points.map(p => p.value));
    const minVal = Math.min(...points.map(p => p.value));

    const maxPoint = points.find(p => p.value === maxVal);
    const minPoint = points.find(p => p.value === minVal);

    return (
      <g>
        {maxPoint && (
          <g key="label-max">
            <circle cx={maxPoint.x} cy={maxPoint.y} r={6} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
            <text 
              x={maxPoint.x} 
              y={maxPoint.y} 
              dx={maxPoint.x > width - 70 ? -10 : 0} 
              dy={-20} 
              fill="#f43f5e" 
              fontSize={18} 
              fontWeight="900"
              textAnchor={maxPoint.x > width - 70 ? "end" : "middle"}
            >
              最高 {maxVal}℃
            </text>
          </g>
        )}
        {minPoint && (
          <g key="label-min">
            <circle cx={minPoint.x} cy={minPoint.y} r={6} fill="#0ea5e9" stroke="#fff" strokeWidth={2} />
            <text 
              x={minPoint.x} 
              y={minPoint.y} 
              dx={minPoint.x > width - 70 ? -10 : 0} 
              dy={35} 
              fill="#0ea5e9" 
              fontSize={18} 
              fontWeight="900"
              textAnchor={minPoint.x > width - 70 ? "end" : "middle"}
            >
              最低 {minVal}℃
            </text>
          </g>
        )}
      </g>
    );
  };

  if (loading && rawData.length === 0) {
    return <div style={{ textAlign: 'center', padding: '100px 20px', color: '#666' }}>読み込み中...</div>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ 
        position: 'relative', height: '320px', 
        backgroundImage: `url("${heroImagePath}")`, 
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#444'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />
        <h1 style={{
          color: '#000', fontSize: 'clamp(1.8rem, 7vw, 3.8rem)', fontWeight: '900', zIndex: 1,
          textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 2px 0 0 #fff, -2px 0 0 #fff, 4px 4px 10px rgba(0,0,0,0.4)'
        }}>
          裏磐梯ゴールドラッシュ
        </h1>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 10px' }}>
        <div style={{ 
          backgroundColor: '#fff', padding: '25px 15px', borderRadius: '16px', 
          boxShadow: '0 4px 25px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0'
        }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
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
          
          <div style={{ width: '100%', height: '400px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {/* 右端のラベル切れを防ぐため right: 45 を確保 
                  Y軸を隠しているため left: -20 で左に寄せる 
                */}
                <AreaChart data={chartData} margin={{ top: 45, right: 45, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{fontSize: 11, fill: '#64748b', fontWeight: 'bold'}} dy={10} minTickGap={35} />
                  <YAxis domain={['dataMin - 6', 'dataMax + 6']} hide />
                  
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
                    activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff', fill: '#f43f5e' }}
                    label={<CustomLabels />}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>データがありません</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CornProduct;