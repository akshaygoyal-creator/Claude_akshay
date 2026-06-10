import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/shared/Navbar';
import { PageSpinner } from './components/shared/Spinner';
import { LoginPage }       from './pages/LoginPage';
import { EmployeePage }    from './pages/EmployeePage';
import { ManagerDashboard }from './pages/ManagerDashboard';
import { OpsDashboard }    from './pages/OpsDashboard';

const Guard = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/employee" replace />;
  return <>{children}</>;
};

const Root = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'MEAT_TECHNICIAN' ? '/employee' : '/manager'} replace />;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/"         element={<Root />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/employee" element={<Guard><EmployeePage /></Guard>} />
      <Route path="/manager"  element={<Guard roles={['STORE_MANAGER','SHIFT_SUPERVISOR']}><ManagerDashboard /></Guard>} />
      <Route path="/ops"      element={<Guard roles={['STORE_MANAGER','SHIFT_SUPERVISOR']}><OpsDashboard /></Guard>} />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
