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
   * グラフ用データの整形
   */
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    
    // 時間順にソート
    const sortedData = [...rawData].sort((a, b) => a.time.localeCompare(b.time));
    const displayData = [...sortedData];

    // 00:00と23:59を補完してグラフを横いっぱいに広げる
    if (displayData[0].time > "00:00") {
      displayData.unshift({ ...displayData[0], time: "00:00", isGenerated: true });
    }
    if (displayData[displayData.length - 1].time < "23:59") {
      displayData.push({ ...displayData[displayData.length - 1], time: "23:59", isGenerated: true });
    }

    // ラベルを表示する地点を厳密に特定（生成された端点データは除外）
    // 数値の微差による不一致を防ぐため、四捨五入して比較
    const maxVal = Math.round(Number(stats.max) * 10) / 10;
    const minVal = Math.round(Number(stats.min) * 10) / 10;

    const maxIndex = displayData.findIndex(d => !d.isGenerated && Math.round(Number(d.temp) * 10) / 10 === maxVal);
    const minIndex = displayData.findIndex(d => !d.isGenerated && Math.round(Number(d.temp) * 10) / 10 === minVal);

    return displayData.map((d, i) => ({
      ...d,
      isTargetMax: i === maxIndex,
      isTargetMin: i === minIndex
    }));
  }, [rawData, stats]);

  if (loading && rawData.length === 0) {
    return <div style={{ textAlign: 'center', padding: '100px 20px', color: '#666' }}>読み込み中...</div>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* ヒーローセクション */}
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
          
          {/* ヘッダー領域 */}
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
          
          {/* グラフ領域: 右余白を0に設定 */}
          <div style={{ width: '100%', height: '360px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 40, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  
                  <XAxis 
                    dataKey="time" 
                    ticks={['00:00', '06:00', '12:00', '18:00', '23:59']}
                    tick={{fontSize: 10, fill: '#64748b'}} 
                    dy={10}
                    padding={{ left: 5, right: 5 }}
                  />
                  <YAxis domain={['dataMin - 6', 'dataMax + 6']} hide />
                  
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
                    animationDuration={1000}
                  >
                    <LabelList 
                      dataKey="temp" 
                      content={(props) => {
                        const { x, y, value, index, payload } = props;
                        
                        // 前段の整形ロジックで付与したターゲットフラグを使用
                        if (!payload?.isTargetMax && !payload?.isTargetMin) return null;
                        
                        const isMax = payload.isTargetMax;

                        // 端っこでのラベル切れ防止（判定を少し緩める）
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