import React, { useMemo } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, LabelList 
} from 'recharts';

const CornProduct = () => {
  const baseUrl = import.meta.env.BASE_URL || "/";
  const heroImagePath = `${baseUrl}corn-hero.jpg`;

  /**
   * 1. 「昨日」の日付を計算
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
   * 2. カスタムフックに「昨日」を注入
   */
  const { data, stats, loading } = useSensorData(yesterdayString, yesterdayString);

  // ローディング表示
  if (loading && data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '100px 20px', fontSize: '1.2rem', color: '#666' }}>昨日の栽培データを読み込み中...</div>;
  }

  return (
    <div style={{ fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif', color: '#333', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* ヒーローセクション */}
      <div style={{ 
        position: 'relative', height: '350px', 
        backgroundImage: `url("${heroImagePath}")`, 
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#444'
      }}>
        {/* 背景の視認性を上げるオーバーレイ */}
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)' }} />
        
        <div style={{ textAlign: 'center', padding: '0 20px', zIndex: 1 }}>
          <h1 style={{
            color: '#000', 
            fontSize: 'clamp(2rem, 8vw, 3.8rem)', // 画面幅に合わせて自動縮小
            fontWeight: '900',
            letterSpacing: '0.05em',
            margin: 0,
            textShadow: `
              2px 2px 0 #fff, -2px -2px 0 #fff, 
              2px -2px 0 #fff, -2px 2px 0 #fff,
              0 2px 0 #fff, 0 -2px 0 #fff, 
              2px 0 0 #fff, -2px 0 0 #fff,
              4px 4px 10px rgba(0,0,0,0.4)
            `
          }}>
            裏磐梯ゴールドラッシュ
          </h1>
          <p style={{ 
            color: '#fff', 
            fontSize: 'clamp(1rem, 4vw, 1.6rem)', 
            marginTop: '20px', 
            fontWeight: '800',
            textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
            letterSpacing: '0.05em'
          }}>
            標高800mの寒暖差が育んだ、極上の甘み
          </p>
        </div>
      </div>

      {/* データセクション */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 10px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', borderBottom: '3px solid #fbbf24', display: 'inline-block', paddingBottom: '8px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
            美味しさの根拠：昨日の栽培データ
          </h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>計測日：{yesterdayString}</p>
        </div>

        <div style={{ 
          backgroundColor: '#fff', 
          padding: '20px 10px', // スマホ用に横パディングを最小限に
          borderRadius: '16px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          
          {/* ヘッダー・バッジ領域（Flexboxでレスポンシブ化、被りを防止） */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '30px',
            padding: '0 10px'
          }}>
            <h3 style={{ 
              fontSize: '1.2rem', 
              color: '#1e293b', 
              fontWeight: 'bold', 
              borderLeft: '6px solid #f43f5e', 
              paddingLeft: '12px',
              margin: 0,
              flex: '1 1 200px' // 横幅が狭まると自動で折り返し
            }}>
              24時間の気温変化
            </h3>
            
            {/* 寒暖差バッジ */}
            <div style={{ 
              backgroundColor: '#ea580c', 
              color: 'white', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>昨日の寒暖差</span>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', lineHeight: '1' }}>
                {data.length > 0 ? stats.diff : '--'}<small style={{fontSize: '1rem', marginLeft: '2px'}}>℃</small>
              </span>
            </div>
          </div>
          
          {/* グラフ表示エリア（横幅いっぱいに拡大） */}
          <div style={{ width: '100%', height: '380px' }}>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {/* グラフ左右のマージンを10に縮小して横幅を確保 */}
                <AreaChart data={data} margin={{ top: 35, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={true} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} 
                    dy={10} 
                  />
                  {/* YAxisは非表示のまま、上下のバッファを設定 */}
                  <YAxis domain={['dataMin - 4', 'dataMax + 4']} hide />
                  
                  {/* 補助線（ガイド用の線のみ残し、はみ出るテキストラベルは削除） */}
                  <ReferenceLine y={stats.max} stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" />
                  <ReferenceLine y={stats.min} stroke="#0ea5e9" strokeWidth={1.5} strokeDasharray="4 4" />

                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#f43f5e" 
                    strokeWidth={4} 
                    fill="url(#tempGradient)"
                    animationDuration={1200}
                  >
                    {/* 最高・最低ラベルをグラフ内に統合＆上下のレイアウト切り分け */}
                    <LabelList 
                      dataKey="temp" 
                      content={(props) => {
                        const { x, y, value } = props;
                        const isMax = value === stats.max;
                        const isMin = value === stats.min;

                        if (isMax) {
                          return (
                            <g key={`label-max-${x}`}>
                              <circle cx={x} cy={y} r={6} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
                              {/* 最高気温はドットの上に配置 */}
                              <text x={x} y={y} dy={-15} fill="#f43f5e" fontSize={14} fontWeight="900" textAnchor="middle">
                                最高 {value}℃
                              </text>
                            </g>
                          );
                        }
                        
                        if (isMin) {
                          return (
                            <g key={`label-min-${x}`}>
                              <circle cx={x} cy={y} r={6} fill="#0ea5e9" stroke="#fff" strokeWidth={2} />
                              {/* 最低気温はドットの下（dyをプラス）に配置 */}
                              <text x={x} y={y} dy={25} fill="#0ea5e9" fontSize={14} fontWeight="900" textAnchor="middle">
                                最低 {value}℃
                              </text>
                            </g>
                          );
                        }
                        return null;
                      }} 
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', padding: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                指定された日付（{yesterdayString}）のデータが見つかりませんでした。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CornProduct;