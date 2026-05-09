import React, { useMemo } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LabelList 
} from 'recharts';

const CornProduct = () => {
  // 1. 日付を「昨日」に設定するロジック
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  }, []);

  // 初期表示を昨日に固定してデータ取得
  const { data, stats } = useSensorData(yesterday, yesterday);

  return (
    <div style={{ fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif', color: '#333', backgroundColor: '#fff' }}>
      
      {/* ヒーローセクション */}
      <div style={{ 
        position: 'relative', height: '500px', 
        backgroundImage: 'url("/api/placeholder/1200/500")', // 実際の画像パスへ適宜変更してください
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: '0 20px' }}>
          {/* 修正ポイント：白縁で見やすくしたタイトル */}
          <h1 style={{
            color: '#ffffff',
            fontSize: '3.5rem',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            margin: 0,
            textShadow: `
              3px 3px 0 #000, -3px -3px 0 #000, 
              3px -3px 0 #000, -3px 3px 0 #000, 
              0 3px 0 #000, 0 -3px 0 #000, 
              3px 0 0 #000, -3px 0 0 #000,
              4px 4px 10px rgba(0,0,0,0.5)
            `
          }}>
            裏磐梯ゴールドラッシュ
          </h1>
          <p style={{ 
            color: '#fff', fontSize: '1.2rem', marginTop: '20px', fontWeight: '500',
            textShadow: '1px 1px 4px rgba(0,0,0,0.8)' 
          }}>
            標高800mの寒暖差が育んだ、極上の甘み
          </p>
        </div>
      </div>

      {/* エビデンスセクション */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid #fbbf24', display: 'inline-block', paddingBottom: '10px' }}>
            美味しさの根拠：昨日の栽培データ
          </h2>
          <p style={{ color: '#666', marginTop: '10px' }}>
            計測日：{yesterday}（裏磐梯農園内センサー）
          </p>
        </div>

        {/* 寒暖差表示 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '50px' }}>
          <div style={statBoxStyle}>
            <span style={statLabelStyle}>最高気温</span>
            <span style={statValueStyle}>{stats.max}<small style={{fontSize: '1rem'}}>℃</small></span>
          </div>
          <div style={{...statBoxStyle, backgroundColor: '#fff7ed', border: '2px solid #ea580c'}}>
            <span style={{...statLabelStyle, color: '#c2410c'}}>昨日の寒暖差</span>
            <span style={{...statValueStyle, color: '#ea580c'}}>{stats.diff}<small style={{fontSize: '1rem'}}>℃</small></span>
          </div>
          <div style={statBoxStyle}>
            <span style={statLabelStyle}>最低気温</span>
            <span style={statValueStyle}>{stats.min}<small style={{fontSize: '1rem'}}>℃</small></span>
          </div>
        </div>

        {/* 修正ポイント：ビジュアルを改善した気温グラフ */}
        <div style={{ backgroundColor: '#fdfdfd', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#444' }}>24時間の気温変化</h3>
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                <YAxis domain={['dataMin - 3', 'dataMax + 3']} hide /> {/* 高低差を強調するため非表示＆範囲最適化 */}
                <Tooltip 
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value} ℃`, '気温']}
                />
                
                {/* 最高/最低のラインを引いて「何度から何度か」を強調 */}
                <ReferenceLine y={stats.max} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'right', value: `最高 ${stats.max}℃`, fill: '#f43f5e', fontSize: 12 }} />
                <ReferenceLine y={stats.min} stroke="#0ea5e9" strokeDasharray="3 3" label={{ position: 'right', value: `最低 ${stats.min}℃`, fill: '#0ea5e9', fontSize: 12 }} />

                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#f43f5e" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#tempGradient)"
                  dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                >
                  {/* 主要な点に数値を直接表示 */}
                  <LabelList dataKey="temp" position="top" offset={10} style={{ fill: '#f43f5e', fontSize: '11px', fontWeight: 'bold' }} />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginTop: '15px' }}>
            この急激な気温の変化が、とうもろこしの糖分をぎゅっと閉じ込めます。
          </p>
        </div>
      </div>
    </div>
  );
};

// スタイル定義
const statBoxStyle = {
  flex: 1,
  padding: '20px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
};

const statLabelStyle = {
  fontSize: '0.9rem',
  color: '#64748b',
  marginBottom: '8px',
  fontWeight: '600'
};

const statValueStyle = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#1e293b',
  lineHeight: 1
};

export default CornProduct;
