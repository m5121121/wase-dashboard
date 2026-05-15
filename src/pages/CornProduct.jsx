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

  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    return [...rawData].sort((a, b) => a.time.localeCompare(b.time));
  }, [rawData]);

  /**
   * 最高・最低気温を絶対に表示させるためのカスタムレイヤー
   */
  const CustomLabelLayer = (props) => {
    const { points, width } = props;
    if (!points || points.length === 0) return null;

    // 数値として最高・最低を抽出
    const maxVal = Math.max(...points.map(p => p.value));
    const minVal = Math.min(...points.map(p => p.value));

    // それぞれの最初の1点を探す
    const maxP = points.find(p => p.value === maxVal);
    const minP = points.find(p => p.value === minVal);

    return (
      <g style={{ pointerEvents: 'none' }}>
        {/* 最高気温ラベル */}
        {maxP && (
          <g>
            <circle cx={maxP.x} cy={maxP.y} r={5} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
            <text 
              x={maxP.x} 
              y={maxP.y} 
              dy={-18} 
              // 右端に寄りすぎている場合は左側に寄せる
              dx={maxP.x > width - 60 ? -5 : 5}
              fill="#f43f5e" 
              fontSize={18} 
              fontWeight="900"
              textAnchor={maxP.x > width - 60 ? "end" : "start"}
            >
              最高 {maxVal}℃
            </text>
          </g>
        )}

        {/* 最低気温ラベル */}
        {minP && (
          <g>
            <circle cx={minP.x} cy={minP.y} r={5} fill="#0ea5e9" stroke="#fff" strokeWidth={2} />
            <text 
              x={minP.x} 
              y={minP.y} 
              dy={30} 
              dx={minP.x > width - 60 ? -5 : 5}
              fill="#0ea5e9" 
              fontSize={18} 
              fontWeight="900"
              textAnchor={minP.x > width - 60 ? "end" : "start"}
            >
              最低 {minVal}℃
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
      
      {/* ヘッダー/ヒーローエリア */}
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
          
          {/* グラフ描画エリア */}
          <div style={{ width: '100%', height: '400px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {/* - margin.right: 5 ... 右端の余白を極限まで詰める
                  - margin.left: -25 ... Y軸を隠した分の空白を消す
                  - margin.top: 40 ... 最高気温ラベルが表示されるスペースを確保 
                */}
                <AreaChart data={chartData} margin={{ top: 40, right: 5, left: -25, bottom: 0 }}>
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
                    padding={{ left: 0, right: 0 }}
                  />
                  {/* Y軸の範囲に余裕を持たせてラベルが切れないようにする */}
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
                    // アニメーションをオフにすることでラベル座標の計算ミスを防ぎます
                    isAnimationActive={false} 
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: '#f43f5e' }}
                    // Areaのプロパティとしてカスタムラベル関数を注入
                    label={<CustomLabelLayer />}
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