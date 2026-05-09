import { useState, useEffect, useCallback } from 'react';

const GAS_URL = import.meta.env.VITE_GAS_URL;

export const useSensorData = (initialStart, initialEnd) => {
  // デフォルト値を生成する関数（JSTベース）
  const getTodayJST = () => {
    const d = new Date();
    return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  };

  // 引数があればそれを使用し、なければ当日をデフォルトにする
  const [startDate, setStartDate] = useState(initialStart || getTodayJST());
  const [endDate, setEndDate] = useState(initialEnd || getTodayJST());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({ max: 0, min: 0, diff: 0 });

  const fetchData = useCallback(async () => {
    if (!GAS_URL) {
      console.warn("GAS_URL is not defined");
      return;
    }

    setLoading(true);
    try {
      // URLオブジェクトを使用してクエリパラメータを確実に構築
      const url = new URL(GAS_URL);
      url.searchParams.set('start', startDate);
      url.searchParams.set('end', endDate);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Network response was not ok');
      
      const rawData = await response.json();

      if (rawData.length > 0) {
        // 気温のみを抽出して統計計算
        const temps = rawData.map(d => d.temp);
        const max = Math.max(...temps);
        const min = Math.min(...temps);
        
        setStats({
          max: parseFloat(max.toFixed(2)),
          min: parseFloat(min.toFixed(2)),
          diff: parseFloat((max - min).toFixed(1))
        });
        
        // グラフ表示用に加工（秒をカットするなど）
        const formatted = rawData.map(d => ({
          ...d,
          time: d.time.split(' ')[1]?.substring(0, 5) || d.time
        }));
        setData(formatted);
      } else {
        setData([]);
        setStats({ max: 0, min: 0, diff: 0 });
      }
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, stats, setStartDate, setEndDate, fetchData };
};
