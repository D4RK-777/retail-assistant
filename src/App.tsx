import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import Login from './pages/Login';
import OrganizationSetupPage from './pages/OrganizationSetupPage';
import Dashboard from './pages/Dashboard';
import KnowledgeBase from './pages/KnowledgeBase';
import AITrainingPage from './pages/AITraining';
import AIPersonalities from './pages/AIPersonalities';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/setup" 
            element={
              <ProtectedRoute requireAuth={true} requireOrg={false}>
                <OrganizationSetupPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireAuth={true} requireOrg={true}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/knowledge" 
            element={
              <ProtectedRoute requireAuth={true} requireOrg={true}>
                <KnowledgeBase />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/training" 
            element={
              <ProtectedRoute requireAuth={true} requireOrg={true}>
                <AITrainingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/personalities" 
            element={
              <ProtectedRoute requireAuth={true} requireOrg={true}>
                <AIPersonalities />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute requireAuth={true} requireOrg={true}>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
