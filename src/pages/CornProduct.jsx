import React, { useMemo } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, Customized
} from 'recharts';

/**
 * 【絶対表示のための究極の解決策】
 * Rechartsが計算した画面上の生のSVG座標(x, y)を直接引っこ抜いて
 * 最高・最低気温のドットとテキストを強制的に描画するカスタムレイヤーです。
 */
const AbsoluteMaxMinLabels = (props) => {
  const { formattedGraphicalItems, width } = props;
  
  // 画面上に描画されている線のデータを取得
  const points = formattedGraphicalItems?.[0]?.props?.points;
  if (!points || points.length === 0) return null;

  // 配列の中から数値として純粋に「最高」「最低」の座標点を特定
  let maxP = points[0];
  let minP = points[0];

  for (let i = 1; i < points.length; i++) {
    if (Number(points[i].value) > Number(maxP.value)) maxP = points[i];
    if (Number(points[i].value) < Number(minP.value)) minP = points[i];
  }

  // 右端の壁（グラフ全体の85%以上の位置）にいる場合は、テキストを左側に寄せて見切れを防ぐ
  const isMaxRightEdge = maxP.x > width * 0.85;
  const isMinRightEdge = minP.x > width * 0.85;

  return (
    <g id="absolute-max-min-labels" style={{ pointerEvents: 'none' }}>
      {/* 1. 最高気温のピンポイント描画 */}
      <circle cx={maxP.x} cy={maxP.y} r={6} fill="#f43f5e" stroke="#fff" strokeWidth={3} />
      <text
        x={maxP.x}
        y={maxP.y}
        dx={isMaxRightEdge ? -12 : 12}
        dy={-15} // 点の少し上に配置
        fill="#f43f5e"
        fontSize={16}
        fontWeight="900"
        textAnchor={isMaxRightEdge ? "end" : "start"}
        style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: '4px', strokeLinejoin: 'round' }}
      >
        最高 {maxP.value}℃
      </text>

      {/* 2. 最低気温のピンポイント描画 */}
      <circle cx={minP.x} cy={minP.y} r={6} fill="#0ea5e9" stroke="#fff" strokeWidth={3} />
      <text
        x={minP.x}
        y={minP.y}
        dx={isMinRightEdge ? -12 : 12}
        dy={25} // 点の少し下に配置
        fill="#0ea5e9"
        fontSize={16}
        fontWeight="900"
        textAnchor={isMinRightEdge ? "end" : "start"}
        style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: '4px', strokeLinejoin: 'round' }}
      >
        最低 {minP.value}℃
      </text>
    </g>
  );
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
                {/* right: 0 で完全に右端を詰め、top: 40 で上部に文字が入る隙間を作ります */}
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
                    tick={{fontSize: 11, fill: '#64748b', fontWeight: 'bold'}} 
                    dy={10} 
                    padding={{ left: 0, right: 0 }}
                  />
                  {/* ラベルが上下のクリッピングで消されないよう、グラフ内部の上下幅にゆとりを持たせる */}
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
                  />

                  {/* 今回のコアとなる修正：
                    Rechartsの標準機能をバイパスして、計算されたグラフィック要素の上に直接ラベルレイヤーを割り込ませます。
                  */}
                  <Customized component={AbsoluteMaxMinLabels} />

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