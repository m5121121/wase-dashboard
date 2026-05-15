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
   * グラフ用データの整形: 0:00〜23:59の枠組みを保証
   */
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    
    // 0時から23時までのマスタを作成し、データがある時間は上書きする
    const fullDay = Array.from({ length: 24 }, (_, i) => {
      const hour = String(i).padStart(2, '0') + ':00';
      return { time: hour, temp: null, isPlaceholder: true };
    });

    rawData.forEach(d => {
      const hour = d.time.split(':')[0] + ':00';
      const target = fullDay.find(f => f.time === hour);
      if (target) {
        target.temp = d.temp;
        target.isPlaceholder = false;
      }
    });

    return fullDay;
  }, [rawData]);

  if (loading && rawData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', fontSize: '1.2rem', color: '#666' }}>
        昨日の栽培データを読み込み中...
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif', 
      color: '#333', backgroundColor: '#f8fafc', minHeight: '100vh' 
    }}>
      
      {/* ヒーローセクション */}
      <div style={{ 
        position: 'relative', height: '300px', 
        backgroundImage: `url("${heroImagePath}")`, 
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#444'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />
        <div style={{ textAlign: 'center', padding: '0 20px', zIndex: 1 }}>
          <h1 style={{
            color: '#000', fontSize: 'clamp(1.8rem, 7vw, 3.2rem)', fontWeight: '900',
            textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 2px 0 0 #fff, -2px 0 0 #fff, 4px 4px 10px rgba(0,0,0,0.4)'
          }}>
            裏磐梯ゴールドラッシュ
          </h1>
        </div>
      </div>

      {/* データセクション */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 10px' }}>
        
        <div style={{ 
          backgroundColor: '#fff', padding: '20px 15px', borderRadius: '16px', 
          boxShadow: '0 4px 25px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0'
        }}>
          
          {/* ヘッダー領域: marginBottomを縮小 */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
            alignItems: 'center', gap: '10px', marginBottom: '15px', padding: '0 5px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: 'bold', borderLeft: '6px solid #f43f5e', paddingLeft: '12px', margin: 0 }}>
                24時間の気温変化
              </h3>
              <p style={{ color: '#64748b', margin: '4px 0 0 18px', fontSize: '0.8rem' }}>{yesterdayString} (0:00 - 23:59)</p>
            </div>
            
            <div style={{ 
              backgroundColor: '#ea580c', color: 'white', padding: '8px 15px', borderRadius: '10px', 
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>昨日の寒暖差</span>
              <span style={{ fontSize: '1.6rem', fontWeight: '900' }}>
                {rawData.length > 0 ? stats.diff : '--'}<small style={{fontSize: '0.9rem'}}>℃</small>
              </span>
            </div>
          </div>
          
          {/* グラフ表示エリア: 上の要素との間隔を詰めるため marginTop を調整 */}
          <div style={{ width: '100%', height: '350px', marginTop: '0' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 40, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  
                  {/* X軸: 0時から23時までを固定表示 */}
                  <XAxis 
                    dataKey="time" 
                    ticks={['00:00', '06:00', '12:00', '18:00', '23:00']}
                    tick={{fontSize: 11, fill: '#64748b'}} 
                    dy={10} 
                  />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                  
                  {/* タップ時に値を表示する設定 */}
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`${value} ℃`, '気温']}
                    labelStyle={{ fontWeight: 'bold', color: '#64748b' }}
                  />

                  <ReferenceLine y={stats.max} stroke="#f43f5e" strokeWidth={1} strokeDasharray="3 3" />
                  <ReferenceLine y={stats.min} stroke="#0ea5e9" strokeWidth={1} strokeDasharray="3 3" />

                  <Area 
                    connectNulls // データが飛んでいる場所を補完して線をつなぐ
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
                        const { x, y, value, index } = props;
                        if (value !== stats.max && value !== stats.min) return null;
                        
                        let textAnchor = "middle";
                        if (index > 20) textAnchor = "end";
                        if (index < 4) textAnchor = "start";

                        const isMax = value === stats.max;
                        return (
                          <g key={`label-${index}`}>
                            <circle cx={x} cy={y} r={5} fill={isMax ? "#f43f5e" : "#0ea5e9"} stroke="#fff" strokeWidth={2} />
                            <text 
                              x={x} y={y} dy={isMax ? -18 : 28} 
                              fill={isMax ? "#f43f5e" : "#0ea5e9"} fontSize={16} fontWeight="900" 
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