import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HomeManager from './pages/HomeManager';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="home" element={<HomeManager />} />
          <Route path="*" element={<div style={{padding: '2rem'}}><h2>Page Under Construction</h2></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
