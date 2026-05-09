import React, { useMemo } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LabelList 
} from 'recharts';

const CornProduct = () => {
  const baseUrl = import.meta.env.BASE_URL || "/";
  const heroImagePath = `${baseUrl}corn-hero.jpg`;

  // 1. 「昨日」の日付(YYYY-MM-DD)を確実に計算
  const yesterdayString = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // 2. カスタムフックに初期値として「昨日」を注入
  // これにより、初回リクエストのパラメータが start=2026-05-09 となる
  const { data, stats, loading } = useSensorData(yesterdayString, yesterdayString);

  if (loading && data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>データを読み込み中...</div>;
  }

  return (
    <div style={{ fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif', color: '#333', backgroundColor: '#fff' }}>
      
      {/* ヒーローセクション */}
      <div style={{ 
        position: 'relative', height: '500px', 
        backgroundImage: `url("${heroImagePath}")`, 
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#444'
      }}>
        <div style={{ textAlign: 'center', padding: '0 20px', zIndex: 1 }}>
          <h1 style={{
            color: '#000', 
            fontSize: '3.8rem',
            fontWeight: '900',
            letterSpacing: '0.1em',
            margin: 0,
            textShadow: `
              3px 3px 0 #fff, -3px -3px 0 #fff, 
              3px -3px 0 #fff, -3px 3px 0 #fff,
              0 3px 0 #fff, 0 -3px 0 #fff, 
              3px 0 0 #fff, -3px 0 0 #fff,
              4px 4px 10px rgba(0,0,0,0.3)
            `
          }}>
            裏磐梯ゴールドラッシュ
          </h1>
          <p style={{ 
            color: '#fff', fontSize: '1.6rem', marginTop: '45px', fontWeight: '800',
            textShadow: '2px 2px 8px rgba(0,0,0,1)',
            letterSpacing: '0.1em'
          }}>
            標高800mの寒暖差が育んだ、極上の甘み
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2.2rem', borderBottom: '3px solid #fbbf24', display: 'inline-block', paddingBottom: '10px', fontWeight: 'bold' }}>
            美味しさの根拠：昨日の栽培データ
          </h2>
          <p style={{ color: '#444', marginTop: '15px', fontSize: '1.1rem', fontWeight: 'bold' }}>計測日：{yesterdayString}</p>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '50px 40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', position: 'relative', border: '1px solid #eee' }}>
          
          {/* 昨日の寒暖差バッジ */}
          <div style={{ 
            position: 'absolute', top: '-20px', right: '40px', textAlign: 'right', zIndex: 10,
            backgroundColor: '#ea580c', color: 'white', padding: '15px 25px', borderRadius: '12px', 
            boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)'
          }}>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '5px' }}>昨日の寒暖差</div>
            <div style={{ fontSize: '2.8rem', fontWeight: '900', lineHeight: '1' }}>{stats.diff}<small style={{fontSize: '1.2rem', marginLeft: '4px'}}>℃</small></div>
          </div>

          <h3 style={{ fontSize: '1.4rem', marginBottom: '40px', color: '#1e293b', fontWeight: 'bold', borderLeft: '6px solid #f43f5e', paddingLeft: '15px' }}>
            24時間の気温変化
          </h3>
          
          <div style={{ width: '100%', height: '450px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 40, right: 100, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
                <XAxis dataKey="time" axisLine={true} tickLine={false} tick={{fontSize: 14, fill: '#444', fontWeight: 'bold'}} dy={10} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                
                <ReferenceLine y={stats.max} stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" 
                  label={{ position: 'right', value: `最高 ${stats.max}℃`, fill: '#f43f5e', fontSize: 18, fontWeight: '900', dx: 10 }} 
                />
                <ReferenceLine y={stats.min} stroke="#0ea5e9" strokeWidth={2} strokeDasharray="5 5" 
                  label={{ position: 'right', value: `最低 ${stats.min}℃`, fill: '#0ea5e9', fontSize: 18, fontWeight: '900', dx: 10 }} 
                />

                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#f43f5e" 
                  strokeWidth={5} 
                  fill="url(#tempGradient)"
                  animationDuration={1500}
                >
                  <LabelList 
                    dataKey="temp" 
                    content={(props) => {
                      const { x, y, value } = props;
                      if (value === stats.max || value === stats.min) {
                        return (
                          <g>
                            <circle cx={x} cy={y} r={8} fill="#f43f5e" stroke="#fff" strokeWidth={3} />
                            <text x={x} y={y} dy={-20} fill="#1e293b" fontSize={20} fontWeight="900" textAnchor="middle">
                              {value}℃
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CornProduct;
