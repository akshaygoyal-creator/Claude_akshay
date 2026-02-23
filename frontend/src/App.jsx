import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import EmployeePage from './pages/EmployeePage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import OpsDashboardPage from './pages/OpsDashboardPage';
import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/employee/*" element={<EmployeePage />} />
        <Route path="/manager/*" element={<ManagerDashboardPage />} />
        <Route path="/ops/*" element={<OpsDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
