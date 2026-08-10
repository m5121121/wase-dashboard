// useSensorData.js の fetchData 内（抜粋）

if (rawData.length > 0) {
  // null や undefined を除外して数値データのみを抽出
  const temps = rawData.map(d => d.temp).filter(t => typeof t === 'number' && !isNaN(t));
  
  if (temps.length > 0) {
    const max = Math.max(...temps);
    const min = Math.min(...temps);
    
    setStats({
      max: parseFloat(max.toFixed(1)),
      min: parseFloat(min.toFixed(1)),
      diff: parseFloat((max - min).toFixed(1))
    });
  } else {
    setStats({ max: 0, min: 0, diff: 0 });
  }
  
  // グラフ表示用に時刻文字列（HH:mm）へ変換
  const formatted = rawData.map(d => ({
    ...d,
    time: d.time ? (d.time.includes(' ') ? d.time.split(' ')[1].substring(0, 5) : d.time) : ''
  }));
  setData(formatted);
} else {
  setData([]);
  setStats({ max: 0, min: 0, diff: 0 });
}