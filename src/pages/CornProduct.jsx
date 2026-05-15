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
            fontSize: 'clamp(1.3rem, 5vw,