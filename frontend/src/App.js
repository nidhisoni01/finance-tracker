import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import OAuthSuccess from './pages/OAuthSuccess';

function MainLayout() {
  const [activeSection, setActiveSection] = useState('dashboard');
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black">
      <Sidebar onSectionChange={setActiveSection} activeSection={activeSection} />
      <main className="flex-1 p-8 overflow-y-auto">
        {activeSection === 'dashboard' && <Dashboard onNavigate={setActiveSection} />}
        {activeSection === 'reports' && <Reports />}
        {activeSection === 'settings' && <Settings />}
        {activeSection === 'profile' && <Profile />}
      </main>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!token ? <Register /> : <Navigate to="/" replace />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
