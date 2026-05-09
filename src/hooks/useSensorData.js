import { useState, useEffect, useCallback } from 'react';

const GAS_URL = import.meta.env.VITE_GAS_URL;

export const useSensorData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 日本標準時(JST)での日付取得
  const getTodayJST = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Tokyo' });
  const [startDate, setStartDate] = useState(getTodayJST());
  const [endDate, setEndDate] = useState(getTodayJST());

  const fetchData = useCallback(async () => {
    // GAS_URLが未設定の場合は実行しない
    if (!GAS_URL) {
      console.warn("VITE_GAS_URL is not defined in .env");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ start: startDate, end: endDate });
      const response = await fetch(`${GAS_URL}?${params.toString()}`);
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const rawData = await response.json();
      
      if (Array.isArray(rawData) && rawData.length > 0) {
        const formattedData = rawData.map(item => ({
          time: String(item["日時"] || ""),
          weather: item["天気"] || "Clear",
          temp: item["気温"] != null ? parseFloat(item["気温"]) : null,
          humi: item["湿度"] != null ? parseFloat(item["湿度"]) : null,
          pres: item["気圧"] != null ? parseFloat(item["気圧"]) : null
        }));
        setData(formattedData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  return { 
    data, 
    loading, 
    startDate, 
    setStartDate, 
    endDate, 
    setEndDate, 
    fetchData 
  };
};
