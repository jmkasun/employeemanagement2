import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Login from './components/Login';
import { User } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { Loader2 } from 'lucide-react';

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const CoreModules = lazy(() => import('./components/CoreModules'));
const EmployeeProfile = lazy(() => import('./components/EmployeeProfile'));
const AttendanceLogging = lazy(() => import('./components/AttendanceLogging'));
const LeaveManagement = lazy(() => import('./components/LeaveManagement'));
const PayrollManagement = lazy(() => import('./components/PayrollManagement'));
const ExpenseManagement = lazy(() => import('./components/ExpenseManagement'));
const Directory = lazy(() => import('./components/Directory'));
const Settings = lazy(() => import('./components/Settings'));
const AccountManagement = lazy(() => import('./components/AccountManagement'));

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
    <Loader2 className="w-10 h-10 text-primary animate-spin" />
    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest animate-pulse">Loading Module...</p>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('ems_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('ems_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ems_user');
  };

  if (loading) return null;

  return (
    <ThemeProvider>
      {!user ? (
        <>
          {(() => { document.title = 'EMS Master - Login'; return null; })()}
          <Login onLogin={handleLogin} />
        </>
      ) : (
        <Router>
          <Layout onLogout={handleLogout}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/modules" element={<CoreModules />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/directory/:id" element={<EmployeeProfile />} />
                <Route path="/attendance" element={<AttendanceLogging />} />
                <Route path="/leave" element={<LeaveManagement />} />
                <Route path="/payroll" element={<PayrollManagement />} />
                <Route path="/expenses" element={<ExpenseManagement />} />
                <Route path="/settings" element={user.role === 'standard' ? <Navigate to="/" replace /> : <Settings />} />
                <Route path="/accounts" element={user.role === 'super_admin' ? <AccountManagement /> : <Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      )}
    </ThemeProvider>
  );
}
