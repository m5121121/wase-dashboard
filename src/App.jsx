import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CornProduct from './pages/CornProduct';

function App() {
  // Viteの環境変数を使用して、開発環境と本番環境(GitHub Pages)でパスを切り替え
  const basename = import.meta.env.DEV ? "/" : "/wase-dashboard";

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* TOPページ（商品ページを表示） */}
        <Route path="/" element={<CornProduct />} />
        
        {/* とうもろこし（ゴールドラッシュ）専用ページ */}
        <Route path="/products/corn" element={<CornProduct />} />
        
        {/* 管理用ダッシュボード */}
        <Route path="/admin" element={<Dashboard />} />

        {/* 404/不正パス対応: TOPへリダイレクト */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
