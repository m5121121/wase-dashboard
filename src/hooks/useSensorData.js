import { useState, useEffect, useCallback } from "react";

/**
 * GAS（Google Apps Script）から観測データを取得するカスタムフック
 * 
 * @param {string} startDate - 開始日 (例: "2026-08-01")
 * @param {string} endDate   - 終了日 (例: "2026-08-11")
 * @returns {{ data: Array, loading: boolean, error: Error|null, refetch: Function }}
 */
export function useSensorData(startDate, endDate) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 環境変数からGASエンドポイントを取得 (なければフォールバック用URL)
  const gasUrl = import.meta.env.VITE_GAS_URL || "";

  const fetchData = useCallback(async () => {
    if (!gasUrl) {
      console.warn("VITE_GAS_URL is not defined in environment variables.");
      setLoading(false);
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
      setData(json);
    } catch (err) {
      console.error("Failed to fetch sensor data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [gasUrl, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}