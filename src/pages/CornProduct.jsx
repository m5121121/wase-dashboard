import React from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const CornProduct = () => {
  const { data: sensorData } = useSensorData();

  const calculateDiff = () => {
    if (!sensorData || sensorData.length === 0) return 12.5;
    const temps = sensorData.map(d => d.temp);
    return Math.max(...temps) - Math.min(...temps);
  };

  const diff = calculateDiff();

  // スタイル設定（先ほど提供したものと同様）
  const styles = {
    wrapper: { fontFamily: "'Helvetica Neue', Arial, sans-serif", backgroundColor: '#fff' },
    hero: {
      position: 'relative', height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: 'url("https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=2000&auto=format&fit=crop")',
      backgroundSize: 'cover', backgroundPosition: 'center', color: '#fff'
    },
    heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))' },
    section: { padding: '80px 20px', maxWidth: '1000px', margin: '0 auto' }
  };

  return (
    <div style={styles.wrapper}>
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={{ zIndex: 10, textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900' }}>裏磐梯ゴールドラッシュ</h1>
          <p style={{ fontSize: '1.25rem' }}>標高800m、{diff.toFixed(1)}℃の寒暖差が育んだ極上の甘み</p>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '40px' }}>データが証明する品質</h2>
        <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '24px' }}>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer>
              <LineChart data={sensorData}>
                <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#f59e0b' }}>{diff.toFixed(1)}℃</div>
            <p>この寒暖差が糖度を凝縮させます。</p>
          </div>
        </div>
      </section>

      <footer style={{ ...styles.section, textAlign: 'center' }}>
        <button style={{ backgroundColor: '#166534', color: '#fff', padding: '20px 50px', borderRadius: '50px', border: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
          2026年度 予約案内を希望する
        </button>
      </footer>
    </div>
  );
};

export default CornProduct;
