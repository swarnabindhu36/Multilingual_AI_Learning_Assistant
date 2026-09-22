import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TutorPage } from './pages/TutorPage';
import { QuizPage } from './pages/QuizPage';
import { TerminologyPage } from './pages/TerminologyPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProgressPage } from './pages/ProgressPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { MetricsPage } from './pages/MetricsPage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';

// Route guards
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { user, isLoading, loading } = useAuth();

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-sm">
        Initializing LinguaLearn...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/terminology" element={<TerminologyPage />} />

              {/* Authenticated Application */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tutor"
                element={
                  <ProtectedRoute>
                    <TutorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz"
                element={
                  <ProtectedRoute>
                    <QuizPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/conversations"
                element={
                  <ProtectedRoute>
                    <HistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute>
                    <ProgressPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evaluation"
                element={
                  <ProtectedRoute>
                    <EvaluationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evaluation/metrics"
                element={
                  <ProtectedRoute>
                    <MetricsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

