import { useState, useEffect, useCallback } from 'react';

const GAS_URL = import.meta.env.VITE_GAS_URL;

export const useSensorData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]); // システムログの復活
  const [stats, setStats] = useState({ diff: 0, max: 0, min: 0 }); // 寒暖差の復活

  const getTodayJST = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  const [startDate, setStartDate] = useState(getTodayJST());
  const [endDate, setEndDate] = useState(getTodayJST());

  const fetchData = useCallback(async () => {
    if (!GAS_URL) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ start: startDate, end: endDate });
      const response = await fetch(`${GAS_URL}?${params.toString()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const rawData = await response.json();
      
      if (Array.isArray(rawData) && rawData.length > 0) {
        // 1. グラフ用データの整形
        const formattedData = rawData.map(item => ({
          time: String(item["日時"] || ""),
          weather: item["天気"] || "Clear",
          temp: item["気温"] != null ? parseFloat(item["気温"]) : null,
          humi: item["湿度"] != null ? parseFloat(item["湿度"]) : null,
          pres: item["気圧"] != null ? parseFloat(item["気圧"]) : null
        }));

        // 2. 昨日の寒暖差などの統計計算（復活）
        const temps = formattedData.map(d => d.temp).filter(t => t !== null);
        if (temps.length > 0) {
          const max = Math.max(...temps);
          const min = Math.min(...temps);
          setStats({ max, min, diff: (max - min).toFixed(1) });
        }

        // 3. システムログの生成（復活）
        const newLogs = rawData.slice(0, 5).map(item => 
          `[${item["日時"]}] データ受信: 気温${item["気温"]}℃ / 湿度${item["湿度"]}%`
        );
        setLogs(newLogs);
        
        setData(formattedData);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setLogs(prev => [`[Error] ${new Date().toLocaleTimeString()}: 通信失敗`, ...prev]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { 
    data, loading, startDate, setStartDate, endDate, setEndDate, 
    fetchData, logs, stats // 復活した変数を返却
  };
};
