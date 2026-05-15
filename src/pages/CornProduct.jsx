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
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', fontSize: '1.2rem', color: '#666' }}>
        昨日の栽培データを読み込み中...
      </div>
    );
  }

  return (
    <div style={{ 
      fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif', 
      color: '#333', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh' 
    }}>
      
      {/* ヒーローセクション */}
      <div style={{ 
        position: 'relative', height: '350px', 
        backgroundImage: `url("${heroImagePath}")`, 
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#444'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.15)' }} />
        
        <div style={{ textAlign: 'center', padding: '0 20px', zIndex: 1 }}>
          <h1 style={{
            color: '#000', 
            fontSize: 'clamp(1.8rem, 7vw, 3.8rem)', 
            fontWeight: '900',
            letterSpacing: '0.05em',
            margin: 0,
            textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 2px 0 0 #fff, -2px 0 0 #fff, 4px 4px 10px rgba(0,0,0,0.4)'
          }}>
            裏磐梯ゴールドラッシュ
          </h1>
          <p style={{ 
            color: '#fff', 
            fontSize: 'clamp(0.9rem, 4vw, 1.6rem)', 
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
          <h2 style={{ 
            fontSize: 'clamp(1.3rem, 5vw, 2.2rem)', 
            borderBottom: '3px solid #fbbf24', 
            display: 'inline-block', 
            paddingBottom: '8px', 
            fontWeight: 'bold', 
            margin: '0 0 10px 0' 
          }}>
            美味しさの根拠：昨日の栽培データ
          </h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
            計測日：{yesterdayString}
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#fff', 
          padding: '25px 15px', 
          borderRadius: '16px', 
          boxShadow: '0 4px 25px rgba(0,0,0,0.06)', 
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '35px',
            padding: '0 5px'
          }}>
            <h3 style={{ 
              fontSize: '1.2rem', 
              color: '#1e293b', 
              fontWeight: 'bold', 
              borderLeft: '6px solid #f43f5e', 
              paddingLeft: '12px',
              margin: 0
            }}>
              24時間の気温変化
            </h3>
            
            <div style={{ 
              backgroundColor: '#ea580c', 
              color: 'white', 
              padding: '10px 18px', 
              borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>昨日の寒暖差</span>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', lineHeight: '1' }}>
                {data.length > 0 ? stats.diff : '--'}<small style={{fontSize: '1rem', marginLeft: '2px'}}>℃</small>
              </span>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '400px' }}>
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 45, right: 25, left: 10, bottom: 5 }}>
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
                    tick={{fontSize: 11, fill: '#64748b', fontWeight: 'bold'}} 
                    dy={10} 
                  />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                  
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
                    <LabelList 
                      dataKey="temp" 
                      content={(props) => {
                        const { x, y, value, index } = props;
                        const isMax = value === stats.max;
                        const isMin = value === stats.min;

                        let textAnchor = "middle";
                        if (index > data.length - 5) textAnchor = "end";
                        if (index < 5) textAnchor = "start";

                        if (isMax) {
                          return (
                            <g key={`label-max-${index}`}>
                              <circle cx={x} cy={y} r={6} fill="#f43f5e" stroke="#fff" strokeWidth={2} />
                              <text 
                                x={x} y={y} dy={-20} 
                                fill="#f43f5e" fontSize={18} fontWeight="900" 
                                textAnchor={textAnchor}
                              >
                                最高 {value}℃
                              </text>
                            </g>
                          );
                        }
                        
                        if (isMin) {
                          return (
                            <g key={`label-min-${index}`}>
                              <circle cx={x} cy={y} r={6} fill="#0ea5e9" stroke="#fff" strokeWidth={2} />
                              <text 
                                x={x} y={y} dy={32} 
                                fill="#0ea5e9" fontSize={18} fontWeight="900" 
                                textAnchor={textAnchor}
                              >
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
              <div style={{ 
                height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '12px', 
                border: '1px dashed #cbd5e1', padding: '20px', textAlign: 'center' 
              }}>
                データが見つかりませんでした。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CornProduct;