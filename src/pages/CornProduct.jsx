import React, { useMemo } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LabelList 
} from 'recharts';

const CornProduct = () => {
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  }, []);

  const { data, stats } = useSensorData(yesterday, yesterday);

  return (
    <div style={{ fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif', color: '#333', backgroundColor: '#fff' }}>
      
      {/* ヒーローセクション */}
      <div style={{ 
        position: 'relative', height: '500px', 
        // 修正：publicフォルダに画像を配置し、ベースパスを考慮したパス指定
        backgroundImage: 'url("./corn-hero.jpg")', 
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: '0 20px' }}>
          <h1 style={{
            color: '#ffffff',
            fontSize: '3.5rem',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            margin: 0,
            textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 0 3px 0 #000, 0 -3px 0 #000, 2px 0 0 #000, -3px 0 0 #000'
          }}>
            裏磐梯ゴールドラッシュ
          </h1>
          {/* 修正：margin-topを広げて間合いを調整 */}
          <p style={{ 
            color: '#fff', fontSize: '1.4rem', marginTop: '40px', fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            letterSpacing: '0.05em'
          }}>
            標高800mの寒暖差が育んだ、極上の甘み
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid #fbbf24', display: 'inline-block', paddingBottom: '10px' }}>
            美味しさの根拠：昨日の栽培データ
          </h2>
          <p style={{ color: '#666', marginTop: '10px' }}>計測日：{yesterday}</p>
        </div>

        <div style={{ backgroundColor: '#fdfdfd', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative' }}>
          {/* 修正：グラフ内に寒暖差を強調表示 */}
          <div style={{ 
            position: 'absolute', top: '20px', right: '40px', textAlign: 'right', zIndex: 10,
            backgroundColor: 'rgba(255,255,255,0.9)', padding: '10px 20px', borderRadius: '8px', border: '2px solid #ea580c'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#c2410c', fontWeight: 'bold' }}>昨日の寒暖差</div>
            <div style={{ fontSize: '2rem', color: '#ea580c', fontWeight: 'bold' }}>{stats.diff}<small style={{fontSize: '1rem'}}>℃</small></div>
          </div>

          <h3 style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#444' }}>気温の変化状況</h3>
          
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 40, right: 80, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                <Tooltip />
                
                {/* 修正：最高・最低気温のラインとラベル */}
                <ReferenceLine y={stats.max} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'right', value: `最高 ${stats.max}℃`, fill: '#f43f5e', fontSize: 14, fontWeight: 'bold' }} />
                <ReferenceLine y={stats.min} stroke="#0ea5e9" strokeDasharray="3 3" label={{ position: 'right', value: `最低 ${stats.min}℃`, fill: '#0ea5e9', fontSize: 14, fontWeight: 'bold' }} />

                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#f43f5e" 
                  strokeWidth={4} 
                  fill="url(#tempGradient)"
                  dot={(props) => {
                    const { payload, cx, cy } = props;
                    // 修正：最高と最低のポイントだけラベル（ドット）を表示
                    if (payload.temp === stats.max || payload.temp === stats.min) {
                      return <circle cx={cx} cy={cy} r={6} fill="#f43f5e" stroke="#fff" strokeWidth={2} />;
                    }
                    return null;
                  }}
                >
                  <LabelList 
                    dataKey="temp" 
                    content={(props) => {
                      const { x, y, value } = props;
                      // 修正：値が最高または最低の場合のみテキストラベルを表示
                      if (value === stats.max || value === stats.min) {
                        return <text x={x} y={y} dy={-15} fill="#f43f5e" fontSize={14} fontWeight="bold" textAnchor="middle">{value}℃</text>;
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
