import React, { useMemo } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, LabelList, Tooltip
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

  /**
   * グラフ用データの整形: 固定時間をやめ、生のデータをソートするだけに簡略化
   */
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    
    // 時間順にソート（これだけでOK）
    const sortedData = [...rawData].sort((a, b) => a.time.localeCompare(b.time));

    // 重複ラベルを避け、最初に出現した最大・最小地点にフラグを立てる
    const maxVal = Number(stats.max);
    const minVal = Number(stats.min);
    let foundMax = false;
    let foundMin = false;

    return sortedData.map(d => {
      const isMax = !foundMax && Number(d.temp) === maxVal;
      const isMin = !foundMin && Number(d.temp) === minVal;
      if (isMax) foundMax = true;
      if (isMin) foundMin = true;
      return { ...d, isTargetMax: isMax, isTargetMin: isMin };
    });
  }, [rawData, stats]);

  if (loading && rawData.length === 0) {
    return <div style={{ textAlign: 'center', padding: '100px 20px', color: '#666' }}>データを読み込み中...</div>;
  }

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
          
          {/* グラフ領域: 右余白をなくす */}
          <div style={{ width: '100%', height: '360px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 40, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  
                  {/* X軸: paddingを最小限に */}
                  <XAxis 
                    dataKey="time" 
                    tick={{fontSize: 10, fill: '#64748b'}} 
                    dy={10}
                    minTickGap={30}
                    padding={{ left: 10, right: 10 }}
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
                    animationDuration={800}
                  >
                    <LabelList 
                      dataKey="temp" 
                      content={(props) => {
                        const { x, y, value, index, payload } = props;
                        
                        if (!payload?.isTargetMax && !payload?.isTargetMin) return null;
                        
                        const isMax = payload.isTargetMax;

                        // 端っこでのラベル切れ防止
                        let textAnchor = "middle";
                        if (index > chartData.length - 5) textAnchor = "end";
                        if (index < 5) textAnchor = "start";

                        return (
                          <g key={`label-${index}`}>
                            <circle cx={x} cy={y} r={5} fill={isMax ? "#f43f5e" : "#0ea5e9"} stroke="#fff" strokeWidth={2} />
                            <text 
                              x={x} y={y} dy={isMax ? -18 : 32} 
                              fill={isMax ? "#f43f5e" : "#0ea5e9"} fontSize={17} fontWeight="900" 
                              textAnchor={textAnchor}
                            >
                              {isMax ? '最高' : '最低'} {value}℃
                            </text>
                          </g>
                        );
                      }} 
                    />
                  </Area>
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