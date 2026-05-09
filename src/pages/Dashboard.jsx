import React, { useEffect } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, LabelList 
} from 'recharts';

const Dashboard = () => {
  const { data, loading, error, stats, startDate, endDate, setStartDate, setEndDate, fetchData } = useSensorData();

  // 初期表示時にヘッダーの開始・終了日をセットする
  useEffect(() => {
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
    if (!startDate) setStartDate(today);
    if (!endDate) setEndDate(today);
  }, [setStartDate, setEndDate, startDate, endDate]);

  if (loading && data.length === 0) return <div style={{ padding: '20px' }}>読み込み中...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>エラー: {error}</div>;

  // カスタムラベルコンポーネント (最高・最低点に丸と数値を表示)
  const renderCustomLabel = (props, color) => {
    const { x, y, value } = props;
    // 数値が統計の最大値または最小値と一致する場合のみ表示
    if (value === stats.max || value === stats.min) {
      return (
        <g>
          <circle cx={x} cy={y} r={5} fill={color} stroke="#fff" strokeWidth={2} />
          <text x={x} y={y} dy={-10} fill={color} fontSize={12} fontWeight="bold" textAnchor="middle">
            {value}
          </text>
        </g>
      );
    }
    return null;
  };

  const chartContainerStyle = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f5f5f5' }}>
      <h1 style={{ marginBottom: '20px' }}>栽培環境ダッシュボード</h1>
      
      {/* 検索ヘッダー */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <span>〜</span>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <button onClick={fetchData} style={{ padding: '8px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>更新</button>
      </div>

      {data.length === 0 ? (
        <p>データがありません。</p>
      ) : (
        <>
          {/* 1. 気温と湿度（既存） */}
          <div style={chartContainerStyle}>
            <h3>気温と湿度の推移</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" label={{ value: '気温 (℃)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: '湿度 (%)', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f43f5e" name="気温" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="humi" stroke="#0ea5e9" name="湿度" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. 気温（最高・最低表示付き） */}
          <div style={chartContainerStyle}>
            <h3>気温の詳細推移</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip />
                  <ReferenceLine y={stats.max} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: `最高 ${stats.max}℃`, position: 'right', fill: '#f43f5e' }} />
                  <ReferenceLine y={stats.min} stroke="#0ea5e9" strokeDasharray="3 3" label={{ value: `最低 ${stats.min}℃`, position: 'right', fill: '#0ea5e9' }} />
                  <Line type="monotone" dataKey="temp" stroke="#f43f5e" name="気温" strokeWidth={3} dot={(props) => renderCustomLabel(props, '#f43f5e')} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. 湿度 */}
          <div style={chartContainerStyle}>
            <h3>湿度の推移</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="humi" stroke="#0ea5e9" name="湿度" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. 気圧 */}
          <div style={chartContainerStyle}>
            <h3>気圧の推移</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="press" stroke="#8b5cf6" name="気圧" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
