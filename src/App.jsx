import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import HomeManager from './pages/HomeManager';
import ServicesManager from './pages/ServicesManager';
import WhyUsManager from './pages/WhyUsManager';
import FooterManager from './pages/FooterManager';
import AboutManager from './pages/AboutManager';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="home" element={<HomeManager />} />
          <Route path="about" element={<AboutManager />} />
          <Route path="services" element={<ServicesManager />} />
          <Route path="why-us" element={<WhyUsManager />} />
          <Route path="footer" element={<FooterManager />} />
          <Route path="*" element={<div style={{padding: '2rem'}}><h2>Page Under Construction</h2></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
