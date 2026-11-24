import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

const items = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/products', label: 'Products', icon: '🍎' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/customers', label: 'Customers', icon: '👥' },
  { to: '/admin/reviews', label: 'Reviews', icon: '⭐' },
];

export default function AdminLayout() {
  const { user, logout } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className='adm'>
      <aside className='adm-side'>
        <div className='adm-brand'>🍎 FreshFruits<small>Admin Panel</small></div>
        {items.map((i) => (
          <NavLink
            key={i.to}
            to={i.to}
            end={i.end}
            className={({ isActive }) => (isActive ? 'adm-link active' : 'adm-link')}
          >
            {i.icon} {i.label}
          </NavLink>
        ))}
        <Link to='/home' className='adm-link' style={{ marginTop: 'auto' }}>🛍 View Store</Link>
      </aside>

      <div className='adm-main'>
        <div className='adm-top'>
          <b>Welcome, {user ? user.name : 'Admin'}</b>
          <button className='btn-outline' style={{ margin: 0 }} onClick={handleLogout}>Logout</button>
        </div>
        <div className='adm-content'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}