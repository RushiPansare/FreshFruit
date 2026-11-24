import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function AdminRoute({ children }) {
  const { token, user } = useApp();
  if (!token) return <Navigate to='/login' />;
  if (!user) return <p className='page'>Loading...</p>;
  return user.is_admin ? children : <Navigate to='/home' />;
}