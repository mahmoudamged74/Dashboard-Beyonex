import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PermissionRoute from './components/PermissionRoute';

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
    <AuthProvider>
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

            <Route
              path="home"
              element={
                <PermissionRoute permKey="hero_section.view">
                  <HomeManager />
                </PermissionRoute>
              }
            />

            <Route
              path="about"
              element={
                <PermissionRoute permKey="about_page.view">
                  <AboutManager />
                </PermissionRoute>
              }
            />

            <Route
              path="services"
              element={
                <PermissionRoute permKey="services.view">
                  <ServicesManager />
                </PermissionRoute>
              }
            />

            <Route
              path="why-us"
              element={
                <PermissionRoute permKey="why_us.view">
                  <WhyUsManager />
                </PermissionRoute>
              }
            />

            <Route
              path="footer"
              element={
                <FooterManager />
              }
            />

            <Route
              path="profile"
              element={
                <PermissionRoute permKey="profile.view">
                  <Profile />
                </PermissionRoute>
              }
            />

            <Route
              path="roles"
              element={
                <PermissionRoute permKey="roles.view">
                  <RolesManager />
                </PermissionRoute>
              }
            />

            <Route
              path="admins"
              element={
                <PermissionRoute permKey="admins.view">
                  <AdminsManager />
                </PermissionRoute>
              }
            />

            <Route
              path="settings"
              element={
                <PermissionRoute permKey="settings.view">
                  <Settings />
                </PermissionRoute>
              }
            />

            <Route
              path="messages"
              element={
                <PermissionRoute permKey="messages.view">
                  <MessagesManager />
                </PermissionRoute>
              }
            />
          </Route>

          {/* Fallback: any unknown path → dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
