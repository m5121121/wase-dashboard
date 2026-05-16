import React, { useMemo } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, ReferenceDot
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

  // 1. データを時間順にソートし、最高・最低点のオブジェクトを特定
  const { chartData, maxPoint, minPoint } = useMemo(() => {
    if (!rawData || rawData.length === 0) return { chartData: [], maxPoint: null, minPoint: null };
    const sorted = [...rawData].sort((a, b) => a.time.localeCompare(b.time));
    
    // stats.max/min と一致する最初のデータ点を探す
    const maxP = sorted.find(d => d.temp === stats.max);
    const minP = sorted.find(d => d.temp === stats.min);
    
    return { chartData: sorted, maxPoint: maxP, minPoint: minP };
  }, [rawData, stats]);

  /**
   * カスタムラベル描画関数
   */
  const renderLabel = (props, type) => {
    const { cx, cy, value } = props;
    const isMax = type === 'max';
    // 右端付近（全データの90%以降）なら文字を左に寄せる
    const isRightEdge = chartData.indexOf(isMax ? maxPoint : minPoint) > chartData.length * 0.8;

    return (
      <text 
        x={cx} 
        y={cy} 
        dx={isRightEdge ? -12 : 12} 
        dy={isMax ? -15 : 25} 
        fill={isMax ? "#f43f5e" : "#0ea5e9"}
        fontSize={16} 
        fontWeight="900"
        textAnchor={isRightEdge ? "end" : "start"}
        style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: '4px', strokeLinejoin: 'round' }}
      >
        {isMax ? '最高' : '最低'} {value}℃
      </text>
    );
  };

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
                {/* 修正点：right: 0 で余白をなくし、topを広げてラベルスペースを確保 */}
                <AreaChart data={chartData} margin={{ top: 50, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  
                  {/* 修正点：padding right を 0 にして右端まで線を伸ばす */}
                  <XAxis 
                    dataKey="time" 
                    tick={{fontSize: 11, fill: '#64748b', fontWeight: 'bold'}} 
                    dy={10} 
                    padding={{ left: 0, right: 0 }}
                  />
                  {/* Y軸の幅を広げてラベルが上下に切れないようにする */}
                  <YAxis domain={['dataMin - 7', 'dataMax + 7']} hide />
                  
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
                  />

                  {/* 解決策：ReferenceDotを使用してラベルを「強制描画」 */}
                  {maxPoint && (
                    <ReferenceDot 
                      x={maxPoint.time} 
                      y={maxPoint.temp} 
                      r={6} 
                      fill="#f43f5e" 
                      stroke="#fff" 
                      strokeWidth={3}
                      label={(props) => renderLabel(props, 'max')}
                    />
                  )}
                  {minPoint && (
                    <ReferenceDot 
                      x={minPoint.time} 
                      y={minPoint.temp} 
                      r={6} 
                      fill="#0ea5e9" 
                      stroke="#fff" 
                      strokeWidth={3}
                      label={(props) => renderLabel(props, 'min')}
                    />
                  )}
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