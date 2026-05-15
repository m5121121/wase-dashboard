import React, { useMemo } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip 
} from 'recharts';

const CornProduct = () => {
  const baseUrl = import.meta.env.BASE_URL || "/";
  const heroImagePath = `${baseUrl}corn-hero.jpg`;

  /**
   * 1. 日付の計算（昨日分を表示）
   */
  const yesterdayString = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  /**
   * 2. データの取得
   */
  const { data: rawData, stats, loading } = useSensorData(yesterdayString, yesterdayString);

  /**
   * 3. グラフ用データの整形
   * APIから来たデータを時間順にソート。0:00〜23:59の固定はせず、実データ範囲のみ描画。
   */
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    return [...rawData].sort((a, b) => a.time.localeCompare(b.time));
  }, [rawData]);

  /**
   * 4. カスタムラベル・コンポーネント
   * Rechartsの標準ラベルは枠外へのはみ出しに弱いため、
   * 座標を直接受け取って「右端なら左に寄せる」処理を行う。
   */
  const CustomLabels = (props) => {
    const { points, width } = props;
    if (!points || points.length === 0) return null;

    const maxVal = Math.max(...points.map(p => p.value));
    const minVal = Math.min(...points.map(p => p.value));

    // 最初に見つかった最高点・最低点を採用
    const maxPoint = points.find(p => p.value === maxVal);
    const minPoint = points.find(p => p.value === minVal);

    return (
      <g>
        {maxPoint && (
          <g>
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
          <g>
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
        position: 'relative', height: '320px', 
        backgroundImage: `url("${heroImagePath}")`, 
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#444'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />
        <div style={{ textAlign: 'center', padding: '0 20px', zIndex: 1 }}>
          <h1 style={{
            color: '#000', fontSize: 'clamp(1.8rem, 7vw, 3.8rem)', fontWeight: '900',
            textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 2px 0 0 #fff, -2px 0 0 #fff, 4px 4px 10px rgba(0,0,0,0.4)'
          }}>
            裏磐梯ゴールドラッシュ
          </h1>
          <p style={{ 
            color: '#fff', fontSize: 'clamp(0.9rem, 4vw, 1.4rem)', marginTop: '15px', 
            fontWeight: '800', textShadow: '2px 2px 8px rgba(0,0,0,0.8)'
          }}>
            標高800mの寒暖差が育んだ、極上の甘み
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 10px' }}>
        <div style={{ 
          backgroundColor: '#fff', padding: '25px 15px', borderRadius: '16px', 
          boxShadow: '0 4px 25px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0'
        }}>
          
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
            alignItems: 'center', gap: '15px', marginBottom: '30px'
          }}>
            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: 'bold', borderLeft: '6px solid #f43f5e', paddingLeft: '12px', margin: 0 }}>
              24時間の気温変化 <small style={{ fontWeight: 'normal', fontSize: '0.8rem', color: '#64748b', display: 'block' }}>{yesterdayString}</small>
            </h3>
            
            <div style={{ 
              backgroundColor: '#ea580c', color: 'white', padding: '10px 18px', borderRadius: '12px', 
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>昨日の寒暖差</span>
              <span style={{ fontSize: '1.8rem', fontWeight: '900' }}>
                {chartData.length > 0 ? stats.diff : '--'}<small style={{fontSize: '1rem'}}>℃</small>
              </span>
            </div>
          </div>
          
          {/* グラフ領域 */}
          <div style={{ width: '100%', height: '400px' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {/* margin.right: 40 程度確保することで、右端のラベルがSVGから消えるのを防ぐ
                   margin.left: -20 程度にすることでY軸を隠した分の余白を詰める
                */}
                <AreaChart data={chartData} margin={{ top: 45, right: 40, left: -20, bottom: 5 }}>
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
                    minTickGap={35}
                  />
                  <YAxis domain={['dataMin - 6', 'dataMax + 6']} hide />
                  
                  {/* 点を選択した時に詳細を表示するツールチップ */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px', border: 'none',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      fontSize: '14px', fontWeight: 'bold'
                    }}
                    formatter={(value) => [`${value} ℃`, '気温']}
                  />

                  <ReferenceLine y={stats.max} stroke="#f43f5e" strokeWidth={1} strokeDasharray="4 4" />
                  <ReferenceLine y={stats.min} stroke="#0ea5e9" strokeWidth={1} strokeDasharray="4 4" />

                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#f43f5e" 
                    strokeWidth={4} 
                    fill="url(#tempGradient)"
                    isAnimationActive={false} // ラベルの表示ズレ防止
                    activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff', fill: '#f43f5e' }}
                    label={<CustomLabels />}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                データの取得に失敗したか、まだ存在しません。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CornProduct;