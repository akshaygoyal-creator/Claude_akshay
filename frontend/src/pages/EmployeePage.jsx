import React, { useState } from 'react';
import LoginScreen from '../components/employee/LoginScreen';
import CheckInScreen from '../components/employee/CheckInScreen';

export default function EmployeePage() {
  const [employee, setEmployee] = useState(null);
  const [loginMethod, setLoginMethod] = useState(null);

  const handleLogin = (emp, method) => {
    setEmployee(emp);
    setLoginMethod(method);
  };

  const handleLogout = () => {
    setEmployee(null);
    setLoginMethod(null);
  };

  if (!employee) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <CheckInScreen employee={employee} loginMethod={loginMethod} onLogout={handleLogout} />;
}
