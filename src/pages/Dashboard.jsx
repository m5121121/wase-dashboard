import React, { useEffect } from 'react';
import { useSensorData } from '../hooks/useSensorData';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, LabelList 
} from 'recharts';

const Dashboard = () => {
  // initialStart, initialEnd に当日を渡す
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  const { data, loading, error, stats, startDate, endDate, setStartDate, setEndDate, fetchData } = useSensorData(today, today);

  // 初期表示時にヘッダーの入力欄に日付をセット
  useEffect(() => {
    if (!startDate) setStartDate(today);
    if (!endDate) setEndDate(today);
  }, [setStartDate, setEndDate, startDate, endDate, today]);

  if (loading && data.length === 0) return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>エラー: {error}</div>;

  // 最高・最低点にラベルを表示するカスタム関数
  const renderPointLabel = (props, color) => {
    const { x, y, value } = props;
    if (value === stats.max || value === stats.min) {
      return (
        <g>
          <circle cx={x} cy={y} r={6} fill={color} stroke="#fff" strokeWidth={2} />
          <text x={x} y={y} dy={-15} fill={color} fontSize={14} fontWeight="bold" textAnchor="middle">
            {value}℃
          </text>
        </g>
      );
    }
    return null;
  };

  const cardStyle = {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    marginBottom: '30px',
    border: '1px solid #e2e8f0'
  };

  const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '20px',
    borderLeft: '4px solid #3b82f6',
    paddingLeft: '12px'
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '30px' }}>栽培環境ダッシュボード</h1>
      
      {/* 期間選択ヘッダー */}
      <div style={{ 
        display: 'flex', gap: '15px', marginBottom: '40px', alignItems: 'center', 
        backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: '500', color: '#64748b' }}>期間:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} 
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
          <span style={{ color: '#94a3b8' }}>〜</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} 
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
        </div>
        <button onClick={fetchData} style={{ 
          padding: '8px 24px', backgroundColor: '#3b82f6', color: '#fff', 
          border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s'
        }}>
          データ更新
        </button>
      </div>

      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '12px', color: '#64748b' }}>
          対象期間のデータが見つかりませんでした。
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          
          {/* 1. 気温と湿度（混合） */}
          <div style={cardStyle}>
            <h3 style={titleStyle}>気温と湿度の推移</h3>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{fill: '#64748b', fontSize: 12}} axisLine={{stroke: '#cbd5e1'}} />
                  <YAxis yAxisId="left" tick={{fill: '#64748b'}} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{fill: '#64748b'}} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="top" height={36}/>
                  <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f43f5e" name="気温 (℃)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="humi" stroke="#0ea5e9" name="湿度 (%)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. 気温（最高・最低強調） */}
          <div style={cardStyle}>
            <h3 style={titleStyle}>気温の詳細（最高・最低地点）</h3>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 30, right: 60, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{fill: '#64748b'}} hide />
                  <Tooltip />
                  <ReferenceLine y={stats.max} stroke="#f43f5e" strokeDasharray="3 3" />
                  <ReferenceLine y={stats.min} stroke="#0ea5e9" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="temp" stroke="#f43f5e" name="気温" strokeWidth={4} 
                    dot={(props) => renderPointLabel(props, '#f43f5e')} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px' }}>
            {/* 3. 湿度 */}
            <div style={cardStyle}>
              <h3 style={titleStyle}>湿度の推移</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" tick={{fontSize: 12}} />
                    <YAxis domain={[0, 100]} tick={{fontSize: 12}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="humi" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. 気圧 */}
            <div style={cardStyle}>
              <h3 style={titleStyle}>気圧の推移</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" tick={{fontSize: 12}} />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{fontSize: 12}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="press" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;
