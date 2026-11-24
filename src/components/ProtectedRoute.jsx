import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children }) {
  const { token } = useApp();
  return token ? children : <Navigate to='/login' />;
}