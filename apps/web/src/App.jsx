import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './features/auth/authSlice';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Products from './pages/products/Products';
import Categories from './pages/categories/Categories';
import Orders from './pages/orders/Orders';
import Customers from './pages/customers/Customers';
import Inventory from './pages/inventory/Inventory';
import Analytics from './pages/analytics/Analytics';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useSelector(s => s.auth);
  if (!isAuthenticated && !localStorage.getItem('accessToken')) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      dispatch(getMe());
    }
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
