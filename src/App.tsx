import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-toastify/dist/ReactToastify.css';
import Premium3DLogin from './components/Common/Premium3DLogin';
import Register from './pages/Register';
import { authService } from './services/auth';
import { DrugiAssistant } from './components/Drugi/DrugiAssistant';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SkeletonLoader from './components/Common/SkeletonLoader';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const PharmacistDashboard = lazy(() => import('./pages/PharmacistDashboard'));

// Configuración profesional del QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita peticiones innecesarias al cambiar de pestaña
      staleTime: 1000 * 60 * 5, // Los datos se consideran "frescos" por 5 minutos
      retry: 1, // Solo reintenta 1 vez si falla
    },
  },
});

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

// 🔐 Componente para redirigir según rol
const RoleBasedDashboard: React.FC = () => {
  const user = authService.getUser();
  
  if (user?.role === 'User') {
    return <UserDashboard />;
  } else if (user?.role === 'Pharmacist') {
    return <PharmacistDashboard />;
  } else if (user?.role === 'Admin') {
    return <AdminDashboard />;
  } else {
    // Redirigir a login y limpiar sesión preventivamente
    authService.logout();
    return <Navigate to="/login" replace />;
  }
};

// 🤖 Asistente: oculto solo en login y registro
const DrugiWrapper: React.FC = () => {
  const { pathname } = useLocation();
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  if (authRoutes.includes(pathname)) return null;
  return <DrugiAssistant />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer position="top-right" autoClose={3000} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Premium3DLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* 🔐 Rutas protegidas con Lazy Loading */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Suspense fallback={<SkeletonLoader />}>
                <RoleBasedDashboard />
              </Suspense>
            </PrivateRoute>
          } />
          <Route
            path="/user-dashboard"
            element={
              <PrivateRoute>
                <Suspense fallback={<SkeletonLoader />}>
                  <UserDashboard />
                </Suspense>
              </PrivateRoute>
            }
          />
          
          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
        {/* Asistente Virtual: oculto en login y registro */}
        <DrugiWrapper />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;