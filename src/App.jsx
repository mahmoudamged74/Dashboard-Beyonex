import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./Styles/toast.css";

import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Routing/ProtectedRoute";
import PermissionRoute from "./components/Routing/PermissionRoute";
import { RouteFallback, SectionSkeleton } from "./components/Loading";
import AppToastContainer from "./components/Toast/AppToastContainer";
import DocumentFavicon from "./components/DocumentFavicon/DocumentFavicon";
import DocumentTitle from "./components/DocumentTitle/DocumentTitle";
import { ThemeProvider } from "./context/ThemeContext";
import { isInitialLoad } from "./utils/appShell";

const Login = lazy(() => import("./pages/Login/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));

const HomeManager = lazy(() => import("./pages/HomeManager/HomeManager"));
const ServicesManager = lazy(
  () => import("./pages/ServicesManager/ServicesManager"),
);
const WhyUsManager = lazy(() => import("./pages/WhyUsManager/WhyUsManager"));
const AboutManager = lazy(() => import("./pages/AboutManager/AboutManager"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const RolesManager = lazy(() => import("./pages/RolesManager/RolesManager"));
const Settings = lazy(() => import("./pages/Settings/Settings"));
const MessagesManager = lazy(
  () => import("./pages/MessagesManager/MessagesManager"),
);
const AdminsManager = lazy(() => import("./pages/AdminsManager/AdminsManager"));
const PartnersManager = lazy(
  () => import("./pages/PartnersManager/PartnersManager"),
);

function LazyPage({ children, fallback = <RouteFallback /> }) {
  const suspenseFallback = isInitialLoad() ? null : fallback;
  return <Suspense fallback={suspenseFallback}>{children}</Suspense>;
}

function AppRoutes() {
  return (
    <>
      <DocumentFavicon />
      <DocumentTitle />
      <AppToastContainer />

      <Routes>
        <Route
          path="/login"
          element={
            <LazyPage>
              <Login />
            </LazyPage>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <LazyPage>
                <Dashboard />
              </LazyPage>
            }
          />

          <Route
            path="home"
            element={
              <LazyPage>
                <PermissionRoute permKey="hero_section.view">
                  <HomeManager />
                </PermissionRoute>
              </LazyPage>
            }
          />

          <Route
            path="about"
            element={
              <LazyPage fallback={<SectionSkeleton count={3} />}>
                <PermissionRoute permKey="about_page.view">
                  <AboutManager />
                </PermissionRoute>
              </LazyPage>
            }
          />

          <Route
            path="services"
            element={
              <LazyPage>
                <PermissionRoute permKey="services.view">
                  <ServicesManager />
                </PermissionRoute>
              </LazyPage>
            }
          />

          <Route
            path="why-us"
            element={
              <LazyPage>
                <PermissionRoute permKey="why_us.view">
                  <WhyUsManager />
                </PermissionRoute>
              </LazyPage>
            }
          />

          <Route
            path="partners"
            element={
              <LazyPage>
                <PermissionRoute permKey="partners.view">
                  <PartnersManager />
                </PermissionRoute>
              </LazyPage>
            }
          />

          <Route
            path="profile"
            element={
              <LazyPage>
                <PermissionRoute permKey="profile.view">
                  <Profile />
                </PermissionRoute>
              </LazyPage>
            }
          />

          <Route
            path="roles"
            element={
              <LazyPage>
                <PermissionRoute permKey="roles.view">
                  <RolesManager />
                </PermissionRoute>
              </LazyPage>
            }
          />

          <Route
            path="admins"
            element={
              <LazyPage>
                <PermissionRoute permKey="admins.view">
                  <AdminsManager />
                </PermissionRoute>
              </LazyPage>
            }
          />

          <Route
            path="settings"
            element={
              <LazyPage>
                <PermissionRoute permKey="settings.view">
                  <Settings />
                </PermissionRoute>
              </LazyPage>
            }
          />

          <Route
            path="messages"
            element={
              <LazyPage>
                <PermissionRoute permKey="messages.view">
                  <MessagesManager />
                </PermissionRoute>
              </LazyPage>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
