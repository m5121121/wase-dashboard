import { useState, useEffect, useCallback, useMemo } from "react";

/**
 * GASまたは気象庁連携APIから観測データを取得するカスタムフック
 */
export function useSensorData(initialStartDate, initialEndDate) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const gasUrl = import.meta.env.VITE_GAS_URL || "";

  // データ取得関数（日付を引数で受け取り可能に）
  const fetchData = useCallback(async (startDate, endDate) => {
    if (!gasUrl) {
      console.warn("VITE_GAS_URL is not defined in environment variables.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append("start", startDate);
      if (endDate) queryParams.append("end", endDate);

      const response = await fetch(`${gasUrl}?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      // 配列要素が { time: "12:00", temp: 22.5, humi: 60 } の形になるよう担保
      // (GAS側のキー名が異なる場合はここでマッピングしてください)
      const formattedData = json.map(item => ({
        time: item.time || item.datetime || "",
        temp: item.temp !== undefined ? Number(item.temp) : null,
        humi: item.humi !== undefined ? Number(item.humi) : null,
      }));

      setData(formattedData);
    } catch (err) {
      console.error("Failed to fetch weather/sensor data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [gasUrl]);

  // 初回ロード
  useEffect(() => {
    if (initialStartDate && initialEndDate) {
      fetchData(initialStartDate, initialEndDate);
    }
  }, [initialStartDate, initialEndDate, fetchData]);

  // 取得したdataから最高気温・最低気温・寒暖差(stats)を自動計算
  const stats = useMemo(() => {
    const validTemps = data
      .map((d) => d.temp)
      .filter((t) => t !== null && !isNaN(t));

    if (validTemps.length === 0) {
      return { max: "--", min: "--", diff: "--" };
    }

    const max = Math.max(...validTemps);
    const min = Math.min(...validTemps);
    const diff = (max - min).toFixed(1);

    return {
      max: max.toFixed(1),
      min: min.toFixed(1),
      diff: diff,
    };
  }, [data]);

  return {
    data,
    stats,
    loading,
    error,
    fetchData,
  };
}