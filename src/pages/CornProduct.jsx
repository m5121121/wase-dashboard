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

  // 1. 生データを時間順にソート（固定時間は行わない）
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    return [...rawData].sort((a, b) => a.time.localeCompare(b.time));
  }, [rawData]);

  if (loading && rawData.length === 0) {
    return <div style={{ textAlign: 'center', padding: '100px 20px', color: '#666' }}>データを読み込み中...</div>;
  }

  // 2. ラベルを「自前で描画」するためのカスタムコンポーネント
  const CustomLabels = (props) => {
    const { points, width } = props; // Areaから渡される座標データ
    if (!points || points.length === 0) return null;

    // 観測データの中での最大・最小値を取得
    const maxVal = Math.max(...points.map(p => p.value));
    const minVal = Math.min(...points.map(p => p.value));

    // 最初に出現した最大地点と最小地点の座標を特定
    const maxPoint = points.find(p => p.value === maxVal);
    const minPoint = points.find(p => p.value === minVal);

    return (
      <g>
        {/* 最高気温ラベル */}
        {maxPoint && (
          <g>
            <circle cx={maxPoint.x} cy={maxPoint.y} r={5} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
            <text 
              x={maxPoint.x} y={maxPoint.y} dy={-15} 
              fill="#f43f5e" fontSize={16} fontWeight="900"
              textAnchor={maxPoint.x > width - 50 ? "end" : "middle"}
            >
              最高 {maxVal}℃
            </text>
          </g>
        )}
        {/* 最低気温ラベル */}
        {minPoint && (
          <g>
            <circle cx={minPoint.x} cy={minPoint.y} r={5} fill="#0ea5e9" stroke="#fff" strokeWidth={2} />
            <text 
              x={minPoint.x} y={minPoint.y} dy={28} 
              fill="#0ea5e9" fontSize={16} fontWeight="900"
              textAnchor={minPoint.x > width - 50 ? "end" : "middle"}
            >
              最低 {minVal}℃
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ 
        position: 'relative', height: '280px', 
        backgroundImage: `url("${heroImagePath}")`, 
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#444'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />
        <h1 style={{
          color: '#000', fontSize: 'clamp(1.6rem, 6vw, 3rem)', fontWeight: '900', zIndex: 1,
          textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 2px 0 0 #fff, -2px 0 0 #fff, 4px 4px 10px rgba(0,0,0,0.3)'
        }}>
          裏磐梯ゴールドラッシュ
        </h1>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '15px 10px' }}>
        <div style={{ 
          backgroundColor: '#fff', padding: '20px 10px', borderRadius: '16px', 
          boxShadow: '0 4px 25px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0'
        }}>
          
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
            alignItems: 'center', gap: '10px', marginBottom: '10px', padding: '0 5px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: 'bold', borderLeft: '6px solid #f43f5e', paddingLeft: '12px', margin: 0 }}>
                24時間の気温変化
              </h3>
              <p style={{ color: '#64748b', margin: '2px 0 0 18px', fontSize: '0.75rem' }}>{yesterdayString}</p>
            </div>
            
            <div style={{ 
              backgroundColor: '#ea580c', color: 'white', padding: '8px 15px', borderRadius: '10px', 
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>昨日の寒暖差</span>
              <span style={{ fontSize: '1.6rem', fontWeight: '900' }}>
                {rawData.length > 0 ? stats.diff : '--'}<small style={{fontSize: '0.9rem', marginLeft: '2px'}}>℃</small>
              </span>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '360px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {/* グラフの左右余白を完全になくす(right: 0, left: -25) */}
                <AreaChart data={chartData} margin={{ top: 40, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  
                  <XAxis 
                    dataKey="time" 
                    tick={{fontSize: 10, fill: '#64748b'}} 
                    dy={10}
                    minTickGap={30}
                  />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                  
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`${value} ℃`, '気温']}
                  />

                  <ReferenceLine y={stats.max} stroke="#f43f5e" strokeWidth={1} strokeDasharray="3 3" />
                  <ReferenceLine y={stats.min} stroke="#0ea5e9" strokeWidth={1} strokeDasharray="3 3" />

                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#f43f5e" 
                    strokeWidth={3} 
                    fill="url(#tempGradient)"
                    isAnimationActive={false} // 確実にラベルを座標に合わせるためオフ
                    label={<CustomLabels />} // ここで自作ラベルを注入
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                データがありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CornProduct;