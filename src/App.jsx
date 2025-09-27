import { BrowserRouter, Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import { ApiProvider } from './contexts/ApiContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import ShoppingHistory from './pages/ShoppingHistory';

function App() {
  return (
    <AuthProvider>
      <ApiProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Home />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            } />
            <Route path="/shopping-history" element={
              <ProtectedRoute>
                <ShoppingHistory />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </HashRouter>
      </ApiProvider>
    </AuthProvider>
  );
}

export default App;