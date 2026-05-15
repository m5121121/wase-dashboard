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

  // 1. データを時間順にソート
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    return [...rawData].sort((a, b) => a.time.localeCompare(b.time));
  }, [rawData]);

  /**
   * 2. 最高・最低気温ラベル カスタムコンポーネント
   * マージンがなくても確実にグラフ内側に表示されるように座標を計算します。
   */
  const CustomLabels = (props) => {
    const { points, width } = props;
    if (!points || points.length === 0) return null;

    const maxVal = Math.max(...points.map(p => p.value));
    const minVal = Math.min(...points.map(p => p.value));

    // 最初に見つかった最高・最低点を採用
    const maxP = points.find(p => p.value === maxVal);
    const minP = points.find(p => p.value === minVal);

    return (
      <g>
        {maxP && (
          <g>
            <circle cx={maxP.x} cy={maxP.y} r={5} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
            <text 
              x={maxP.x} 
              y={maxP.y} 
              // 右端に近い場合は左に寄せる(右余白ゼロ対応)
              dx={maxP.x > width - 60 ? -5 : 0} 
              dy={-15} 
              fill="#f43f5e" 
              fontSize={16} 
              fontWeight="900"
              textAnchor={maxP.x > width - 60 ? "end" : "middle"}
            >
              最高 {maxVal}℃
            </text>
          </g>
        )}
        {minP && (
          <g>
            <circle cx={minP.x} cy={minP.y} r={5} fill="#0ea5e9" stroke="#fff" strokeWidth={2} />
            <text 
              x={minP.x} 
              y={minP.y} 
              dx={minP.x > width - 60 ? -5 : 0} 
              dy={25} 
              fill="#0ea5e9" 
              fontSize={16} 
              fontWeight="900"
              textAnchor={minP.x > width - 60 ? "end" : "middle"}
            >
              最低 {minP.value}℃
            </text>
          </g>
        )}
      </g>
    );
  };

  if (loading && rawData.length === 0) {
    return <div style={{ textAlign: 'center', padding: '100px', color: '#666' }}>データを読み込み中...</div>;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* ヒーローエリア */}
      <div style={{ position: 'relative', height: '320px', backgroundImage: `url("${heroImagePath}")`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#444' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />
        <h1 style={{ color: '#000', fontSize: 'clamp(1.8rem, 7vw, 3.8rem)', fontWeight: '900', zIndex: 1, textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 0 0 10px rgba(0,0,0,0.2)' }}>
          裏磐梯ゴールドラッシュ
        </h1>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 10px' }}>
        <div style={{ backgroundColor: '#fff', padding: '25px 15px', borderRadius: '16px', boxShadow: '0 4px 25px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: 'bold', borderLeft: '6px solid #f43f5e', paddingLeft: '12px', margin: 0 }}>
              24時間の気温変化 <small style={{ fontWeight: 'normal', fontSize: '0.8rem', color: '#64748b', display: 'block' }}>{yesterdayString}</small>
            </h3>
            
            <div style={{ backgroundColor: '#ea580c', color: 'white', padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>昨日の寒暖差</span>
              <span style={{ fontSize: '1.8rem', fontWeight: '900' }}>
                {chartData.length > 0 ? stats.diff : '--'}<small style={{fontSize: '1rem'}}>℃</small>
              </span>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '400px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {/* ポイント: 
                  - right: 0 に設定して右の隙間を消す
                  - left: -20 は YAxis を隠した分の空間を詰めるため
                */}
                <AreaChart data={chartData} margin={{ top: 30, right: 0, left: -20, bottom: 0 }}>
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
                    padding={{ left: 10, right: 10 }} // 右端のドットが切れないよう調整
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
                    isAnimationActive={false} // アニメーションOFFにするとラベル位置が安定
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#f43f5e' }}
                    label={<CustomLabels />}
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