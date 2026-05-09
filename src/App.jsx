import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CornProduct from './pages/CornProduct';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* /admin で管理画面へ */}
        <Route path="/admin" element={<Dashboard />} />
        
        {/* /products/corn で商品ページへ */}
        <Route path="/products/corn" element={<CornProduct />} />
        
        {/* TOPはとりあえず商品ページに */}
        <Route path="/" element={<CornProduct />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
