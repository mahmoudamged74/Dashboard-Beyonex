import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HomeManager from './pages/HomeManager';
import ServicesManager from './pages/ServicesManager';
import WhyUsManager from './pages/WhyUsManager';
import FooterManager from './pages/FooterManager';
import AboutManager from './pages/AboutManager';
import Profile from './pages/Profile';
import RolesManager from './pages/RolesManager';
import Settings from './pages/Settings';
import MessagesManager from './pages/MessagesManager';
import AdminsManager from './pages/AdminsManager';

function App() {
  return (
    <BrowserRouter>
      {/* Global toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes — require token */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="home" element={<HomeManager />} />
          <Route path="about" element={<AboutManager />} />
          <Route path="services" element={<ServicesManager />} />
          <Route path="why-us" element={<WhyUsManager />} />
          <Route path="footer" element={<FooterManager />} />
          <Route path="profile" element={<Profile />} />
          <Route path="roles" element={<RolesManager />} />
          <Route path="admins" element={<AdminsManager />} />
          <Route path="settings" element={<Settings />} />
          <Route path="messages" element={<MessagesManager />} />
        </Route>

        {/* Fallback: any unknown path → login (if no token) or dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
